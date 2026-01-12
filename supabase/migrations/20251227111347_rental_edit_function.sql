-- Chagne RentedGear index
alter table "public"."RentedGear" drop constraint "RentedGear_pkey";
drop index if exists "public"."RentedGear_pkey";
alter table "public"."RentedGear" drop column "id";

CREATE UNIQUE INDEX "RentedGear_pkey" ON public."RentedGear" USING btree (gear_item_id, rental_id);
alter table "public"."RentedGear" add constraint "RentedGear_pkey" PRIMARY KEY using index "RentedGear_pkey";

-- Change RentedTopos index
alter table "public"."RentedTopos" drop constraint "RentedTopos_pkey";
drop index if exists "public"."RentedTopos_pkey";
alter table "public"."RentedTopos" drop column "id";

CREATE UNIQUE INDEX "RentedTopos_pkey" ON public."RentedTopos" USING btree (topo_id, rental_id);
alter table "public"."RentedTopos" add constraint "RentedTopos_pkey" PRIMARY KEY using index "RentedTopos_pkey";


-- Change update_rental function to use new index
CREATE OR REPLACE FUNCTION public.update_rental(p_rental_id uuid, p_date_return date, p_deposit_returned boolean, p_status rental_status, p_gear jsonb, p_topos jsonb, p_comments text)
 RETURNS void
 LANGUAGE plpgsql
AS $$
DECLARE
  gear_item jsonb;
  item_id uuid;
  item_amount numeric;
BEGIN
  -- Make sure the rental exists (optional but helpful)
  if not exists (
    select 1 from "Rentals" r where r.id = p_rental_id
  ) then
    raise exception 'Rental % does not exist', p_rental_id;
  end if;

  -- Update the Rental
  update "Rentals"
  set date_return = p_date_return,
    deposit_returned = p_deposit_returned,
    status = p_status,
    comments = p_comments
  where id = p_rental_id;

  -- Update the Gear
  for gear_item in select jsonb_array_elements(p_gear)
  loop
    item_id := (gear_item ->> 'id')::uuid;
    item_amount := (gear_item ->> 'actualAmount')::numeric;

    update "RentedGear"
    set actual_amount = item_amount, last_edited_date = now()
    where gear_item_id = item_id and rental_id = p_rental_id;

    if not found then
      raise exception 'GearItem % does not belong to Rental % or does not exist',
        item_id, p_rental_id;
    end if;
  end loop;

  -- Update the Topos
  for gear_item in select jsonb_array_elements(p_topos)
  loop
    item_id := (gear_item ->> 'id')::uuid;
    item_amount := (gear_item ->> 'actualAmount')::numeric;

    update "RentedTopos"
    set actual_amount = item_amount, last_edited_date = now()
    where gear_item_id = item_id and rental_id = p_rental_id;

    if not found then
      raise exception 'Topo % does not belong to Rental % or does not exist',
        item_id, p_rental_id;
    end if;
  end loop;
END;$$
;


-- Create new function to update a rental
CREATE OR REPLACE FUNCTION public.edit_rental(p_rental_id uuid, p_date_borrow date, p_date_return date, p_deposit numeric, p_payment_method payment_method, p_status rental_status, p_gear jsonb, p_topos jsonb, p_contact_info text, p_comments text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $$
DECLARE
  rented_item jsonb;
  item_id uuid;
  item_amount numeric;
BEGIN
  -- Make sure the rental exists
  if not exists (
    select 1 from "Rentals" r where r.id = p_rental_id
  ) then
    raise exception 'Rental % does not exist', p_rental_id;
  end if;

  -- Update the Rental
  update "Rentals"
  set date_borrow = p_date_borrow,
    date_return = p_date_return,
    deposit = p_deposit,
    payment_method = p_payment_method,
    status = p_status,
    comments = p_comments
  where id = p_rental_id;

  -- Update the Gear
  for rented_item in select jsonb_array_elements(p_gear)
  loop
    item_id := (rented_item ->> 'gear_item_id')::uuid;
    item_amount := (rented_item ->> 'rented_amount')::numeric;

    if item_amount = 0 then
      delete from "RentedGear"
      where rental_id = p_rental_id and gear_item_id = item_id;
    else
      insert into "RentedGear" (gear_item_id, rental_id, rented_amount, actual_amount)
      values (item_id, p_rental_id, item_amount, item_amount)
      on conflict (gear_item_id, rental_id)
      do update set
        rented_amount = item_amount,
        actual_amount = item_amount,
        last_edited_date = now();
    end if;
  end loop;

  -- Update the Topos
  for rented_item in select jsonb_array_elements(p_topos)
  loop
    item_id := (rented_item ->> 'topo_id')::uuid;
    item_amount := (rented_item ->> 'rented_amount')::numeric;

    if item_amount = 0 then
      delete from "RentedTopos"
      where rental_id = p_rental_id and topo_id = item_id;
    else
      insert into "RentedTopos" (topo_id, rental_id, rented_amount, actual_amount)
      values (item_id, p_rental_id, item_amount, item_amount)
      on conflict (topo_id, rental_id)
      do update set
        rented_amount = item_amount,
        actual_amount = item_amount,
        last_edited_date = now();
    end if;
  end loop;
  
  return p_rental_id;
END;$$
;