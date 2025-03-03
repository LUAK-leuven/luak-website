create table "public"."BoardMembers" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."BoardMembers" enable row level security;

alter table "public"."Users" drop column "is_board_member";

CREATE UNIQUE INDEX "BoardMembers_pkey" ON public."BoardMembers" USING btree (user_id);

alter table "public"."BoardMembers" add constraint "BoardMembers_pkey" PRIMARY KEY using index "BoardMembers_pkey";

alter table "public"."BoardMembers" add constraint "BoardMembers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."BoardMembers" validate constraint "BoardMembers_user_id_fkey";

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

create policy "Allow BoardMembers to delete BoardMembers"
on "public"."BoardMembers"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers_1".user_id
   FROM "BoardMembers" "BoardMembers_1")));


create policy "Allow BoardMembers to insert BoardMembers"
on "public"."BoardMembers"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers_1".user_id
   FROM "BoardMembers" "BoardMembers_1")));


create policy "Allow authenticated users to read BoardMembers"
on "public"."BoardMembers"
as permissive
for select
to authenticated
using (true);


create policy "Allow BoardMembers to read Memberships"
on "public"."Memberships"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));


create policy "Allow BoardMembers to read Payments"
on "public"."Payments"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));


create policy "Allow BoardMembers to read Users"
on "public"."Users"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));



