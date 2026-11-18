-- #1 RentalItem table (replacing GearItems and including Topos)

create type "public"."rental_item_type" as enum ('topo', 'gear');

create table "public"."RentalItems" (
  "id" uuid not null default gen_random_uuid() primary key,
  "created_at" timestamp with time zone not null default now(),
  "name" text not null,
  "deposit_fee" smallint not null,
  "item_type" rental_item_type not null,
  "tmp_ref" uuid not null
);
comment on table "public"."RentalItems" is 'All items that can be rented, including gear and topos';
alter table "public"."RentalItems" enable row level security;

-- Migrate Topos to RentalItems
insert into "public"."RentalItems" (name, deposit_fee, item_type, tmp_ref)
select format('%s (%s)', t.title, t.year_published), 500, 'topo', t.id
from "public"."Topos" t
where t.year_published is not null;

insert into "public"."RentalItems" (name, deposit_fee, item_type, tmp_ref)
select t.title, 500, 'topo', t.id
from "public"."Topos" t
where t.year_published is null;

-- Migrate GearItems to RentalItems
insert into "public"."RentalItems" (id, name, deposit_fee, item_type, tmp_ref)
select g.id,g.name, g.deposit_fee, 'gear', g.id
from "public"."GearItems" g;

-- Add rental_item_id column to Inventory and link to RentalItem
alter table "public"."Inventory" add column "rental_item_id" uuid;
alter table "public"."Inventory" add constraint "Inventory_rental_item_id_fkey" FOREIGN KEY (rental_item_id) REFERENCES public."RentalItems"(id) not valid;
alter table "public"."Inventory" validate constraint "Inventory_rental_item_id_fkey";

update "public"."Inventory" i
set "rental_item_id" = ri.id
from "public"."RentalItems" ri
where ri.tmp_ref = i.id and ri.item_type = 'topo';

update "public"."Inventory" i
set "rental_item_id" = ri.id
from "public"."RentalItems" ri
where (exists(select 1 from "public"."GearInventory" gi where gi.gear_item_id = ri.tmp_ref and gi.id = i.id)) and ri.item_type = 'gear';

alter table "public"."RentalItems" drop column "tmp_ref";

-- Migrate lifespan to GearInventory table
alter table "public"."GearInventory" add column "lifespan" smallint not null default '0'::smallint;
update "public"."GearInventory" ginv
set "lifespan" = git.lifespan
from "public"."GearItems" git
where git.id = ginv.gear_item_id;

-- Update CompositeGearItems to link to RentalItems
alter table "public"."CompositeGearItems_GearItems" drop constraint "CompositeGearItems_GearItems_gear_item_id_fkey";
alter table "public"."CompositeGearItems_GearItems" add constraint "CompositeGearItems_GearItems_gear_item_id_fkey" FOREIGN KEY (gear_item_id) REFERENCES "public"."RentalItems"(id) not valid;
alter table "public"."CompositeGearItems_GearItems" validate constraint "CompositeGearItems_GearItems_gear_item_id_fkey";

-- Remove old gear_item reference from GearInventory
alter table "public"."GearInventory" drop column "gear_item_id";


-- #2: Create new RentedItems table (replacing RentedGear and RentedTopos)
create table "public"."RentedItems" (
  "created_at" timestamp with time zone not null default now(),
  "rental_id" uuid not null references "public"."Rentals"(id) on update cascade on delete cascade,
  "rental_item_id" uuid not null references "public"."RentalItems"(id),
  "rented_amount" smallint not null,
  "returned_amount" smallint not null default '0'::smallint,
  "lost_amount" smallint not null default '0'::smallint
);
comment on table "public"."RentedItems" is 'Tracking table for rented items';
alter table "public"."RentedItems" enable row level security;

CREATE UNIQUE INDEX "RentedItems_pkey" ON "public"."RentedItems" USING btree ("rental_id", "rental_item_id");
alter table "public"."RentedItems" add constraint "RentedItems_pkey" PRIMARY KEY using index "RentedItems_pkey";

create index "RentedItems_rental_id_idx" on "public"."RentedItems" using btree ("rental_id");
create index "RentedItems_rental_item_id_idx" on "public"."RentedItems" using btree ("rental_item_id");

-- Migrate RentedGear and RentedTopos to RentedItems
insert into "public"."RentedItems" ("rental_id", "rental_item_id", "rented_amount", "returned_amount", "lost_amount")
select "rental_id", "gear_item_id", "rented_amount", "returned_amount", "lost_amount"
from "public"."RentedGear";

insert into "public"."RentedItems" ("rental_id", "rental_item_id", "rented_amount", "returned_amount", "lost_amount")
select rt."rental_id", i."rental_item_id", rt."rented_amount", rt."returned_amount", rt."lost_amount"
from "public"."RentedTopos" rt
join "public"."Inventory" i on rt."topo_id" = i."id";

-- Remove old RentedGear, RentedTopos and GearItems tables
drop table "public"."RentedGear";
drop table "public"."RentedTopos";
drop table "public"."GearItems";

-- #3: Set RLS policies for RentalItems and RentedItems
create policy "Enable ALL for BoardMembers on RentalItems"
on "public"."RentalItems"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

create policy "Enable read access on RentalItems for all users"
on "public"."RentalItems"
as permissive
for select
to authenticated
using (true);

create policy "Enable ALL for BoardMembers on RentedItems"
on "public"."RentedItems"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

create policy "Enable users to view their own RentedItems"
on "public"."RentedItems"
as permissive
for select
to authenticated
using (
  exists (
    select 1 from "Rentals" r
    where r.id = rental_id and r.member_id = ( SELECT auth.uid() AS uid)
  )
);

-- #4: Fix functions
DROP FUNCTION "public"."create_rental";
CREATE FUNCTION public.create_rental(
  p_board_member_id uuid,
  p_member_id uuid,
  p_date_borrow date,
  p_date_return date,
  p_deposit numeric,
  p_payment_method payment_method,
  p_items jsonb,
  p_contact_info text,
  p_comments text
)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  rental_id uuid;
  rented_item jsonb;
  item_id uuid;
  item_amount numeric;
BEGIN
  -- Create the Rental
  insert into "Rentals" (board_member_id, member_id, date_borrow, date_return, deposit, payment_method, contact_info, comments)
  values (p_board_member_id, p_member_id, p_date_borrow, p_date_return, p_deposit, p_payment_method, p_contact_info, p_comments)
  returning id into rental_id;

  -- Save the items
  for rented_item in select jsonb_array_elements(p_items)
  loop
    item_id := (rented_item ->> 'item_id')::uuid;
    item_amount := (rented_item ->> 'rented_amount')::numeric;

    insert into "RentedItems" (rental_item_id, rental_id, rented_amount, returned_amount)
    values (item_id, rental_id, item_amount, 0);
  end loop;
  
  return rental_id;
END;$function$
;

DROP FUNCTION "public"."update_rental";
CREATE FUNCTION public.update_rental(
  p_rental_id uuid,
  p_date_return date,
  p_deposit_returned boolean,
  p_items jsonb,
  p_comments text
)
 RETURNS void
 LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
  item_id uuid;
  item_amount numeric;
BEGIN
  -- Make sure the rental exists
  if not exists (
    select 1 from "Rentals" r where r.id = p_rental_id
  ) then
    raise exception 'Rental % does not exist', p_rental_id;
  end if;

  -- Update the Rental
  update "Rentals"
  set date_return = p_date_return,
    deposit_returned = p_deposit_returned,
    comments = p_comments
  where id = p_rental_id;

  -- Update the items
  for item in select jsonb_array_elements(p_items)
  loop
    item_id := (item ->> 'item_id')::uuid;
    item_amount := (item ->> 'returned_amount')::numeric;

    update "RentedItems"
    set returned_amount = item_amount
    where rental_item_id = item_id and rental_id = p_rental_id;

    if not found then
      raise exception 'RentalItem % does not belong to Rental % or does not exist',
        item_id, p_rental_id;
    end if;
  end loop;
END;$$
;

DROP FUNCTION "public"."edit_rental";
CREATE FUNCTION public.edit_rental(p_rental_id uuid, p_date_borrow date, p_date_return date, p_deposit numeric, p_payment_method payment_method, p_items jsonb, p_contact_info text, p_comments text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $$
DECLARE
  rented_item jsonb;
  item_id uuid;
  item_amount numeric;
BEGIN
  -- Make sure the rental exists
  if not exists (
    select 1 from "Rentals" r where r.id = p_rental_id
  ) then
    raise exception 'Rental % does not exist', p_rental_id;
  end if;

  -- Update the Rental
  update "Rentals"
  set date_borrow = p_date_borrow,
    date_return = p_date_return,
    deposit = p_deposit,
    payment_method = p_payment_method,
    comments = p_comments
  where id = p_rental_id;

  -- Update the RentedItems
  for rented_item in select jsonb_array_elements(p_items)
  loop
    item_id := (rented_item ->> 'item_id')::uuid;
    item_amount := (rented_item ->> 'rented_amount')::numeric;

    if item_amount = 0 then
      delete from "RentedItems"
      where rental_id = p_rental_id and rental_item_id = item_id;
    else
      insert into "RentedItems" (rental_item_id, rental_id, rented_amount, returned_amount)
      values (item_id, p_rental_id, item_amount, 0)
      on conflict (rental_item_id, rental_id)
      do update set
        rented_amount = item_amount;
    end if;
  end loop;
  
  return p_rental_id;
END;$$
;

drop function "public"."mark_gear_as_lost";
drop function "public"."mark_topo_as_lost";

create function "public"."mark_item_as_lost"(
  p_rental_item_id uuid,
  p_rental_id uuid,
  p_inventory_item_id uuid,
  p_lost_amount numeric
)
returns void
language plpgsql
as $$
begin
  insert into "InventoryItemEvents" (item_id, event)
  values (
    p_inventory_item_id,
    jsonb_build_object(
      'eventName', 'ItemLostEvent',
      'rentalId', p_rental_id,
      'lostAmount', p_lost_amount
    )
  );

  update "RentedItems"
  set lost_amount = lost_amount + p_lost_amount
  where rental_item_id = p_rental_item_id and rental_id = p_rental_id;
end;$$;


-- #5: Some cleanup and new indexes on existing tables
CREATE OR REPLACE FUNCTION fits_smallint(value NUMERIC)
RETURNS BOOLEAN AS $$
BEGIN
    IF value <> TRUNC(value) THEN
        RETURN FALSE;
    END IF;

    PERFORM value::SMALLINT;
    RETURN TRUE;
EXCEPTION WHEN numeric_value_out_of_range THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "public"."GearInventory"
        WHERE NOT fits_smallint("amount")
    ) THEN
        RAISE EXCEPTION 'GearInventory.amount does not fit SMALLINT';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "public"."Topos"
        WHERE NOT fits_smallint("year_published")
    ) THEN
        RAISE EXCEPTION 'Topos.year_published does not fit SMALLINT';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "public"."Topos"
        WHERE NOT fits_smallint("amount")
    ) THEN
        RAISE EXCEPTION 'Topos.amount does not fit SMALLINT';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "public"."CompositeGearItems_GearItems"
        WHERE NOT fits_smallint("amount")
    ) THEN
        RAISE EXCEPTION 'CompositeGearItems_GearItems.amount does not fit SMALLINT';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "public"."Memberships"
        WHERE NOT fits_smallint("year")
    ) THEN
        RAISE EXCEPTION 'Memberships.year does not fit SMALLINT';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "public"."Rentals"
        WHERE NOT fits_smallint("deposit")
    ) THEN
        RAISE EXCEPTION 'Rentals.deposit does not fit SMALLINT';
    END IF;
END;
$$;
drop function fits_smallint(numeric);

alter table "public"."GearInventory" alter column "amount" type smallint;
alter table "public"."Topos" alter column "year_published" type smallint;
alter table "public"."Topos" alter column "amount" type smallint;
alter table "public"."CompositeGearItems_GearItems" alter column "amount" type smallint;
alter table "public"."Memberships" alter column "year" type smallint;
alter table "public"."Rentals" alter column "deposit" type smallint;

create index "InventoryItemEvents_item_id_idx" on "public"."InventoryItemEvents" using btree ("item_id");
create index "Inventory_rental_item_id_idx" on "public"."Inventory" using btree ("rental_item_id");
create index "Memberships_user_id_idx" on "public"."Memberships" using btree ("user_id");
create index "Rentals_member_id_idx" on "public"."Rentals" using btree ("member_id");
create index "Payments_approved_membership_id_idx" on "public"."Payments" using btree ("membership_id", "approved");


grant delete on table "public"."RentalItems" to "anon";
grant insert on table "public"."RentalItems" to "anon";
grant references on table "public"."RentalItems" to "anon";
grant select on table "public"."RentalItems" to "anon";
grant trigger on table "public"."RentalItems" to "anon";
grant truncate on table "public"."RentalItems" to "anon";
grant update on table "public"."RentalItems" to "anon";

grant delete on table "public"."RentalItems" to "authenticated";
grant insert on table "public"."RentalItems" to "authenticated";
grant references on table "public"."RentalItems" to "authenticated";
grant select on table "public"."RentalItems" to "authenticated";
grant trigger on table "public"."RentalItems" to "authenticated";
grant truncate on table "public"."RentalItems" to "authenticated";
grant update on table "public"."RentalItems" to "authenticated";

grant delete on table "public"."RentalItems" to "service_role";
grant insert on table "public"."RentalItems" to "service_role";
grant references on table "public"."RentalItems" to "service_role";
grant select on table "public"."RentalItems" to "service_role";
grant trigger on table "public"."RentalItems" to "service_role";
grant truncate on table "public"."RentalItems" to "service_role";
grant update on table "public"."RentalItems" to "service_role";

grant delete on table "public"."RentedItems" to "anon";
grant insert on table "public"."RentedItems" to "anon";
grant references on table "public"."RentedItems" to "anon";
grant select on table "public"."RentedItems" to "anon";
grant trigger on table "public"."RentedItems" to "anon";
grant truncate on table "public"."RentedItems" to "anon";
grant update on table "public"."RentedItems" to "anon";

grant delete on table "public"."RentedItems" to "authenticated";
grant insert on table "public"."RentedItems" to "authenticated";
grant references on table "public"."RentedItems" to "authenticated";
grant select on table "public"."RentedItems" to "authenticated";
grant trigger on table "public"."RentedItems" to "authenticated";
grant truncate on table "public"."RentedItems" to "authenticated";
grant update on table "public"."RentedItems" to "authenticated";

grant delete on table "public"."RentedItems" to "service_role";
grant insert on table "public"."RentedItems" to "service_role";
grant references on table "public"."RentedItems" to "service_role";
grant select on table "public"."RentedItems" to "service_role";
grant trigger on table "public"."RentedItems" to "service_role";
grant truncate on table "public"."RentedItems" to "service_role";
grant update on table "public"."RentedItems" to "service_role";