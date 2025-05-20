-- 1) Seed module categories
INSERT INTO category(name) VALUES
  ('Algorithms'),
  ('Computer Graphics and Vision'),
  ('Databases and Information Systems'),
  ('Machine Learning and Analytics'),
  ('Robotics');

-- 2) Seed a handful of representative courses per category
INSERT INTO course(id, title, description, credits) VALUES
  -- Algorithms
  ('IN3410', 'Selected Topics in Algorithms',
    'Advanced topics in algorithm design and analysis.', 5),
  ('IN3455', 'Graph Algorithms and Network Flows',
    'Study of algorithms for graphs, flows, and matching problems.', 6),
  ('IN3425', 'Approximation Algorithms',
    'Techniques for designing efficient approximation solutions.', 4),

  -- Computer Graphics & Vision
  ('IN2390', 'Advanced Deep Learning for Computer Vision: Visual Computing',
    'Deep learning techniques for image and video understanding.', 8),
  ('IN2018', 'Augmented Reality',
    'Concepts and systems for overlaying digital content on the real world.', 6),
  ('IN2375', 'Computer Vision III: Detection, Segmentation, and Tracking',
    'Algorithms for object detection, segmentation, and tracking in images.', 6),

  -- Databases & Information Systems
  ('CIT3230002', 'Cloud Information Systems',
    'Design and implementation of scalable cloud-based information systems.', 5),
  ('IN2031', 'Application and Implementation of Database Systems',
    'Practical architectures and implementation of modern DBMS.', 6),
  ('IN2219', 'Query Optimization',
    'Techniques for optimizing query execution in database systems.', 6),

  -- Machine Learning & Analytics
  ('IN2298', 'Advanced Deep Learning for Physics',
    'Applying deep neural networks to physical simulations and data.', 6),
  ('CIT4230002', 'Advanced Natural Language Processing',
    'Deep learning methods for language understanding and generation.', 5),
  ('IN2403', 'Artificial Intelligence in Medicine',
    'AI techniques for medical diagnosis and treatment planning.', 5),

  -- Robotics
  ('IN2376', 'Advanced Robot Control and Learning',
    'Reinforcement learning and control strategies for autonomous robots.', 6),
  ('CIT433037', 'Advanced Robot Learning and Decision-Making',
    'Decision-theoretic methods and learning for complex robotic tasks.', 5),
  ('IN2356', 'Autonomous Driving',
    'Algorithms and systems for perception and control of self-driving vehicles.', 3);

-- 3) Link each course to its module category
INSERT INTO course_category(course_id, category_name) VALUES
  -- Algorithms
  ('IN3410', 'Algorithms'),
  ('IN3455', 'Algorithms'),
  ('IN3425', 'Algorithms'),

  -- Computer Graphics & Vision
  ('IN2390', 'Computer Graphics and Vision'),
  ('IN2018', 'Computer Graphics and Vision'),
  ('IN2375', 'Computer Graphics and Vision'),

  -- Databases & Information Systems
  ('CIT3230002', 'Databases and Information Systems'),
  ('IN2031', 'Databases and Information Systems'),
  ('IN2219', 'Databases and Information Systems'),

  -- Machine Learning & Analytics
  ('IN2298', 'Machine Learning and Analytics'),
  ('CIT4230002', 'Machine Learning and Analytics'),
  ('IN2403', 'Machine Learning and Analytics'),

  -- Robotics
  ('IN2376', 'Robotics'),
  ('CIT433037', 'Robotics'),
  ('IN2355', 'Robotics');