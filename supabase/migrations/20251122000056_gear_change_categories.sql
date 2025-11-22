create type "public"."PaymentMethod" as enum ('cash', 'transfer');

alter table "public"."GearInventory" drop constraint "GearInventory_category_id_fkey";

alter table "public"."GearInventory" drop column "category_id";

alter table "public"."GearItems" add column "gear_category" uuid not null;

alter table "public"."Rentals" alter column "payment_method" set data type "PaymentMethod" using "payment_method"::"PaymentMethod";

alter table "public"."GearItems" add constraint "GearItems_gear_category_fkey" FOREIGN KEY (gear_category) REFERENCES "GearCategories"(id) ON DELETE RESTRICT not valid;

alter table "public"."GearItems" validate constraint "GearItems_gear_category_fkey";

grant delete on table "public"."BoardMembers" to "anon";

grant insert on table "public"."BoardMembers" to "anon";

grant references on table "public"."BoardMembers" to "anon";

grant select on table "public"."BoardMembers" to "anon";

grant trigger on table "public"."BoardMembers" to "anon";

grant truncate on table "public"."BoardMembers" to "anon";

grant update on table "public"."BoardMembers" to "anon";

grant delete on table "public"."BoardMembers" to "authenticated";

grant insert on table "public"."BoardMembers" to "authenticated";

grant references on table "public"."BoardMembers" to "authenticated";

grant select on table "public"."BoardMembers" to "authenticated";

grant trigger on table "public"."BoardMembers" to "authenticated";

grant truncate on table "public"."BoardMembers" to "authenticated";

grant update on table "public"."BoardMembers" to "authenticated";

grant delete on table "public"."BoardMembers" to "service_role";

grant insert on table "public"."BoardMembers" to "service_role";

grant references on table "public"."BoardMembers" to "service_role";

grant select on table "public"."BoardMembers" to "service_role";

grant trigger on table "public"."BoardMembers" to "service_role";

grant truncate on table "public"."BoardMembers" to "service_role";

grant update on table "public"."BoardMembers" to "service_role";

grant delete on table "public"."Memberships" to "anon";

grant insert on table "public"."Memberships" to "anon";

grant references on table "public"."Memberships" to "anon";

grant select on table "public"."Memberships" to "anon";

grant trigger on table "public"."Memberships" to "anon";

grant truncate on table "public"."Memberships" to "anon";

grant update on table "public"."Memberships" to "anon";

grant delete on table "public"."Memberships" to "authenticated";

grant insert on table "public"."Memberships" to "authenticated";

grant references on table "public"."Memberships" to "authenticated";

grant select on table "public"."Memberships" to "authenticated";

grant trigger on table "public"."Memberships" to "authenticated";

grant truncate on table "public"."Memberships" to "authenticated";

grant update on table "public"."Memberships" to "authenticated";

grant delete on table "public"."Memberships" to "service_role";

grant insert on table "public"."Memberships" to "service_role";

grant references on table "public"."Memberships" to "service_role";

grant select on table "public"."Memberships" to "service_role";

grant trigger on table "public"."Memberships" to "service_role";

grant truncate on table "public"."Memberships" to "service_role";

grant update on table "public"."Memberships" to "service_role";

grant delete on table "public"."Payments" to "anon";

grant insert on table "public"."Payments" to "anon";

grant references on table "public"."Payments" to "anon";

grant select on table "public"."Payments" to "anon";

grant trigger on table "public"."Payments" to "anon";

grant truncate on table "public"."Payments" to "anon";

grant update on table "public"."Payments" to "anon";

grant delete on table "public"."Payments" to "authenticated";

grant insert on table "public"."Payments" to "authenticated";

grant references on table "public"."Payments" to "authenticated";

grant select on table "public"."Payments" to "authenticated";

grant trigger on table "public"."Payments" to "authenticated";

grant truncate on table "public"."Payments" to "authenticated";

grant update on table "public"."Payments" to "authenticated";

grant delete on table "public"."Payments" to "service_role";

grant insert on table "public"."Payments" to "service_role";

grant references on table "public"."Payments" to "service_role";

grant select on table "public"."Payments" to "service_role";

grant trigger on table "public"."Payments" to "service_role";

grant truncate on table "public"."Payments" to "service_role";

grant update on table "public"."Payments" to "service_role";

grant delete on table "public"."Users" to "anon";

grant insert on table "public"."Users" to "anon";

grant references on table "public"."Users" to "anon";

grant select on table "public"."Users" to "anon";

grant trigger on table "public"."Users" to "anon";

grant truncate on table "public"."Users" to "anon";

grant update on table "public"."Users" to "anon";

grant delete on table "public"."Users" to "authenticated";

grant insert on table "public"."Users" to "authenticated";

grant references on table "public"."Users" to "authenticated";

grant select on table "public"."Users" to "authenticated";

grant trigger on table "public"."Users" to "authenticated";

grant truncate on table "public"."Users" to "authenticated";

grant update on table "public"."Users" to "authenticated";

grant delete on table "public"."Users" to "service_role";

grant insert on table "public"."Users" to "service_role";

grant references on table "public"."Users" to "service_role";

grant select on table "public"."Users" to "service_role";

grant trigger on table "public"."Users" to "service_role";

grant truncate on table "public"."Users" to "service_role";

grant update on table "public"."Users" to "service_role";

create policy "Enable read access for all users"
on "public"."GearInventory"
as permissive
for select
to authenticated
using (true);


create policy "Enable read access for all users"
on "public"."GearItems"
as permissive
for select
to authenticated
using (true);


create policy "Enable read access for all users"
on "public"."RentedGear"
as permissive
for select
to authenticated
using (true);



