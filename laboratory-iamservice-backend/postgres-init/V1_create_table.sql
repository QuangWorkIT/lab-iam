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

CREATE TABLE "Role" (
    role_code VARCHAR(100) PRIMARY KEY,
    role_name VARCHAR(255),
    role_description VARCHAR(500),
    role_privileges VARCHAR(2000),
    role_is_active BOOLEAN,
    role_deletable BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
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
   birthdate DATE,
   password VARCHAR(255) NOT NULL,
   roleCode VARCHAR(255) REFERENCES "Role"(role_code),
   isActive BOOLEAN,
   createdAt DATE,
   version BIGINT DEFAULT 0,
   isDeleted BOOLEAN DEFAULT FALSE,
   deletedAt TIMESTAMP NULL
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

INSERT INTO "Role" (role_code, created_at, role_description, role_is_active, role_name, role_privileges, role_deletable, updated_at) VALUES
('ROLE_ADMIN', '2025-10-21 00:12:54.924656', 'Administrator role with full system access', TRUE, 'admin',
 'ACTIVATE_DEACTIVATE_INSTRUMENT,ADD_COMMENT,ADD_INSTRUMENT,ADD_REAGENTS,CREATE_CONFIGURATION,CREATE_ROLE,CREATE_TEST_ORDER,CREATE_USER,DELETE_COMMENT,DELETE_CONFIGURATION,DELETE_REAGENTS,DELETE_ROLE,DELETE_TEST_ORDER,DELETE_USER,EXECUTE_BLOOD_TESTING,LOCK_UNLOCK_USER,MODIFY_COMMENT,MODIFY_CONFIGURATION,MODIFY_REAGENTS,MODIFY_TEST_ORDER,MODIFY_USER,READ_ONLY,REVIEW_TEST_ORDER,UPDATE_ROLE,VIEW_CONFIGURATION,VIEW_EVENT_LOGS,VIEW_INSTRUMENT,VIEW_ROLE,VIEW_USER',
 FALSE, '2025-10-21 00:12:54.924707'),

('ROLE_SERVICE', '2025-10-21 00:31:53.434822', 'Who are individuals authorized to interact with a system for operational and maintenance purposes. Their main responsibilities involve monitoring, managing, and maintaining the system to ensure optimal performance and reliability.', TRUE, 'service',
 'ACTIVATE_DEACTIVATE_INSTRUMENT,ADD_INSTRUMENT,ADD_REAGENTS,CREATE_CONFIGURATION,DELETE_CONFIGURATION,DELETE_REAGENTS,EXECUTE_BLOOD_TESTING,MODIFY_CONFIGURATION,MODIFY_REAGENTS,VIEW_CONFIGURATION,VIEW_EVENT_LOGS,VIEW_INSTRUMENT,READ_ONLY',
 FALSE, '2025-10-21 00:31:53.434836'),

('ROLE_LAB_MANAGER', '2025-10-21 00:22:20.341159', 'Who manages the lab, lab users, service users, have right to view and monitor the system.', TRUE, 'lab_manager', 'ACTIVATE_DEACTIVATE_INSTRUMENT,ADD_INSTRUMENT,CREATE_ROLE,CREATE_USER,DELETE_REAGENTS,DELETE_ROLE,DELETE_USER,LOCK_UNLOCK_USER,MODIFY_USER,READ_ONLY,UPDATE_ROLE,VIEW_EVENT_LOGS,VIEW_INSTRUMENT,VIEW_ROLE,VIEW_USER',
FALSE, '2025-10-21 00:22:20.341173'),

('ROLE_LAB_USER', '2025-10-21 00:38:54.346716', 'Who work within a laboratory setting and are responsible for conducting tests, analyzing samples, and managing various laboratory processes. Their roles are integral to the effective operation of clinical, research, or industrial laboratories.', TRUE, 'lab_user',
'ACTIVATE_DEACTIVATE_INSTRUMENT,ADD_COMMENT,ADD_INSTRUMENT,ADD_REAGENTS,CREATE_TEST_ORDER,DELETE_COMMENT,DELETE_REAGENTS,DELETE_TEST_ORDER,EXECUTE_BLOOD_TESTING,MODIFY_COMMENT,MODIFY_REAGENTS,MODIFY_TEST_ORDER,REVIEW_TEST_ORDER,VIEW_EVENT_LOGS,VIEW_INSTRUMENT,READ_ONLY',
FALSE, '2025-10-21 00:38:54.346730'),

('ROLE_PATIENT', '2025-10-21 00:45:55.924656', 'Represents a patient user who can view their own records, results, and limited system information but cannot modify or manage any data.', TRUE, 'patient', 'READ_ONLY', FALSE, '2025-10-21 00:45:55.924707'),

('ROLE_DEFAULT', '2025-10-21 00:40:22.384022', 'This is a default or placeholder role. When a user''s role is deleted or removed, this role will replace the previous role until further action by the admin.', TRUE, 'DEFAULT', 'READ_ONLY', FALSE, '2025-10-21 00:40:22.384034');