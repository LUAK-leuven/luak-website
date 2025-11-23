alter table "public"."Rentals" drop constraint "Rentals_board_member_fkey";

create table "public"."TemporaryUsers" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "first_name" text not null,
    "last_name" text not null,
    "email" text,
    "phone_number" text
);


alter table "public"."TemporaryUsers" enable row level security;

alter table "public"."Rentals" add column "returned_deposit" numeric not null default '0'::numeric;

alter table "public"."Rentals" alter column "contact_info" set data type uuid using "contact_info"::uuid;

alter table "public"."RentedGear" add column "last_edited_date" timestamp with time zone not null default now();

alter table "public"."RentedGear" add column "returned_amount" numeric not null default '0'::numeric;

CREATE UNIQUE INDEX temporary_contact_info_pkey ON public."TemporaryUsers" USING btree (id);

alter table "public"."TemporaryUsers" add constraint "temporary_contact_info_pkey" PRIMARY KEY using index "temporary_contact_info_pkey";

alter table "public"."Rentals" add constraint "Rentals_contact_info_fkey" FOREIGN KEY (contact_info) REFERENCES "TemporaryUsers"(id) ON UPDATE RESTRICT not valid;

alter table "public"."Rentals" validate constraint "Rentals_contact_info_fkey";

alter table "public"."Rentals" add constraint "Rentals_board_member_fkey" FOREIGN KEY (board_member) REFERENCES "Users"(id) not valid;

alter table "public"."Rentals" validate constraint "Rentals_board_member_fkey";

grant delete on table "public"."TemporaryUsers" to "anon";

grant insert on table "public"."TemporaryUsers" to "anon";

grant references on table "public"."TemporaryUsers" to "anon";

grant select on table "public"."TemporaryUsers" to "anon";

grant trigger on table "public"."TemporaryUsers" to "anon";

grant truncate on table "public"."TemporaryUsers" to "anon";

grant update on table "public"."TemporaryUsers" to "anon";

grant delete on table "public"."TemporaryUsers" to "authenticated";

grant insert on table "public"."TemporaryUsers" to "authenticated";

grant references on table "public"."TemporaryUsers" to "authenticated";

grant select on table "public"."TemporaryUsers" to "authenticated";

grant trigger on table "public"."TemporaryUsers" to "authenticated";

grant truncate on table "public"."TemporaryUsers" to "authenticated";

grant update on table "public"."TemporaryUsers" to "authenticated";

grant delete on table "public"."TemporaryUsers" to "service_role";

grant insert on table "public"."TemporaryUsers" to "service_role";

grant references on table "public"."TemporaryUsers" to "service_role";

grant select on table "public"."TemporaryUsers" to "service_role";

grant trigger on table "public"."TemporaryUsers" to "service_role";

grant truncate on table "public"."TemporaryUsers" to "service_role";

grant update on table "public"."TemporaryUsers" to "service_role";

create policy "Enable read access for all users"
on "public"."GearCategories"
as permissive
for select
to authenticated
using (true);


create policy "Enable delete for BoardMembers"
on "public"."Rentals"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));


create policy "Enable insert for BoardMembers only"
on "public"."Rentals"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));


create policy "Enable read access for BoardMembers"
on "public"."Rentals"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));


create policy "Allow insert for BoardMembers"
on "public"."RentedGear"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));



