CREATE TABLE reviews (
  review_id     INT                NOT NULL AUTO_INCREMENT,     
  course_id     VARCHAR(10)        NOT NULL,                   
  student_id    VARCHAR(8)         NOT NULL,                   
  rating        TINYINT UNSIGNED   NOT NULL                   
                   CHECK (rating BETWEEN 0 AND 5),
  review_text   TEXT               NOT NULL,                   
  created_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  INDEX idx_course (course_id),
  INDEX idx_student (student_id)
)