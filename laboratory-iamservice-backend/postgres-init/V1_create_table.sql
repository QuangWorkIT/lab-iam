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


INSERT INTO "User"(userId,email,phoneNumber,fullName,indentityNumber,gender,age,address,birthDate,password,roleCode,isActive,createdAt)VALUES
(gen_random_uuid(),'admin@example.com','0901234567','Nguyen Van Admin','012345678901','MALE',30,'Hanoi, Vietnam','1995-05-12',crypt('admin123ADMIN',gen_salt('bf')),'ADMIN',TRUE,CURRENT_DATE),
(gen_random_uuid(),'staff1@example.com','0912345678','Tran Thi Staff','123456789012','FEMALE',28,'Ho Chi Minh City, Vietnam','1997-03-25',crypt('staff123STAFF',gen_salt('bf')),'STAFF',TRUE,CURRENT_DATE),
(gen_random_uuid(),'member1@example.com','0987654321','Le Quang Member','234567890123','MALE',24,'Da Nang, Vietnam','2001-08-14',crypt('member123MEMBER',gen_salt('bf')),'MEMBER',TRUE,CURRENT_DATE),
(gen_random_uuid(),'user1@example.com','0978123456','Pham Thi User','345678901234','FEMALE',22,'Can Tho, Vietnam','2003-01-10',crypt('user123USER',gen_salt('bf')),'USER',TRUE,CURRENT_DATE),
(gen_random_uuid(),'guest@example.com','0923456789','Hoang Minh Guest','456789012345','MALE',20,'Hai Phong, Vietnam','2005-07-20',crypt('guest123GUEST',gen_salt('bf')),'GUEST',FALSE,CURRENT_DATE);
