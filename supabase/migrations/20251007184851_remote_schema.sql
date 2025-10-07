revoke delete on table "public"."BoardMembers" from "anon";

revoke insert on table "public"."BoardMembers" from "anon";

revoke references on table "public"."BoardMembers" from "anon";

revoke select on table "public"."BoardMembers" from "anon";

revoke trigger on table "public"."BoardMembers" from "anon";

revoke truncate on table "public"."BoardMembers" from "anon";

revoke update on table "public"."BoardMembers" from "anon";

revoke delete on table "public"."BoardMembers" from "authenticated";

revoke insert on table "public"."BoardMembers" from "authenticated";

revoke references on table "public"."BoardMembers" from "authenticated";

revoke select on table "public"."BoardMembers" from "authenticated";

revoke trigger on table "public"."BoardMembers" from "authenticated";

revoke truncate on table "public"."BoardMembers" from "authenticated";

revoke update on table "public"."BoardMembers" from "authenticated";

revoke delete on table "public"."BoardMembers" from "service_role";

revoke insert on table "public"."BoardMembers" from "service_role";

revoke references on table "public"."BoardMembers" from "service_role";

revoke select on table "public"."BoardMembers" from "service_role";

revoke trigger on table "public"."BoardMembers" from "service_role";

revoke truncate on table "public"."BoardMembers" from "service_role";

revoke update on table "public"."BoardMembers" from "service_role";

revoke delete on table "public"."Memberships" from "anon";

revoke insert on table "public"."Memberships" from "anon";

revoke references on table "public"."Memberships" from "anon";

revoke select on table "public"."Memberships" from "anon";

revoke trigger on table "public"."Memberships" from "anon";

revoke truncate on table "public"."Memberships" from "anon";

revoke update on table "public"."Memberships" from "anon";

revoke delete on table "public"."Memberships" from "authenticated";

revoke insert on table "public"."Memberships" from "authenticated";

revoke references on table "public"."Memberships" from "authenticated";

revoke select on table "public"."Memberships" from "authenticated";

revoke trigger on table "public"."Memberships" from "authenticated";

revoke truncate on table "public"."Memberships" from "authenticated";

revoke update on table "public"."Memberships" from "authenticated";

revoke delete on table "public"."Memberships" from "service_role";

revoke insert on table "public"."Memberships" from "service_role";

revoke references on table "public"."Memberships" from "service_role";

revoke select on table "public"."Memberships" from "service_role";

revoke trigger on table "public"."Memberships" from "service_role";

revoke truncate on table "public"."Memberships" from "service_role";

revoke update on table "public"."Memberships" from "service_role";

revoke delete on table "public"."Payments" from "anon";

revoke insert on table "public"."Payments" from "anon";

revoke references on table "public"."Payments" from "anon";

revoke select on table "public"."Payments" from "anon";

revoke trigger on table "public"."Payments" from "anon";

revoke truncate on table "public"."Payments" from "anon";

revoke update on table "public"."Payments" from "anon";

revoke delete on table "public"."Payments" from "authenticated";

revoke insert on table "public"."Payments" from "authenticated";

revoke references on table "public"."Payments" from "authenticated";

revoke select on table "public"."Payments" from "authenticated";

revoke trigger on table "public"."Payments" from "authenticated";

revoke truncate on table "public"."Payments" from "authenticated";

revoke update on table "public"."Payments" from "authenticated";

revoke delete on table "public"."Payments" from "service_role";

revoke insert on table "public"."Payments" from "service_role";

revoke references on table "public"."Payments" from "service_role";

revoke select on table "public"."Payments" from "service_role";

revoke trigger on table "public"."Payments" from "service_role";

revoke truncate on table "public"."Payments" from "service_role";

revoke update on table "public"."Payments" from "service_role";

revoke delete on table "public"."Users" from "anon";

revoke insert on table "public"."Users" from "anon";

revoke references on table "public"."Users" from "anon";

revoke select on table "public"."Users" from "anon";

revoke trigger on table "public"."Users" from "anon";

revoke truncate on table "public"."Users" from "anon";

revoke update on table "public"."Users" from "anon";

revoke delete on table "public"."Users" from "authenticated";

revoke insert on table "public"."Users" from "authenticated";

revoke references on table "public"."Users" from "authenticated";

revoke select on table "public"."Users" from "authenticated";

revoke trigger on table "public"."Users" from "authenticated";

revoke truncate on table "public"."Users" from "authenticated";

revoke update on table "public"."Users" from "authenticated";

revoke delete on table "public"."Users" from "service_role";

revoke insert on table "public"."Users" from "service_role";

revoke references on table "public"."Users" from "service_role";

revoke select on table "public"."Users" from "service_role";

revoke trigger on table "public"."Users" from "service_role";

revoke truncate on table "public"."Users" from "service_role";

revoke update on table "public"."Users" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_luak_year()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$DECLARE
    current_date DATE := CURRENT_DATE;
    luak_year INTEGER;
BEGIN
    IF EXTRACT(MONTH FROM current_date) >= 8 THEN
        luak_year := EXTRACT(YEAR FROM current_date);
    ELSE
        luak_year := EXTRACT(YEAR FROM current_date) - 1;
    END IF;

    RETURN luak_year;
END;$function$
;

CREATE OR REPLACE FUNCTION public.has_membership()
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
  luak_year INTEGER;
  has_membership BOOLEAN;
  has_paid BOOLEAN;
BEGIN
  luak_year := get_luak_year();

  SELECT EXISTS(
    SELECT 1
    FROM "Memberships"
    WHERE year = luak_year and user_id = auth.uid()
  ) INTO has_membership;

  IF has_membership THEN
    SELECT EXISTS (
      SELECT 1 FROM "Payments" 
      WHERE membership_id = (
        SELECT id
        FROM "Memberships"
        WHERE year = luak_year and user_id = auth.uid()
        )
    ) INTO has_paid;

    IF has_paid THEN
      RETURN 'paid_membership';
    ELSE
      RETURN 'unpaid_membership';
    END IF;
  ELSE
    RETURN 'no_membership';
  END IF;
END;$function$
;



