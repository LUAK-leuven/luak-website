-- Update policies to remove dependency on has_membership function
alter policy "Enable update for users based on user_id when the membership is"
on "public"."Memberships"
rename to "Enable update for users based on user_id";

alter policy "Enable update for users based on user_id"
on "public"."Memberships"
to authenticated
using (
  (( SELECT auth.uid() AS uid) = user_id)
);

alter table "public"."Memberships" alter column "year" drop default;

-- Drop the has_membership function and get_luak_year function as they are no longer needed
drop function if exists "public"."has_membership";
drop function if exists "public"."get_luak_year";

-- Create new function to save a new membership
create function "public"."save_membership"(
  p_year numeric,
  p_kbf_uiaa_member kbf_uiaa,
  p_sportscard boolean,
  p_student student
)
 returns uuid
 language plpgsql
as $$
declare membership_id uuid;
begin
  -- TODO: Check if existing membership has already been paid for and throw error if so
  insert into "Memberships" (user_id, year, kbf_uiaa_member, sportscard, student)
  values (auth.uid(), p_year, p_kbf_uiaa_member, p_sportscard, p_student)
  on conflict (user_id, year) do update
    set kbf_uiaa_member = p_kbf_uiaa_member,
        sportscard = p_sportscard,
        student = p_student
  returning id into membership_id;
  return membership_id;
end;$$;
