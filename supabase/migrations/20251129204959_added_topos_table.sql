create type "public"."topo_condition" as enum ('as_good_as_new', 'good', 'used', 'damaged');

create table "public"."RentedTopos" (
    "id" uuid not null default gen_random_uuid(),
    "topo_id" uuid not null,
    "rental_id" uuid not null,
    "rented_amount" numeric not null,
    "actual_amount" numeric not null,
    "last_edited_date" timestamp with time zone not null default now()
);
alter table "public"."RentedTopos" enable row level security;

create table "public"."Topos" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "authors" text[],
    "countries" text[],
    "year_published" numeric,
    "amount" numeric not null,
    "condition" topo_condition not null,
    "type_of_climbing" text,
    "tags" text[],
    "place_in_library" text not null,
    "details" text,
    "languages" text[]
);
alter table "public"."Topos" enable row level security;


CREATE UNIQUE INDEX "RentedTopos_pkey" ON public."RentedTopos" USING btree (id);

CREATE UNIQUE INDEX topos_pkey ON public."Topos" USING btree (id);

alter table "public"."RentedTopos" add constraint "RentedTopos_pkey" PRIMARY KEY using index "RentedTopos_pkey";

alter table "public"."Topos" add constraint "topos_pkey" PRIMARY KEY using index "topos_pkey";

alter table "public"."RentedTopos" add constraint "RentedTopos_rental_id_fkey" FOREIGN KEY (rental_id) REFERENCES "Rentals"(id) ON DELETE RESTRICT not valid;

alter table "public"."RentedTopos" validate constraint "RentedTopos_rental_id_fkey";

alter table "public"."RentedTopos" add constraint "RentedTopos_topo_id_fkey" FOREIGN KEY (topo_id) REFERENCES "Topos"(id) not valid;

alter table "public"."RentedTopos" validate constraint "RentedTopos_topo_id_fkey";

grant delete on table "public"."RentedTopos" to "anon";
grant insert on table "public"."RentedTopos" to "anon";
grant references on table "public"."RentedTopos" to "anon";
grant select on table "public"."RentedTopos" to "anon";
grant trigger on table "public"."RentedTopos" to "anon";
grant truncate on table "public"."RentedTopos" to "anon";
grant update on table "public"."RentedTopos" to "anon";
grant delete on table "public"."RentedTopos" to "authenticated";
grant insert on table "public"."RentedTopos" to "authenticated";
grant references on table "public"."RentedTopos" to "authenticated";
grant select on table "public"."RentedTopos" to "authenticated";
grant trigger on table "public"."RentedTopos" to "authenticated";
grant truncate on table "public"."RentedTopos" to "authenticated";
grant update on table "public"."RentedTopos" to "authenticated";
grant delete on table "public"."RentedTopos" to "service_role";
grant insert on table "public"."RentedTopos" to "service_role";
grant references on table "public"."RentedTopos" to "service_role";
grant select on table "public"."RentedTopos" to "service_role";
grant trigger on table "public"."RentedTopos" to "service_role";
grant truncate on table "public"."RentedTopos" to "service_role";
grant update on table "public"."RentedTopos" to "service_role";

grant delete on table "public"."Topos" to "anon";
grant insert on table "public"."Topos" to "anon";
grant references on table "public"."Topos" to "anon";
grant select on table "public"."Topos" to "anon";
grant trigger on table "public"."Topos" to "anon";
grant truncate on table "public"."Topos" to "anon";
grant update on table "public"."Topos" to "anon";
grant delete on table "public"."Topos" to "authenticated";
grant insert on table "public"."Topos" to "authenticated";
grant references on table "public"."Topos" to "authenticated";
grant select on table "public"."Topos" to "authenticated";
grant trigger on table "public"."Topos" to "authenticated";
grant truncate on table "public"."Topos" to "authenticated";
grant update on table "public"."Topos" to "authenticated";
grant delete on table "public"."Topos" to "service_role";
grant insert on table "public"."Topos" to "service_role";
grant references on table "public"."Topos" to "service_role";
grant select on table "public"."Topos" to "service_role";
grant trigger on table "public"."Topos" to "service_role";
grant truncate on table "public"."Topos" to "service_role";
grant update on table "public"."Topos" to "service_role";


create policy "Enable ALL for BoardMembers on Topos"
on "public"."Topos"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));

create policy "Enable ALL for BoardMembers on RentedTopos"
on "public"."RentedTopos"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT "BoardMembers".user_id
   FROM "BoardMembers")));