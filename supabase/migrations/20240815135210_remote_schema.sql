drop policy "Enable read access for users based on user_id" on "public"."Memberships";

drop policy "Enable update for users based on user_id when the membership is" on "public"."Memberships";

create policy "Enable read access for users based on user_id"
on "public"."Memberships"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable update for users based on user_id when the membership is"
on "public"."Memberships"
as permissive
for update
to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) AND (has_membership() <> 'paid_membership'::text)));



