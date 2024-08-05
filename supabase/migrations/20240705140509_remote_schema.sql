create type "public"."kbf_uiaa" as enum ('not', 'kbf_luak', 'kbf_other', 'uiaa');

create type "public"."student" as enum ('student_kul', 'phd_kul', 'student_other', 'not_student');

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_luak_year()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_date DATE := CURRENT_DATE;
    luak_year INTEGER;
BEGIN
    IF EXTRACT(MONTH FROM current_date) >= 9 THEN
        luak_year := EXTRACT(YEAR FROM current_date);
    ELSE
        luak_year := EXTRACT(YEAR FROM current_date) - 1;
    END IF;

    RETURN luak_year;
END;
$function$
;

create table "public"."Memberships" (
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null default auth.uid(),
    "year" numeric not null default get_luak_year(),
    "student" student not null,
    "sportscard" boolean not null,
    "kbf_uiaa_member" kbf_uiaa not null,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."Memberships" enable row level security;

alter table "public"."Users" alter column "id" set default auth.uid();

CREATE UNIQUE INDEX "Memberships_pkey" ON public."Memberships" USING btree (id);

CREATE UNIQUE INDEX unique_year_uid ON public."Memberships" USING btree (year, user_id);

alter table "public"."Memberships" add constraint "Memberships_pkey" PRIMARY KEY using index "Memberships_pkey";

alter table "public"."Memberships" add constraint "Memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Memberships" validate constraint "Memberships_user_id_fkey";

alter table "public"."Memberships" add constraint "unique_year_uid" UNIQUE using index "unique_year_uid";

CREATE OR REPLACE FUNCTION public.has_membership()
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
  luak_year INTEGER;
  has_membership BOOLEAN;
BEGIN
  luak_year := get_luak_year();

  SELECT EXISTS(
    SELECT 1
    FROM "Memberships"
    WHERE year = luak_year and user_id = auth.uid()
  ) INTO has_membership;

  IF has_membership THEN
    RETURN 'unpaid_membership';
  ELSE
    RETURN 'no_membership';
  END IF;
END;$function$
;

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

create policy "Enable insert for authenticated users only"
on "public"."Memberships"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for users based on user_id"
on "public"."Memberships"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable update for users based on user_id when the membership is"
on "public"."Memberships"
as permissive
for update
to public
using (((( SELECT auth.uid() AS uid) = user_id) AND (has_membership() <> 'paid_membership'::text)));


create policy "Enable insert access for all users"
on "public"."Users"
as permissive
for insert
to public
with check (true);


create policy "Enable select for users based on their user_id"
on "public"."Users"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));



