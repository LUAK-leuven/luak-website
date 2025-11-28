create or replace function update_rentals(
  p_rental_id uuid,
  p_date_return date,
  p_deposit_fee numeric,
  p_status rental_status,
  p_gear jsonb
)
returns void
language plpgsql
as $function$
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
    status = p_status
  where id = p_rental_id;

  -- Update the Gear
  for gear_item in select jsonb_array_elements(p_gear)
  loop
    rented_gear_id := (gear_item ->> 'id')::uuid;
    gear_item_amount := (gear_item ->> 'actualAmount')::numeric;

    update "RentedGear"
    set actual_amount = gear_item_amount
    where id = rented_gear_id and rental_id = p_rental_id;

    if not found then
      raise exception 'GearItem % does not belong to Rental % or does not exist',
        rented_gear_id, p_rental_id;
    end if;
  end loop;
END;$function$;
