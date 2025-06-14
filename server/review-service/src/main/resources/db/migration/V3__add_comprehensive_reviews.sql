-- Clear existing sample reviews (V2) to avoid duplicates
DELETE FROM reviews;

-- Insert comprehensive set of reviews for all courses with real student IDs
INSERT INTO reviews (
  course_id,
  student_id,
  rating,
  review_text,
  created_at
) VALUES
  -- Selected Topics in Algorithms (IN3410)
  ('IN3410', '03752000', 5, 'Excellent course that deepened my understanding of advanced algorithm design. The instructor explained complex topics clearly.', '2025-05-02 10:30:00'),
  ('IN3410', '02233222', 4, 'Well-structured material but the pace was sometimes too quick. Good programming assignments.', '2025-05-04 14:15:00'),
  ('IN3410', '05456789', 5, 'One of the best algorithm courses I\'ve taken. The problem sets were challenging but rewarding.', '2025-05-06 09:45:00'),
  ('IN3410', '04242439', 3, 'Interesting content, but the grading was too harsh. Would recommend only for those with strong math backgrounds.', '2025-05-10 16:20:00'),
  
  -- Graph Algorithms and Network Flows (IN3455)
  ('IN3455', '01122334', 5, 'Fascinating course on graph theory. The network flow algorithms were explained brilliantly.', '2025-05-01 11:00:00'),
  ('IN3455', '03773771', 4, 'Very practical applications of graph algorithms. The visualization tools helped a lot with understanding.', '2025-05-05 13:30:00'),
  ('IN3455', '06543210', 3, 'Good content but too theoretical. Could use more programming exercises.', '2025-05-07 15:45:00'),
  
  -- Approximation Algorithms (IN3425)
  ('IN3425', '05456789', 5, 'Perfect balance of theory and practice. The approximation techniques are directly applicable to my research.', '2025-05-03 09:15:00'),
  ('IN3425', '07890123', 4, 'Challenging but rewarding. The instructor was always available during office hours to clarify doubts.', '2025-05-08 14:00:00'),
  
  -- Advanced Deep Learning for Computer Vision (IN2390)
  ('IN2390', '03752000', 5, 'State-of-the-art techniques taught in a clear manner. The projects were challenging but extremely rewarding.', '2025-05-02 10:00:00'),
  ('IN2390', '02233222', 5, 'Excellent course that prepared me well for my ML internship. Very hands-on with great resources.', '2025-05-06 11:30:00'),
  ('IN2390', '04242439', 4, 'Cutting-edge content, but requires substantial background in deep learning. The GPU resources provided were helpful.', '2025-05-09 16:45:00'),
  ('IN2390', '03773771', 5, 'One of the most practical ML courses I\'ve taken. Great balance of theory and implementation.', '2025-05-12 13:15:00'),
  
  -- Augmented Reality (IN2018)
  ('IN2018', '06543210', 4, 'Great introduction to AR. The hands-on projects were fun and educational.', '2025-05-04 10:30:00'),
  ('IN2018', '01122334', 5, 'Amazing course that taught both technical and design aspects of AR. The final project was challenging but extremely rewarding.', '2025-05-07 14:45:00'),
  ('IN2018', '07890123', 3, 'Interesting material but the technical requirements were too high. Needed better preparation for the projects.', '2025-05-11 09:30:00'),
  
  -- Computer Vision III (IN2375)
  ('IN2375', '05456789', 5, 'Comprehensive coverage of modern computer vision topics. The tracking algorithms were especially well-explained.', '2025-05-03 15:20:00'),
  ('IN2375', '03752000', 4, 'Very current content with good theoretical foundations. The programming assignments were challenging.', '2025-05-08 11:10:00'),
  
  -- Cloud Information Systems (CIT3230002)
  ('CIT3230002', '02233222', 4, 'Practical course that taught me a lot about cloud architecture and scalability. Good mix of theory and hands-on work.', '2025-05-05 09:45:00'),
  ('CIT3230002', '04242439', 5, 'Excellent overview of modern cloud technologies. The projects were directly applicable to industry.', '2025-05-09 14:30:00'),
  ('CIT3230002', '01122334', 3, 'Good content but too many different technologies covered too quickly. Could be more focused.', '2025-05-13 10:15:00'),
  
  -- Application and Implementation of Database Systems (IN2031)
  ('IN2031', '03773771', 5, 'Deep dive into database internals. Extremely informative and well-structured.', '2025-05-02 13:45:00'),
  ('IN2031', '07890123', 4, 'Practical knowledge about real-world database systems. The assignments reinforced learning well.', '2025-05-06 16:20:00'),
  ('IN2031', '06543210', 4, 'Great course for understanding how databases actually work under the hood. Challenging but worth it.', '2025-05-10 11:30:00'),
  
  -- Query Optimization (IN2219)
  ('IN2219', '03752000', 5, 'Fascinating look at database performance optimization. The concepts are immediately applicable to my work.', '2025-05-04 14:00:00'),
  ('IN2219', '05456789', 4, 'Very specialized but incredibly useful course. The instructor was knowledgeable and approachable.', '2025-05-09 10:45:00'),
  
  -- Advanced Deep Learning for Physics (IN2298)
  ('IN2298', '02233222', 5, 'Perfect intersection of physics and ML. Challenging but incredibly rewarding for those with the right background.', '2025-05-01 15:30:00'),
  ('IN2298', '01122334', 3, 'Interesting content but requires strong background in both physics and deep learning. Could be more accessible.', '2025-05-07 09:15:00'),
  ('IN2298', '03773771', 4, 'Novel applications of ML to physics problems. The simulations were particularly interesting.', '2025-05-11 13:00:00'),
  
  -- Advanced Natural Language Processing (CIT4230002)
  ('CIT4230002', '04242439', 5, 'Cutting-edge NLP techniques with excellent practical implementations. The transformer models section was outstanding.', '2025-05-03 11:45:00'),
  ('CIT4230002', '06543210', 4, 'Great overview of modern NLP. The assignments were challenging but instructive.', '2025-05-08 16:30:00'),
  ('CIT4230002', '07890123', 5, 'One of the best NLP courses available. Covers both theory and implementation extremely well.', '2025-05-12 10:00:00'),
  
  -- Artificial Intelligence in Medicine (IN2403)
  ('IN2403', '03752000', 2, 'Interesting topic but the course needed more structure. The assignments lacked clear instructions.', '2025-05-04 16:45:00'),
  ('IN2403', '05456789', 5, 'Fascinating applications of AI in healthcare. The case studies were particularly illuminating.', '2025-05-09 09:30:00'),
  ('IN2403', '02233222', 4, 'Good introduction to medical AI applications. Could have gone deeper into some topics.', '2025-05-13 14:15:00'),
  
  -- Advanced Robot Control and Learning (IN2376)
  ('IN2376', '01122334', 5, 'Excellent coverage of modern robotics techniques. The lab sessions were particularly valuable.', '2025-05-02 10:15:00'),
  ('IN2376', '07890123', 4, 'Well-structured introduction to advanced robotics. The simulations helped visualize complex concepts.', '2025-05-06 13:00:00'),
  ('IN2376', '03773771', 5, 'One of the most hands-on robotics courses I\'ve taken. Directly applicable to research and industry.', '2025-05-10 15:45:00'),
  
  -- Advanced Robot Learning and Decision-Making (CIT433037)
  ('CIT433037', '04242439', 4, 'Interesting exploration of decision-theoretic methods in robotics. Good balance of theory and practice.', '2025-05-03 14:30:00'),
  ('CIT433037', '06543210', 5, 'Excellent course on robot learning. The reinforcement learning applications were particularly fascinating.', '2025-05-08 09:00:00'),
  
  -- Autonomous Driving (IN2356)
  ('IN2356', '05456789', 5, 'Comprehensive overview of self-driving technology. The projects were challenging and realistic.', '2025-05-01 16:15:00'),
  ('IN2356', '03752000', 4, 'Very practical course with good coverage of perception and control algorithms.', '2025-05-05 11:00:00'),
  ('IN2356', '02233222', 5, 'Perfect introduction to autonomous systems. The simulator projects were particularly valuable.', '2025-05-09 13:45:00'),
  ('IN2356', '01122334', 4, 'Well-structured course that covers both technical and ethical aspects of autonomous driving.', '2025-05-12 15:30:00');
