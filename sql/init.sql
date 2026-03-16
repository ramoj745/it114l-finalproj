-- ================================================
-- Abainza Dental Clinic - Database Init Script
-- Run once in SQL Server Management Studio (SSMS)
-- ================================================

CREATE DATABASE DentalClinicDB;
GO

USE DentalClinicDB;
GO

CREATE TABLE Patients (
    PatientID       INT             PRIMARY KEY IDENTITY(1,1),
    FirstName       NVARCHAR(50)    NOT NULL,
    LastName        NVARCHAR(50)    NOT NULL,
    ContactNumber   NVARCHAR(11)    NOT NULL,
    Email           NVARCHAR(100)   NOT NULL,
    DateCreated     DATETIME        NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Dentists (
    DentistID       INT             PRIMARY KEY IDENTITY(1,1),
    FirstName       NVARCHAR(50)    NOT NULL,
    LastName        NVARCHAR(50)    NOT NULL,
    ContactNumber   NVARCHAR(11)    NOT NULL,
    Email           NVARCHAR(100)   NOT NULL,
    Specialization  NVARCHAR(100)   NOT NULL
);

CREATE TABLE Services (
    ServiceID       INT             PRIMARY KEY IDENTITY(1,1),
    ServiceName     NVARCHAR(100)   NOT NULL,
    Description     NVARCHAR(255)   NOT NULL,
    Price           DECIMAL(10,2)   NOT NULL
);

CREATE TABLE Admins (
    AdminID         INT             PRIMARY KEY IDENTITY(1,1),
    Username        NVARCHAR(50)    NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255)   NOT NULL
);

CREATE TABLE Appointments (
    AppointmentID   INT             PRIMARY KEY IDENTITY(1,1),
    PatientID       INT             NOT NULL REFERENCES Patients(PatientID),
    DentistID       INT             NOT NULL REFERENCES Dentists(DentistID),
    ServiceID       INT             NOT NULL REFERENCES Services(ServiceID),
    AppointmentDate DATE            NOT NULL,
    AppointmentTime TIME            NOT NULL,
    Status          NVARCHAR(20)    NOT NULL DEFAULT 'Pending'
        CONSTRAINT CK_Appointments_Status CHECK (Status IN ('Pending', 'Approved', 'Completed', 'Cancelled'))
);
GO

-- ================================================
-- First-time setup: create the initial admin account
-- Option A (recommended): hit POST /api/auth/seed in Swagger while in Development.
--   This creates: username=admin, password=admin123
--   Change the password immediately after first login via Manage Admins.
--
-- Option B: insert manually with a pre-computed bcrypt hash.
-- ================================================
