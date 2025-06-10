-- Add more students to better test the review feature
INSERT INTO students (matriculation_number, name, email, password_hash) VALUES
  ('03752000', 
   'Anna Schmidt', 
   'anna.schmidt@tum.de',
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  ),
  ('02233222', 
   'Jonas Weber', 
   'jonas.weber@mytum.de', 
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  ),
  ('05456789', 
   'Sophie Bauer', 
   'sophie.bauer@tum.de', 
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  ),
  ('01122334', 
   'Thomas Müller', 
   'thomas.mueller@mytum.de', 
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  ),
  ('07890123', 
   'Maria Fischer', 
   'maria.fischer@tum.de', 
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  ),
  ('06543210', 
   'Lukas Hoffmann', 
   'lukas.hoffmann@mytum.de', 
   '$2b$10$wmZkK7rB3UTU1w96CeT8Te6hNZNVhRPW5.2wzXAG64shpbRnEBlU.'  -- bcrypt("pass123")
  );
