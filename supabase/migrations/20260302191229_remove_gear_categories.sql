alter table "public"."GearItems" add column deposit_fee numeric;
alter table "public"."GearItems" add column lifespan numeric;

update "public"."GearItems" i
set deposit_fee = c.deposit_fee, lifespan = c.lifespan
from "public"."GearCategories" c
where i.gear_category_id = c.id;

alter table "public"."GearItems"
alter column deposit_fee set not null;
alter table "public"."GearItems"
alter column lifespan set not null;

alter table "public"."GearItems"
drop constraint if exists "GearItems_gear_category_id_fkey";

alter table "public"."GearItems"
drop column gear_category_id;

drop table "public"."GearCategories";
