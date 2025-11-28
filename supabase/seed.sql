insert into "GearCategories" (id, name, lifespan, deposit_fee)
values
    ('5db6abcb-16dd-4ef3-8ff5-eaca46188d05', 'quickdraw', 15, 100),
    ('e76fd07c-0d0a-444f-855a-406e0535e105', 'rope', 6, 1000),
    ('b4539d4c-7ca8-4432-b9d0-6fdef452dee5', 'sling', 8, 500),
    ('936fe56f-7656-43bd-8883-9a184314d4da', 'cam', 10, 1000);

insert into "GearItems" (id, name, gear_category_id)
values
    ('c927a2f9-a477-451b-970a-bd548ad0278c', 'quickdraw', '5db6abcb-16dd-4ef3-8ff5-eaca46188d05'),
    ('6db74c8e-4f30-4da9-b119-442e536cae1f', 'single rope 000', 'e76fd07c-0d0a-444f-855a-406e0535e105'),
    ('6db74c8e-4f30-4da9-b119-442e536cae1a', 'single rope 001', 'e76fd07c-0d0a-444f-855a-406e0535e105'),
    ('ddf802a4-c5a0-404c-8b66-79f53db724e7', 'double rope 00', 'e76fd07c-0d0a-444f-855a-406e0535e105'),
    ('661c9d36-e119-477b-8b4a-cb5348bb60c5', '60cm sling', 'b4539d4c-7ca8-4432-b9d0-6fdef452dee5'),
    ('3d0fa316-7210-496c-81f6-8e2873990e93', '120cm sling', 'b4539d4c-7ca8-4432-b9d0-6fdef452dee5'),
    ('3825a13b-0002-4d44-b7f8-e8d0d8730cd2', 'BD C4 .75', '936fe56f-7656-43bd-8883-9a184314d4da'),
    ('6777b0e7-1b72-4572-821c-f0d7e7ed898c', 'BD C4 .5', '936fe56f-7656-43bd-8883-9a184314d4da'),
    ('645702cc-5d7a-4c16-9a2a-027e5bcb40c3', 'BD C4 .4', '936fe56f-7656-43bd-8883-9a184314d4da');

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
