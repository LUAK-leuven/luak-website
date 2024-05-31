alter table "public"."Users" drop constraint "Users_auth_uid_key";

drop index if exists "public"."Users_auth_uid_key";

alter table "public"."Users" drop column "auth_uid";

alter table "public"."Users" drop column "full_name";

alter table "public"."Users" add column "first_name" text not null;

alter table "public"."Users" add column "last_name" text not null;

alter table "public"."Users" alter column "id" drop default;

alter table "public"."Users" alter column "phone_number" set data type text using "phone_number"::text;

alter table "public"."Users" add constraint "Users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Users" validate constraint "Users_id_fkey";


