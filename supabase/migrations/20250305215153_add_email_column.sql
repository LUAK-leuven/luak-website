drop policy "Allow BoardMembers to delete BoardMembers" on "public"."BoardMembers";

drop policy "Allow BoardMembers to insert BoardMembers" on "public"."BoardMembers";

drop policy "Allow authenticated users to read BoardMembers" on "public"."BoardMembers";

drop policy "Allow BoardMembers to read Memberships" on "public"."Memberships";

drop policy "Allow BoardMembers to read Payments" on "public"."Payments";

drop policy "Allow BoardMembers to read Users" on "public"."Users";

alter table "public"."Users" add column "is_board_member" boolean not null default false;

create policy "Enable read access for all authenticated users"
on "public"."BoardMembers"
as permissive
for select
to authenticated
using (true);



