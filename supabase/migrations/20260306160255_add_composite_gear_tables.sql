create table "public"."CompositeGearItems" (
  "id" uuid not null default gen_random_uuid(),
  "name" text not null
);
alter table "public"."CompositeGearItems" enable row level security;

create table "public"."CompositeGearItems_GearItems" (
  "gear_item_id" uuid not null,
  "composite_gear_item_id" uuid not null,
  "amount" numeric not null
);
alter table "public"."CompositeGearItems_GearItems" enable row level security;

CREATE UNIQUE INDEX "CompositeGearItems_GearItems_pkey" ON public."CompositeGearItems_GearItems" USING btree (gear_item_id, composite_gear_item_id);
CREATE UNIQUE INDEX "CompositeGearItems_pkey" ON public."CompositeGearItems" USING btree (id);

alter table "public"."CompositeGearItems" add constraint "CompositeGearItems_pkey" PRIMARY KEY using index "CompositeGearItems_pkey";

alter table "public"."CompositeGearItems_GearItems" add constraint "CompositeGearItems_GearItems_pkey" PRIMARY KEY using index "CompositeGearItems_GearItems_pkey";

alter table "public"."CompositeGearItems_GearItems" add constraint "CompositeGearItems_GearItems_composite_gear_item_id_fkey" FOREIGN KEY (composite_gear_item_id) REFERENCES public."CompositeGearItems"(id) ON UPDATE RESTRICT not valid;
alter table "public"."CompositeGearItems_GearItems" validate constraint "CompositeGearItems_GearItems_composite_gear_item_id_fkey";

alter table "public"."CompositeGearItems_GearItems" add constraint "CompositeGearItems_GearItems_gear_item_id_fkey" FOREIGN KEY (gear_item_id) REFERENCES public."GearItems"(id) ON UPDATE RESTRICT not valid;
alter table "public"."CompositeGearItems_GearItems" validate constraint "CompositeGearItems_GearItems_gear_item_id_fkey";

grant delete on table "public"."CompositeGearItems" to "anon";
grant insert on table "public"."CompositeGearItems" to "anon";
grant references on table "public"."CompositeGearItems" to "anon";
grant select on table "public"."CompositeGearItems" to "anon";
grant trigger on table "public"."CompositeGearItems" to "anon";
grant truncate on table "public"."CompositeGearItems" to "anon";
grant update on table "public"."CompositeGearItems" to "anon";

grant delete on table "public"."CompositeGearItems" to "authenticated";
grant insert on table "public"."CompositeGearItems" to "authenticated";
grant references on table "public"."CompositeGearItems" to "authenticated";
grant select on table "public"."CompositeGearItems" to "authenticated";
grant trigger on table "public"."CompositeGearItems" to "authenticated";
grant truncate on table "public"."CompositeGearItems" to "authenticated";
grant update on table "public"."CompositeGearItems" to "authenticated";

grant delete on table "public"."CompositeGearItems" to "postgres";
grant insert on table "public"."CompositeGearItems" to "postgres";
grant references on table "public"."CompositeGearItems" to "postgres";
grant select on table "public"."CompositeGearItems" to "postgres";
grant trigger on table "public"."CompositeGearItems" to "postgres";
grant truncate on table "public"."CompositeGearItems" to "postgres";
grant update on table "public"."CompositeGearItems" to "postgres";

grant delete on table "public"."CompositeGearItems" to "service_role";
grant insert on table "public"."CompositeGearItems" to "service_role";
grant references on table "public"."CompositeGearItems" to "service_role";
grant select on table "public"."CompositeGearItems" to "service_role";
grant trigger on table "public"."CompositeGearItems" to "service_role";
grant truncate on table "public"."CompositeGearItems" to "service_role";
grant update on table "public"."CompositeGearItems" to "service_role";

grant delete on table "public"."CompositeGearItems_GearItems" to "anon";
grant insert on table "public"."CompositeGearItems_GearItems" to "anon";
grant references on table "public"."CompositeGearItems_GearItems" to "anon";
grant select on table "public"."CompositeGearItems_GearItems" to "anon";
grant trigger on table "public"."CompositeGearItems_GearItems" to "anon";
grant truncate on table "public"."CompositeGearItems_GearItems" to "anon";
grant update on table "public"."CompositeGearItems_GearItems" to "anon";

grant delete on table "public"."CompositeGearItems_GearItems" to "authenticated";
grant insert on table "public"."CompositeGearItems_GearItems" to "authenticated";
grant references on table "public"."CompositeGearItems_GearItems" to "authenticated";
grant select on table "public"."CompositeGearItems_GearItems" to "authenticated";
grant trigger on table "public"."CompositeGearItems_GearItems" to "authenticated";
grant truncate on table "public"."CompositeGearItems_GearItems" to "authenticated";
grant update on table "public"."CompositeGearItems_GearItems" to "authenticated";

grant delete on table "public"."CompositeGearItems_GearItems" to "postgres";
grant insert on table "public"."CompositeGearItems_GearItems" to "postgres";
grant references on table "public"."CompositeGearItems_GearItems" to "postgres";
grant select on table "public"."CompositeGearItems_GearItems" to "postgres";
grant trigger on table "public"."CompositeGearItems_GearItems" to "postgres";
grant truncate on table "public"."CompositeGearItems_GearItems" to "postgres";
grant update on table "public"."CompositeGearItems_GearItems" to "postgres";

grant delete on table "public"."CompositeGearItems_GearItems" to "service_role";
grant insert on table "public"."CompositeGearItems_GearItems" to "service_role";
grant references on table "public"."CompositeGearItems_GearItems" to "service_role";
grant select on table "public"."CompositeGearItems_GearItems" to "service_role";
grant trigger on table "public"."CompositeGearItems_GearItems" to "service_role";
grant truncate on table "public"."CompositeGearItems_GearItems" to "service_role";
grant update on table "public"."CompositeGearItems_GearItems" to "service_role";

create policy "Enable ALL for BoardMembers on CompositeGearItems"
on "public"."CompositeGearItems"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

create policy "Enable ALL for BoardMembers on CompositeGearItems_GearItems"
on "public"."CompositeGearItems_GearItems"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

-- Little fix for stuff that was done on prod directly
alter table "public"."Topos" alter column authors set not null;
alter table "public"."Topos" alter column countries set not null;
alter table "public"."Topos" alter column tags set not null;
alter table "public"."Topos" alter column languages set not null;
alter table "public"."Topos" alter column types_of_climbing drop not null;
