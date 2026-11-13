-- Gear
insert into "RentalItems" (id, name, deposit_fee, item_type)
values
    ('c927a2f9-a477-451b-970a-bd548ad0278c', 'quickdraw', 100, 'gear'),
    ('6db74c8e-4f30-4da9-b119-442e536cae1f', 'single rope 000', 1000, 'gear'),
    ('6db74c8e-4f30-4da9-b119-442e536cae1a', 'single rope 001', 1000, 'gear'),
    ('ddf802a4-c5a0-404c-8b66-79f53db724e7', 'double rope 00', 1000, 'gear'),
    ('661c9d36-e119-477b-8b4a-cb5348bb60c5', '60cm sling', 800, 'gear'),
    ('3d0fa316-7210-496c-81f6-8e2873990e93', '120cm sling', 800, 'gear'),
    ('3825a13b-0002-4d44-b7f8-e8d0d8730cd2', 'BD C4 .75', 1000, 'gear'),
    ('6777b0e7-1b72-4572-821c-f0d7e7ed898c', 'BD C4 .5', 1000, 'gear'),
    ('645702cc-5d7a-4c16-9a2a-027e5bcb40c3', 'BD C4 .4', 1000, 'gear'),
    ('3e98f1d3-106e-4a93-9038-2f07019b5eda', 'snapper', 500, 'gear');

insert into "Inventory" (id, rental_item_id)
values
    ('90c84d80-04f4-4c55-8f6a-3faf7ccbc2fb', 'c927a2f9-a477-451b-970a-bd548ad0278c'),
    ('3d7a2a9a-8a8a-456c-997e-8533427f6ed1', 'c927a2f9-a477-451b-970a-bd548ad0278c'),
    ('49f1b67b-5289-4056-a43a-c9ad248ad883', 'c927a2f9-a477-451b-970a-bd548ad0278c'),
    ('d60e75c2-8cb6-44fb-bc60-e2053cc9b53f', '6db74c8e-4f30-4da9-b119-442e536cae1f'),
    ('ba9a2e3d-82e2-4d67-92d2-a60534e8ae56', '6db74c8e-4f30-4da9-b119-442e536cae1a'),
    ('a8e3d6e7-c6f7-4b17-ad8d-a406f768dc89', '3825a13b-0002-4d44-b7f8-e8d0d8730cd2'),
    ('e7ae75a1-6002-4294-a49f-d78f19c845b1', '6777b0e7-1b72-4572-821c-f0d7e7ed898c'),
    ('b6594018-1d38-4477-b52e-8991ff6191ce', '645702cc-5d7a-4c16-9a2a-027e5bcb40c3'),
    ('56797154-c64a-4424-8604-67105ba13485', null);

insert into "GearInventory" (id, amount, lifespan)
values
    ('90c84d80-04f4-4c55-8f6a-3faf7ccbc2fb', 24, 15),
    ('3d7a2a9a-8a8a-456c-997e-8533427f6ed1', 12, 15),
    ('49f1b67b-5289-4056-a43a-c9ad248ad883', 2, 15),
    ('d60e75c2-8cb6-44fb-bc60-e2053cc9b53f', 1, 6),
    ('ba9a2e3d-82e2-4d67-92d2-a60534e8ae56', 1, 6),
    ('a8e3d6e7-c6f7-4b17-ad8d-a406f768dc89', 2, 10),
    ('e7ae75a1-6002-4294-a49f-d78f19c845b1', 2, 10),
    ('b6594018-1d38-4477-b52e-8991ff6191ce', 2, 10),
    ('56797154-c64a-4424-8604-67105ba13485', 3, 1000);

-- Topos
insert into "RentalItems" (id, name, deposit_fee, item_type)
values
    ('e6d7293d-253a-45a9-b09a-e8d00e539ab9', 'Topo Flone (2019)', 500, 'topo'),
    ('921d1af7-948c-403e-8b4e-fdc448ca9398', 'Ailefriode (2011)', 500, 'topo');

insert into "Inventory" (id, rental_item_id)
values
    ('539bca6e-417e-44b3-8e6a-fecf223b49a2', 'e6d7293d-253a-45a9-b09a-e8d00e539ab9'),
    ('184c489c-bee4-4a09-87d1-2b711e2a1248', '921d1af7-948c-403e-8b4e-fdc448ca9398');

insert into "Topos" (id, title, authors, countries, year_published, amount, condition, types_of_climbing, tags, place_in_library, details, languages)
values
  ('539bca6e-417e-44b3-8e6a-fecf223b49a2', 'Topo Flone', array['KBF'], array['Belgium'], 2019, 2, 'good', array['Sport climbing'], array['flone', 'ourthe'], 'belgie', '', array['Dutch']),
  ('184c489c-bee4-4a09-87d1-2b711e2a1248', 'Ailefriode', array[]::text[], array['France'], 2011, 1, 'used', array['Multipitch', 'Sport climbing'], array['ailefroide', 'ecrin'], 'france', '', array['French']);

-- Composite Gear Items
insert into "CompositeGearItems" (id, name)
values ('2823e385-8611-4ac8-8d36-dbfe00696add', 'AQD');

insert into "CompositeGearItems_GearItems" (gear_item_id, composite_gear_item_id, amount)
values
  ('3e98f1d3-106e-4a93-9038-2f07019b5eda', '2823e385-8611-4ac8-8d36-dbfe00696add', 2),
  ('661c9d36-e119-477b-8b4a-cb5348bb60c5', '2823e385-8611-4ac8-8d36-dbfe00696add', 1);
