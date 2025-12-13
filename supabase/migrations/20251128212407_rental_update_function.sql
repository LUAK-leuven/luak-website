set check_function_bodies = off;

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

    insert into "RentedGear" (gear_item_id, rental_id, rented_amount, actual_amount)
    values (gear_item_id, rental_id, gear_item_amount, gear_item_amount);
  end loop;

  -- Save the Topos
  for rented_gear_item in select jsonb_array_elements(p_topos)
  loop
    gear_item_id := (rented_gear_item ->> 'topo_id')::uuid;
    gear_item_amount := (rented_gear_item ->> 'rented_amount')::numeric;

    insert into "RentedTopos" (topo_id, rental_id, rented_amount, actual_amount)
    values (gear_item_id, rental_id, gear_item_amount, gear_item_amount);
  end loop;
  
  return rental_id;
END;$function$
;


CREATE OR REPLACE FUNCTION public.update_rental(p_rental_id uuid, p_date_return date, p_deposit_fee numeric, p_status rental_status, p_gear jsonb, p_topos jsonb, p_comments text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  gear_item jsonb;
  rented_gear_id uuid;
  gear_item_amount numeric;
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
    deposit = p_deposit_fee,
    status = p_status,
    comments = p_comments
  where id = p_rental_id;

  -- Update the Gear
  for gear_item in select jsonb_array_elements(p_gear)
  loop
    rented_gear_id := (gear_item ->> 'id')::uuid;
    gear_item_amount := (gear_item ->> 'actualAmount')::numeric;

    update "RentedGear"
    set actual_amount = gear_item_amount, last_edited_date = now()
    where id = rented_gear_id and rental_id = p_rental_id;

    if not found then
      raise exception 'GearItem % does not belong to Rental % or does not exist',
        rented_gear_id, p_rental_id;
    end if;
  end loop;

  -- Update the Topos
  for gear_item in select jsonb_array_elements(p_topos)
  loop
    rented_gear_id := (gear_item ->> 'id')::uuid;
    gear_item_amount := (gear_item ->> 'actualAmount')::numeric;

    update "RentedTopos"
    set actual_amount = gear_item_amount, last_edited_date = now()
    where id = rented_gear_id and rental_id = p_rental_id;

    if not found then
      raise exception 'Topo % does not belong to Rental % or does not exist',
        rented_gear_id, p_rental_id;
    end if;
  end loop;
END;$function$
;
