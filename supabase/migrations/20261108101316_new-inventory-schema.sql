-- Create new unified inventory table
create table "public"."Inventory" (
  "id" uuid not null default gen_random_uuid() primary key,
  "created_at" timestamp with time zone not null default now()
);
alter table "public"."Inventory" enable row level security;

-- Migrate records from topo and gear inventory
insert into "public"."Inventory" ("id")
select "id" from "public"."Topos";

insert into "public"."Inventory" ("id")
select "id" from "public"."GearInventory";

-- Add foreign key relations
alter table "public"."Topos" add constraint "Topos_Inventory_id_fkey" FOREIGN KEY (id) REFERENCES "public"."Inventory"(id) not valid;
alter table "public"."GearInventory" add constraint "GearInventory_Inventory_id_fkey" FOREIGN KEY (id) REFERENCES "public"."Inventory"(id) not valid;

-- Update InventoryEvents table to reference the new Inventory table
alter table "public"."InventoryItemEvents" drop column "item_type";
alter table "public"."InventoryItemEvents" add constraint "InventoryItemEvents_Inventory_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."Inventory"(id) on update cascade on delete cascade not valid;

-- Update mark-as-lost functions
create or replace function "public"."mark_gear_as_lost"(
  p_gear_item_id uuid,
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

  update "RentedGear"
  set lost_amount = lost_amount + p_lost_amount
  where gear_item_id = p_gear_item_id and rental_id = p_rental_id;
end;$$;

create or replace function public.mark_topo_as_lost(
  p_topo_id uuid,
  p_rental_id uuid,
  p_lost_amount numeric
)
returns void
language plpgsql
as $$
begin
  insert into "InventoryItemEvents" (item_id, event)
  values (
    p_topo_id,
    jsonb_build_object(
      'eventName', 'ItemLostEvent',
      'rentalId', p_rental_id,
      'lostAmount', p_lost_amount
    )
  );

  update "RentedTopos"
  set lost_amount = lost_amount + p_lost_amount
  where topo_id = p_topo_id and rental_id = p_rental_id;
end;$$;


grant delete on table "public"."Inventory" to "anon";
grant insert on table "public"."Inventory" to "anon";
grant references on table "public"."Inventory" to "anon";
grant select on table "public"."Inventory" to "anon";
grant trigger on table "public"."Inventory" to "anon";
grant truncate on table "public"."Inventory" to "anon";
grant update on table "public"."Inventory" to "anon";

grant delete on table "public"."Inventory" to "authenticated";
grant insert on table "public"."Inventory" to "authenticated";
grant references on table "public"."Inventory" to "authenticated";
grant select on table "public"."Inventory" to "authenticated";
grant trigger on table "public"."Inventory" to "authenticated";
grant truncate on table "public"."Inventory" to "authenticated";
grant update on table "public"."Inventory" to "authenticated";

grant delete on table "public"."Inventory" to "service_role";
grant insert on table "public"."Inventory" to "service_role";
grant references on table "public"."Inventory" to "service_role";
grant select on table "public"."Inventory" to "service_role";
grant trigger on table "public"."Inventory" to "service_role";
grant truncate on table "public"."Inventory" to "service_role";
grant update on table "public"."Inventory" to "service_role";

-- Set RLS policies
create policy "Enable ALL for BoardMembers on Inventory"
on "public"."Inventory"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

create policy "Enable read access on Inventory for all users"
on "public"."Inventory"
as permissive
for select
to authenticated
using (true);
