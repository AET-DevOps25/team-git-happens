CREATE TABLE course_category (
  course_id     VARCHAR(10) NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (course_id, category_name),
  FOREIGN KEY (course_id)     REFERENCES course(id),
  FOREIGN KEY (category_name) REFERENCES category(name)
);