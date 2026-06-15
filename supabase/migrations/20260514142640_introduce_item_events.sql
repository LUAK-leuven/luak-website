-- Drop GearLogs table
revoke delete on table "public"."GearLogs" from "anon";
revoke insert on table "public"."GearLogs" from "anon";
revoke references on table "public"."GearLogs" from "anon";
revoke select on table "public"."GearLogs" from "anon";
revoke trigger on table "public"."GearLogs" from "anon";
revoke truncate on table "public"."GearLogs" from "anon";
revoke update on table "public"."GearLogs" from "anon";

revoke delete on table "public"."GearLogs" from "authenticated";
revoke insert on table "public"."GearLogs" from "authenticated";
revoke references on table "public"."GearLogs" from "authenticated";
revoke select on table "public"."GearLogs" from "authenticated";
revoke trigger on table "public"."GearLogs" from "authenticated";
revoke truncate on table "public"."GearLogs" from "authenticated";
revoke update on table "public"."GearLogs" from "authenticated";

revoke delete on table "public"."GearLogs" from "service_role";
revoke insert on table "public"."GearLogs" from "service_role";
revoke references on table "public"."GearLogs" from "service_role";
revoke select on table "public"."GearLogs" from "service_role";
revoke trigger on table "public"."GearLogs" from "service_role";
revoke truncate on table "public"."GearLogs" from "service_role";
revoke update on table "public"."GearLogs" from "service_role";

alter table "public"."GearLogs" drop constraint "GearLogs_gear_inventory_id_fkey";
alter table "public"."GearLogs" drop constraint "GearLogs_pkey";
drop index if exists "public"."GearLogs_pkey";
drop table "public"."GearLogs";
--

create type "public"."item_type" as enum ('topo', 'gear');

-- Create InventoryItemEvents table
create table "public"."InventoryItemEvents" (
  "id" uuid not null default gen_random_uuid(),
  "occured_on" timestamp with time zone not null default now(),
  "item_type" public.item_type not null,
  "item_id" uuid not null,
  "event" jsonb not null
);
alter table "public"."InventoryItemEvents" enable row level security;

CREATE UNIQUE INDEX "InventoryItemEvents_pkey" ON public."InventoryItemEvents" USING btree (id);

alter table "public"."InventoryItemEvents" add constraint "InventoryItemEvents_pkey" PRIMARY KEY using index "InventoryItemEvents_pkey";

grant delete on table "public"."InventoryItemEvents" to "anon";
grant insert on table "public"."InventoryItemEvents" to "anon";
grant references on table "public"."InventoryItemEvents" to "anon";
grant select on table "public"."InventoryItemEvents" to "anon";
grant trigger on table "public"."InventoryItemEvents" to "anon";
grant truncate on table "public"."InventoryItemEvents" to "anon";
grant update on table "public"."InventoryItemEvents" to "anon";

grant delete on table "public"."InventoryItemEvents" to "authenticated";
grant insert on table "public"."InventoryItemEvents" to "authenticated";
grant references on table "public"."InventoryItemEvents" to "authenticated";
grant select on table "public"."InventoryItemEvents" to "authenticated";
grant trigger on table "public"."InventoryItemEvents" to "authenticated";
grant truncate on table "public"."InventoryItemEvents" to "authenticated";
grant update on table "public"."InventoryItemEvents" to "authenticated";

grant delete on table "public"."InventoryItemEvents" to "service_role";
grant insert on table "public"."InventoryItemEvents" to "service_role";
grant references on table "public"."InventoryItemEvents" to "service_role";
grant select on table "public"."InventoryItemEvents" to "service_role";
grant trigger on table "public"."InventoryItemEvents" to "service_role";
grant truncate on table "public"."InventoryItemEvents" to "service_role";
grant update on table "public"."InventoryItemEvents" to "service_role";

create policy "Enable ALL for BoardMembers on InventoryItemEvents"
on "public"."InventoryItemEvents"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

-- Add lost_amount on RentedGear and RentedTopos
alter table "public"."RentedGear" add column "lost_amount" numeric not null default 0;
alter table "public"."RentedTopos" add column "lost_amount" numeric not null default 0;

-- Functions to mark gear and topos as lost
create or replace function public.mark_gear_as_lost(
  p_gear_item_id uuid,
  p_rental_id uuid,
  p_inventory_item_id uuid,
  p_lost_amount numeric
)
returns void
language plpgsql
as $$
begin
  insert into "InventoryItemEvents" (item_type, item_id, event)
  values (
    'gear',
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
  insert into "InventoryItemEvents" (item_type, item_id, event)
  values (
    'topo',
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
