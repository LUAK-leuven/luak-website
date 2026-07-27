-- Populate with some gear

insert into "GearItems" (id, name, deposit_fee, lifespan)
values
    ('c927a2f9-a477-451b-970a-bd548ad0278c', 'quickdraw', 100, 15),
    ('6db74c8e-4f30-4da9-b119-442e536cae1f', 'single rope 000', 1000, 6),
    ('6db74c8e-4f30-4da9-b119-442e536cae1a', 'single rope 001', 1000, 6),
    ('ddf802a4-c5a0-404c-8b66-79f53db724e7', 'double rope 00', 1000, 6),
    ('661c9d36-e119-477b-8b4a-cb5348bb60c5', '60cm sling', 8, 500),
    ('3d0fa316-7210-496c-81f6-8e2873990e93', '120cm sling', 8, 500),
    ('3825a13b-0002-4d44-b7f8-e8d0d8730cd2', 'BD C4 .75', 10, 1000),
    ('6777b0e7-1b72-4572-821c-f0d7e7ed898c', 'BD C4 .5', 10, 1000),
    ('645702cc-5d7a-4c16-9a2a-027e5bcb40c3', 'BD C4 .4', 10, 1000),
    ('3e98f1d3-106e-4a93-9038-2f07019b5eda', 'snapper', 500, 20);

insert into "GearInventory" (gear_item_id, amount, status)
values
    ('c927a2f9-a477-451b-970a-bd548ad0278c', 24, 'available'),
    ('c927a2f9-a477-451b-970a-bd548ad0278c', 12, 'available'),
    ('c927a2f9-a477-451b-970a-bd548ad0278c', 2, 'archived'),
    ('6db74c8e-4f30-4da9-b119-442e536cae1f', 1, 'available'),
    ('6db74c8e-4f30-4da9-b119-442e536cae1a', 1, 'available'),
    ('3825a13b-0002-4d44-b7f8-e8d0d8730cd2', 2, 'available'),
    ('6777b0e7-1b72-4572-821c-f0d7e7ed898c', 2, 'available'),
    ('645702cc-5d7a-4c16-9a2a-027e5bcb40c3', 2, 'available');

insert into "Topos" (id, title, authors, countries, year_published, amount, condition, types_of_climbing, tags, place_in_library, details, languages)
values
  ('539bca6e-417e-44b3-8e6a-fecf223b49a2', 'Topo Flone', array['KBF'], array['Belgium'], 2019, 2, 'good', array['Sport climbing'], array['flone', 'ourthe'], 'belgie', '', array['Dutch']),
  ('184c489c-bee4-4a09-87d1-2b711e2a1248', 'Ailefriode', array[]::text[], array['France'], 2011, 1, 'used', array['Multipitch', 'Sport climbing'], array['ailefroide', 'ecrin'], 'france', '', array['French']);

insert into "CompositeGearItems" (id, name)
values ('2823e385-8611-4ac8-8d36-dbfe00696add', 'AQD');

insert into "CompositeGearItems_GearItems" (gear_item_id, composite_gear_item_id, amount)
values
  ('3e98f1d3-106e-4a93-9038-2f07019b5eda', '2823e385-8611-4ac8-8d36-dbfe00696add', 2),
  ('661c9d36-e119-477b-8b4a-cb5348bb60c5', '2823e385-8611-4ac8-8d36-dbfe00696add', 1);
