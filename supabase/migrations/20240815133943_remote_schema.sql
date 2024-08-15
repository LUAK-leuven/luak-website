create table "public"."Payments" (
    "id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "membership_id" uuid,
    "amount" numeric,
    "approved" boolean not null
);


alter table "public"."Payments" enable row level security;

CREATE UNIQUE INDEX "Payments_pkey" ON public."Payments" USING btree (id);

alter table "public"."Payments" add constraint "Payments_pkey" PRIMARY KEY using index "Payments_pkey";

alter table "public"."Payments" add constraint "Payments_membership_id_fkey" FOREIGN KEY (membership_id) REFERENCES "Memberships"(id) ON DELETE RESTRICT not valid;

alter table "public"."Payments" validate constraint "Payments_membership_id_fkey";

set check_function_bodies = off;

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

create policy "Allow users to read their payments"
on "public"."Payments"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "Memberships".user_id
   FROM "Memberships"
  WHERE ("Payments".membership_id = "Memberships".id))));



