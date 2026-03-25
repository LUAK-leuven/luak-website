-- Create some test users

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) (
  SELECT
    '00000000-0000-0000-0000-000000000000',
    id::uuid,
    'authenticated',
    'authenticated',
    user_name || '@test.com',
    extensions.crypt('123456789', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  FROM
    unnest(
      ARRAY['non_member', 'unpaid_membership', 'paid_last_year', 'paid_this_year', 'board_member'],
      ARRAY['e8d51e8f-9276-47b2-99b2-5eec4f3ca764', '49d86240-8648-4700-bcba-7f3a73d6d1de', 'ebc0eb9c-e6a5-40ce-a4f4-4d4556ce78ea', '5bc9455f-b641-4582-a880-e69478250b0d', '8c771dd8-fc00-40e4-b295-9fa8707612e5']
    ) as u(user_name, id)
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) (
  SELECT
    gen_random_uuid(),
    id,
    format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
    'email',
    gen_random_uuid(),
    current_timestamp,
    current_timestamp,
    current_timestamp
  FROM
    auth.users
);

INSERT INTO "Users" (id, first_name, last_name, email) (
  SELECT
    id, email, '', email
  FROM auth.users
);

insert into "Memberships" (id, user_id, year, student, sportscard, kbf_uiaa_member)
values
  ('13550e82-bf84-46d9-a805-8fe0330dcaf1', '49d86240-8648-4700-bcba-7f3a73d6d1de', 2025, 'student_kul', true, 'kbf_luak'),
  ('d084996a-06ce-45f8-ae1b-0c11a97fd13a', 'ebc0eb9c-e6a5-40ce-a4f4-4d4556ce78ea', 2024, 'phd_kul', false, 'not'),
  ('25c9c665-6796-4408-a9a4-3819ced8cf39', 'ebc0eb9c-e6a5-40ce-a4f4-4d4556ce78ea', 2025, 'phd_kul', false, 'not'),
  ('38e173bd-35f5-4892-b90a-a0602bd198fc', '5bc9455f-b641-4582-a880-e69478250b0d', 2024, 'not_student', false, 'kbf_other'),
  ('7476465d-b5fd-47aa-9ec4-4cd8822ccfa8', '5bc9455f-b641-4582-a880-e69478250b0d', 2025, 'not_student', false, 'kbf_other');

insert into "Payments" (id, membership_id, amount, approved)
values
  ('0', 'd084996a-06ce-45f8-ae1b-0c11a97fd13a', 15, true),
  ('1', '38e173bd-35f5-4892-b90a-a0602bd198fc', 15, true),
  ('2', '7476465d-b5fd-47aa-9ec4-4cd8822ccfa8', 20, true);

insert into "BoardMembers" (user_id) values ('8c771dd8-fc00-40e4-b295-9fa8707612e5');


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


-- Create some rentals
select public.create_rental('8c771dd8-fc00-40e4-b295-9fa8707612e5'::uuid, '49d86240-8648-4700-bcba-7f3a73d6d1de'::uuid, current_date, current_date, 20, 'transfer'::payment_method, 'not_returned'::rental_status, '[{"gear_item_id": "c927a2f9-a477-451b-970a-bd548ad0278c", "rented_amount": 12}, {"gear_item_id": "6db74c8e-4f30-4da9-b119-442e536cae1f", "rented_amount": 1}]', '[]', null, 'A stupid comment'::text);
select public.create_rental('8c771dd8-fc00-40e4-b295-9fa8707612e5'::uuid, 'ebc0eb9c-e6a5-40ce-a4f4-4d4556ce78ea'::uuid, current_date, current_date, 50, 'transfer'::payment_method, 'partially_returned'::rental_status, '[{"gear_item_id": "3825a13b-0002-4d44-b7f8-e8d0d8730cd2", "rented_amount": 1}, {"gear_item_id": "6777b0e7-1b72-4572-821c-f0d7e7ed898c", "rented_amount": 1}, {"gear_item_id": "645702cc-5d7a-4c16-9a2a-027e5bcb40c3", "rented_amount": 1}]', '[{"topo_id": "539bca6e-417e-44b3-8e6a-fecf223b49a2", "rented_amount": 1}]', null, null);
select public.create_rental('8c771dd8-fc00-40e4-b295-9fa8707612e5'::uuid, null, current_date, current_date, 20, 'cash'::payment_method, 'not_returned'::rental_status, '[{"gear_item_id": "661c9d36-e119-477b-8b4a-cb5348bb60c5", "rented_amount": 1}]', '[]', '{"fullName": "someone", "email": "my.contact@info.be", "phoneNumber": "1234"}', null);

insert into "CompositeGearItems" (id, name)
values ('2823e385-8611-4ac8-8d36-dbfe00696add', 'AQD');

insert into "CompositeGearItems_GearItems" (gear_item_id, composite_gear_item_id, amount)
values
  ('3e98f1d3-106e-4a93-9038-2f07019b5eda', '2823e385-8611-4ac8-8d36-dbfe00696add', 2),
  ('661c9d36-e119-477b-8b4a-cb5348bb60c5', '2823e385-8611-4ac8-8d36-dbfe00696add', 1);
