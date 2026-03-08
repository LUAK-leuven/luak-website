-- Migrate the RentedGear and RentedTopos tables
alter table "RentedGear"
add column returned_amount numeric;

update "RentedGear"
set "returned_amount" = "rented_amount" - "actual_amount";

alter table "RentedGear"
alter column "returned_amount" SET NOT NULL;

alter table "RentedGear"
DROP column "actual_amount";

alter table "RentedGear"
ADD CONSTRAINT returned_not_exceed_rented
CHECK ("returned_amount" >= 0 and "returned_amount" <= "rented_amount");
--
alter table "RentedTopos"
add column returned_amount numeric;

update "RentedTopos"
set "returned_amount" = "rented_amount" - "actual_amount";

alter table "RentedTopos"
alter column "returned_amount" SET NOT NULL;

alter table "RentedTopos"
DROP column "actual_amount";

alter table "RentedTopos"
ADD CONSTRAINT returned_not_exceed_rented
CHECK ("returned_amount" >= 0 and "returned_amount" <= "rented_amount");


-- Update the Create, Update and Edit rental functions

CREATE OR REPLACE FUNCTION public.create_rental(p_board_member_id uuid, p_member_id uuid, p_date_borrow date, p_date_return date, p_deposit numeric, p_payment_method payment_method, p_status rental_status, p_gear jsonb, p_topos jsonb, p_contact_info text, p_comments text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  rental_id uuid;
  rented_gear_item jsonb;
  gear_item_id uuid;
  gear_item_amount numeric;
BEGIN
  -- Create the Rental
  insert into "Rentals" (board_member_id, member_id, date_borrow, date_return, deposit, payment_method, status, contact_info, comments)
  values (p_board_member_id, p_member_id, p_date_borrow, p_date_return, p_deposit, p_payment_method, p_status, p_contact_info, p_comments)
  returning id into rental_id;

  -- Save the Gear
  for rented_gear_item in select jsonb_array_elements(p_gear)
  loop
    gear_item_id := (rented_gear_item ->> 'gear_item_id')::uuid;
    gear_item_amount := (rented_gear_item ->> 'rented_amount')::numeric;

    insert into "RentedGear" (gear_item_id, rental_id, rented_amount, returned_amount)
    values (gear_item_id, rental_id, gear_item_amount, 0);
  end loop;

  -- Save the Topos
  for rented_gear_item in select jsonb_array_elements(p_topos)
  loop
    gear_item_id := (rented_gear_item ->> 'topo_id')::uuid;
    gear_item_amount := (rented_gear_item ->> 'rented_amount')::numeric;

    insert into "RentedTopos" (topo_id, rental_id, rented_amount, returned_amount)
    values (gear_item_id, rental_id, gear_item_amount, 0);
  end loop;
  
  return rental_id;
END;$function$
;

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
    item_id := (gear_item ->> 'gear_item_id')::uuid;
    item_amount := (gear_item ->> 'returned_amount')::numeric;

    update "RentedGear"
    set returned_amount = item_amount, last_edited_date = now()
    where gear_item_id = item_id and rental_id = p_rental_id;

    if not found then
      raise exception 'GearItem % does not belong to Rental % or does not exist',
        item_id, p_rental_id;
    end if;
  end loop;

  -- Update the Topos
  for gear_item in select jsonb_array_elements(p_topos)
  loop
    item_id := (gear_item ->> 'topo_id')::uuid;
    item_amount := (gear_item ->> 'returned_amount')::numeric;

    update "RentedTopos"
    set returned_amount = item_amount, last_edited_date = now()
    where topo_id = item_id and rental_id = p_rental_id;

    if not found then
      raise exception 'Topo % does not belong to Rental % or does not exist',
        item_id, p_rental_id;
    end if;
  end loop;
END;$$
;

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
      insert into "RentedGear" (gear_item_id, rental_id, rented_amount, returned_amount)
      values (item_id, p_rental_id, item_amount, 0)
      on conflict (gear_item_id, rental_id)
      do update set
        rented_amount = item_amount,
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
      insert into "RentedTopos" (topo_id, rental_id, rented_amount, returned_amount)
      values (item_id, p_rental_id, item_amount, 0)
      on conflict (topo_id, rental_id)
      do update set
        rented_amount = item_amount,
        last_edited_date = now();
    end if;
  end loop;
  
  return p_rental_id;
END;$$
;