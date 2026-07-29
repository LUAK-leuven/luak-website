-- Insert archived events for all gear that is archived
insert into "public"."InventoryItemEvents" (item_id, item_type, event)
select
  id,
  'gear',
  jsonb_build_object(
    'eventName', 'ItemArchivedEvent',
    'amount', i.amount
  )
from "public"."GearInventory" i
where i.status = 'archived'
  AND NOT EXISTS (
    SELECT 1
    FROM "public"."InventoryItemEvents" ie
    WHERE ie.item_id = i.id
      AND ie.item_type = 'gear'
      AND ie.event->>'eventName' = 'ItemArchivedEvent'
  );

-- Drop the status column on GearInventory
alter table "public"."GearInventory" drop column "status";