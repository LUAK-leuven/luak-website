create type "public"."gear_status" as enum ('available', 'archived');

create table "public"."GearCategories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null default ''::text,
    "lifespan" numeric not null,
    "deposit_fee" numeric not null
);


alter table "public"."GearCategories" enable row level security;

create table "public"."GearInventory" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "category_id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null default gen_random_uuid(),
    "details" text,
    "purchase_date" timestamp with time zone,
    "production_date" timestamp with time zone,
    "amount" numeric not null,
    "status" gear_status not null
);


alter table "public"."GearInventory" enable row level security;

create table "public"."GearItems" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null default ''::text,
    "searchTags" text,
    "is_unique" boolean not null default false
);


alter table "public"."GearItems" enable row level security;

create table "public"."GearLogs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "gear_id" uuid not null default gen_random_uuid(),
    "comment" text not null
);


alter table "public"."GearLogs" enable row level security;

create table "public"."Rentals" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "board_member" uuid not null default gen_random_uuid(),
    "member_id" uuid default gen_random_uuid(),
    "date_borrow" date not null,
    "date_return" date not null,
    "deposit" numeric not null,
    "payment_method" text not null,
    "contact_info" text
);


alter table "public"."Rentals" enable row level security;

create table "public"."RentedGear" (
    "id" uuid not null default gen_random_uuid(),
    "gear_item_id" uuid not null default gen_random_uuid(),
    "rental_id" uuid not null default gen_random_uuid(),
    "amount" numeric not null
);


alter table "public"."RentedGear" enable row level security;

alter table "public"."Payments" alter column "membership_id" set not null;

alter table "public"."Users" alter column "email" set not null;

CREATE UNIQUE INDEX "GearCategories_name_key" ON public."GearCategories" USING btree (name);

CREATE UNIQUE INDEX "GearCategories_pkey" ON public."GearCategories" USING btree (id);

CREATE UNIQUE INDEX "GearInventory_pkey" ON public."GearInventory" USING btree (id);

CREATE UNIQUE INDEX "GearItems_name_key" ON public."GearItems" USING btree (name);

CREATE UNIQUE INDEX "GearItems_pkey" ON public."GearItems" USING btree (id);

CREATE UNIQUE INDEX "GearLogs_pkey" ON public."GearLogs" USING btree (id);

CREATE UNIQUE INDEX "Rentals_pkey" ON public."Rentals" USING btree (id);

CREATE UNIQUE INDEX "RentedGear_pkey" ON public."RentedGear" USING btree (id);

alter table "public"."GearCategories" add constraint "GearCategories_pkey" PRIMARY KEY using index "GearCategories_pkey";

alter table "public"."GearInventory" add constraint "GearInventory_pkey" PRIMARY KEY using index "GearInventory_pkey";

alter table "public"."GearItems" add constraint "GearItems_pkey" PRIMARY KEY using index "GearItems_pkey";

alter table "public"."GearLogs" add constraint "GearLogs_pkey" PRIMARY KEY using index "GearLogs_pkey";

alter table "public"."Rentals" add constraint "Rentals_pkey" PRIMARY KEY using index "Rentals_pkey";

alter table "public"."RentedGear" add constraint "RentedGear_pkey" PRIMARY KEY using index "RentedGear_pkey";

alter table "public"."GearCategories" add constraint "GearCategories_name_key" UNIQUE using index "GearCategories_name_key";

alter table "public"."GearInventory" add constraint "GearInventory_category_id_fkey" FOREIGN KEY (category_id) REFERENCES "GearCategories"(id) ON DELETE SET NULL not valid;

alter table "public"."GearInventory" validate constraint "GearInventory_category_id_fkey";

alter table "public"."GearInventory" add constraint "GearInventory_item_id_fkey" FOREIGN KEY (item_id) REFERENCES "GearItems"(id) ON DELETE SET NULL not valid;

alter table "public"."GearInventory" validate constraint "GearInventory_item_id_fkey";

alter table "public"."GearItems" add constraint "GearItems_name_key" UNIQUE using index "GearItems_name_key";

alter table "public"."GearLogs" add constraint "GearLogs_gear_id_fkey" FOREIGN KEY (gear_id) REFERENCES "GearInventory"(id) ON DELETE RESTRICT not valid;

alter table "public"."GearLogs" validate constraint "GearLogs_gear_id_fkey";

alter table "public"."Rentals" add constraint "Rentals_board_member_fkey" FOREIGN KEY (board_member) REFERENCES "BoardMembers"(user_id) ON DELETE SET NULL not valid;

alter table "public"."Rentals" validate constraint "Rentals_board_member_fkey";

alter table "public"."Rentals" add constraint "Rentals_member_id_fkey" FOREIGN KEY (member_id) REFERENCES "Users"(id) ON DELETE RESTRICT not valid;

alter table "public"."Rentals" validate constraint "Rentals_member_id_fkey";

alter table "public"."RentedGear" add constraint "RentedGear_gear_item_id_fkey" FOREIGN KEY (gear_item_id) REFERENCES "GearItems"(id) ON DELETE RESTRICT not valid;

alter table "public"."RentedGear" validate constraint "RentedGear_gear_item_id_fkey";

alter table "public"."RentedGear" add constraint "RentedGear_rental_id_fkey" FOREIGN KEY (rental_id) REFERENCES "Rentals"(id) ON DELETE RESTRICT not valid;

alter table "public"."RentedGear" validate constraint "RentedGear_rental_id_fkey";

grant delete on table "public"."GearCategories" to "anon";

grant insert on table "public"."GearCategories" to "anon";

grant references on table "public"."GearCategories" to "anon";

grant select on table "public"."GearCategories" to "anon";

grant trigger on table "public"."GearCategories" to "anon";

grant truncate on table "public"."GearCategories" to "anon";

grant update on table "public"."GearCategories" to "anon";

grant delete on table "public"."GearCategories" to "authenticated";

grant insert on table "public"."GearCategories" to "authenticated";

grant references on table "public"."GearCategories" to "authenticated";

grant select on table "public"."GearCategories" to "authenticated";

grant trigger on table "public"."GearCategories" to "authenticated";

grant truncate on table "public"."GearCategories" to "authenticated";

grant update on table "public"."GearCategories" to "authenticated";

grant delete on table "public"."GearCategories" to "service_role";

grant insert on table "public"."GearCategories" to "service_role";

grant references on table "public"."GearCategories" to "service_role";

grant select on table "public"."GearCategories" to "service_role";

grant trigger on table "public"."GearCategories" to "service_role";

grant truncate on table "public"."GearCategories" to "service_role";

grant update on table "public"."GearCategories" to "service_role";

grant delete on table "public"."GearInventory" to "anon";

grant insert on table "public"."GearInventory" to "anon";

grant references on table "public"."GearInventory" to "anon";

grant select on table "public"."GearInventory" to "anon";

grant trigger on table "public"."GearInventory" to "anon";

grant truncate on table "public"."GearInventory" to "anon";

grant update on table "public"."GearInventory" to "anon";

grant delete on table "public"."GearInventory" to "authenticated";

grant insert on table "public"."GearInventory" to "authenticated";

grant references on table "public"."GearInventory" to "authenticated";

grant select on table "public"."GearInventory" to "authenticated";

grant trigger on table "public"."GearInventory" to "authenticated";

grant truncate on table "public"."GearInventory" to "authenticated";

grant update on table "public"."GearInventory" to "authenticated";

grant delete on table "public"."GearInventory" to "service_role";

grant insert on table "public"."GearInventory" to "service_role";

grant references on table "public"."GearInventory" to "service_role";

grant select on table "public"."GearInventory" to "service_role";

grant trigger on table "public"."GearInventory" to "service_role";

grant truncate on table "public"."GearInventory" to "service_role";

grant update on table "public"."GearInventory" to "service_role";

grant delete on table "public"."GearItems" to "anon";

grant insert on table "public"."GearItems" to "anon";

grant references on table "public"."GearItems" to "anon";

grant select on table "public"."GearItems" to "anon";

grant trigger on table "public"."GearItems" to "anon";

grant truncate on table "public"."GearItems" to "anon";

grant update on table "public"."GearItems" to "anon";

grant delete on table "public"."GearItems" to "authenticated";

grant insert on table "public"."GearItems" to "authenticated";

grant references on table "public"."GearItems" to "authenticated";

grant select on table "public"."GearItems" to "authenticated";

grant trigger on table "public"."GearItems" to "authenticated";

grant truncate on table "public"."GearItems" to "authenticated";

grant update on table "public"."GearItems" to "authenticated";

grant delete on table "public"."GearItems" to "service_role";

grant insert on table "public"."GearItems" to "service_role";

grant references on table "public"."GearItems" to "service_role";

grant select on table "public"."GearItems" to "service_role";

grant trigger on table "public"."GearItems" to "service_role";

grant truncate on table "public"."GearItems" to "service_role";

grant update on table "public"."GearItems" to "service_role";

grant delete on table "public"."GearLogs" to "anon";

grant insert on table "public"."GearLogs" to "anon";

grant references on table "public"."GearLogs" to "anon";

grant select on table "public"."GearLogs" to "anon";

grant trigger on table "public"."GearLogs" to "anon";

grant truncate on table "public"."GearLogs" to "anon";

grant update on table "public"."GearLogs" to "anon";

grant delete on table "public"."GearLogs" to "authenticated";

grant insert on table "public"."GearLogs" to "authenticated";

grant references on table "public"."GearLogs" to "authenticated";

grant select on table "public"."GearLogs" to "authenticated";

grant trigger on table "public"."GearLogs" to "authenticated";

grant truncate on table "public"."GearLogs" to "authenticated";

grant update on table "public"."GearLogs" to "authenticated";

grant delete on table "public"."GearLogs" to "service_role";

grant insert on table "public"."GearLogs" to "service_role";

grant references on table "public"."GearLogs" to "service_role";

grant select on table "public"."GearLogs" to "service_role";

grant trigger on table "public"."GearLogs" to "service_role";

grant truncate on table "public"."GearLogs" to "service_role";

grant update on table "public"."GearLogs" to "service_role";

grant delete on table "public"."Rentals" to "anon";

grant insert on table "public"."Rentals" to "anon";

grant references on table "public"."Rentals" to "anon";

grant select on table "public"."Rentals" to "anon";

grant trigger on table "public"."Rentals" to "anon";

grant truncate on table "public"."Rentals" to "anon";

grant update on table "public"."Rentals" to "anon";

grant delete on table "public"."Rentals" to "authenticated";

grant insert on table "public"."Rentals" to "authenticated";

grant references on table "public"."Rentals" to "authenticated";

grant select on table "public"."Rentals" to "authenticated";

grant trigger on table "public"."Rentals" to "authenticated";

grant truncate on table "public"."Rentals" to "authenticated";

grant update on table "public"."Rentals" to "authenticated";

grant delete on table "public"."Rentals" to "service_role";

grant insert on table "public"."Rentals" to "service_role";

grant references on table "public"."Rentals" to "service_role";

grant select on table "public"."Rentals" to "service_role";

grant trigger on table "public"."Rentals" to "service_role";

grant truncate on table "public"."Rentals" to "service_role";

grant update on table "public"."Rentals" to "service_role";

grant delete on table "public"."RentedGear" to "anon";

grant insert on table "public"."RentedGear" to "anon";

grant references on table "public"."RentedGear" to "anon";

grant select on table "public"."RentedGear" to "anon";

grant trigger on table "public"."RentedGear" to "anon";

grant truncate on table "public"."RentedGear" to "anon";

grant update on table "public"."RentedGear" to "anon";

grant delete on table "public"."RentedGear" to "authenticated";

grant insert on table "public"."RentedGear" to "authenticated";

grant references on table "public"."RentedGear" to "authenticated";

grant select on table "public"."RentedGear" to "authenticated";

grant trigger on table "public"."RentedGear" to "authenticated";

grant truncate on table "public"."RentedGear" to "authenticated";

grant update on table "public"."RentedGear" to "authenticated";

grant delete on table "public"."RentedGear" to "service_role";

grant insert on table "public"."RentedGear" to "service_role";

grant references on table "public"."RentedGear" to "service_role";

grant select on table "public"."RentedGear" to "service_role";

grant trigger on table "public"."RentedGear" to "service_role";

grant truncate on table "public"."RentedGear" to "service_role";

grant update on table "public"."RentedGear" to "service_role";

create policy "Enable users to view their own data only"
on "public"."Rentals"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = member_id));



