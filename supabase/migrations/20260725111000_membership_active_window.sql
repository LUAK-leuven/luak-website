CREATE OR REPLACE FUNCTION public.has_membership()
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
  valid_from_year INTEGER;
  has_membership BOOLEAN;
  has_paid BOOLEAN;
BEGIN
  IF EXTRACT(MONTH FROM CURRENT_DATE) >= 8 THEN
    valid_from_year := EXTRACT(YEAR FROM CURRENT_DATE);
  ELSE
    valid_from_year := EXTRACT(YEAR FROM CURRENT_DATE) - 1;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM "Memberships" m
    WHERE m.user_id = auth.uid()
      AND m.created_at::date >= make_date(valid_from_year, 6, 1)
  ) INTO has_membership;

  IF has_membership THEN
    SELECT EXISTS (
      SELECT 1
      FROM "Payments" p
      JOIN "Memberships" m ON m.id = p.membership_id
      WHERE m.user_id = auth.uid()
        AND m.created_at::date >= make_date(valid_from_year, 6, 1)
        AND p.approved
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
