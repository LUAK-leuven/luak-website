drop policy "Enable read access for all authenticated users" on "public"."BoardMembers";

alter table "public"."Users" drop column "is_board_member";

alter table "public"."Users" add column "email" text;

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



