CREATE TABLE course_prerequisite (
  course_id        VARCHAR(10) NOT NULL,
  prerequisite_id  VARCHAR(10) NOT NULL,
  PRIMARY KEY (course_id, prerequisite_id),
  FOREIGN KEY (course_id)       REFERENCES course(id),
  FOREIGN KEY (prerequisite_id) REFERENCES course(id)
);