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

create policy "Enable users to update their own data"
on "public"."Users"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));



