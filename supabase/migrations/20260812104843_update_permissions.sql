create policy "Enable read access on InventoryItemEvents for all users"
on "public"."InventoryItemEvents"
as permissive
for select
to authenticated
using (true);