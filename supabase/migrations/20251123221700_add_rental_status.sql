create type "public"."payment_method" as enum ('cash', 'transfer');

create type "public"."rental_status" as enum ('returned', 'partially_returned', 'not_returned');

alter table "public"."Rentals" drop column "returned_deposit";

alter table "public"."Rentals" add column "status" rental_status not null default 'not_returned'::rental_status;

alter table "public"."Rentals" alter column "payment_method" set data type payment_method using "payment_method"::text::payment_method;

drop type "public"."PaymentMethod";


