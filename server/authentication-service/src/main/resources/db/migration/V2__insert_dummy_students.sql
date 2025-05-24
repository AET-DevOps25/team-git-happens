INSERT INTO students (matriculation_number, name, email, password_hash) VALUES
  ('03773771',                -- leading zero preserved
   'Max Mustermann',
   'max.mustermann@tum.de',
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  ),
  ('04242439',
   'Erika Musterfrau',
   'erika.musterfrau@mytum.de',
   '$2b$10$HFBuMybLc.mc0fLh7CASEujs1xgewEJrtxHF8rh0wuMJ4exnj80jq'  -- bcrypt("pass456")
  );