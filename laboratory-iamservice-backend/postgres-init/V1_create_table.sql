CREATE EXTENSION IF NOT EXISTS pgcrypto;


DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;


-- ===========================================
-- IAM SERVICE TABLES
-- ===========================================

CREATE TABLE "Privileges" (
  name VARCHAR(255) PRIMARY KEY,
  description VARCHAR(255) NOT NULL
);

CREATE TABLE "Role" (
  code VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  privileges VARCHAR(255) REFERENCES "Privileges"(name),
  createdAt DATE,
  lastUpdatedAt DATE,
  isActive BOOLEAN
);

CREATE TABLE "User" (
  userId UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phoneNumber VARCHAR(255),
  fullName VARCHAR(255) NOT NULL,
  identityNumber VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),
  age INT,
  address VARCHAR(255),
  birthDate DATE,
  password VARCHAR(255) NOT NULL,
  roleCode VARCHAR(255) REFERENCES "Role"(code),
  isActive BOOLEAN,
  createdAt DATE
);

CREATE TABLE "Token" (
  id SERIAL PRIMARY KEY,
  userId UUID NOT NULL REFERENCES "User"(userId),
  tokenId VARCHAR(255) NOT NULL,
  expiredAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================
-- INSERT FAKE DATA FOR "User" and "Role" TABLE
-- ===========================================

INSERT INTO "Role" (code, name, description, privileges, createdAt, lastUpdatedAt, isActive)
VALUES
('ADMIN', 'Administrator', 'Full system access', NULL, CURRENT_DATE, CURRENT_DATE, TRUE),
('STAFF', 'Staff', 'Handles management tasks', NULL, CURRENT_DATE, CURRENT_DATE, TRUE),
('MEMBER', 'Member', 'Regular registered user', NULL, CURRENT_DATE, CURRENT_DATE, TRUE),
('USER', 'User', 'Basic access user', NULL, CURRENT_DATE, CURRENT_DATE, TRUE),
('GUEST', 'Guest', 'Unregistered limited access', NULL, CURRENT_DATE, CURRENT_DATE, TRUE);
