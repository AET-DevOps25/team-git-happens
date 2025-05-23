CREATE TABLE course (
  id          VARCHAR(10) PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  credits     INT         NOT NULL
);