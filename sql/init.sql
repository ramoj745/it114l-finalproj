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

INSERT INTO Services (ServiceName, Description, Price) VALUES
('Dental Checkups', 'Routine dental examination to assess oral health and detect any dental issues.', 500.00),
('Teeth Cleaning', 'Professional cleaning to remove plaque, tartar, and stains from teeth.', 800.00),
('Cavity Filling', 'Treatment to remove tooth decay and fill the affected tooth.', 1500.00),
('Teeth Whitening', 'Procedure to whiten and brighten discolored teeth.', 3500.00),
('Dental Veneers', 'Thin shells placed on the front of teeth to improve appearance.', 8000.00),
('Orthodontics', 'Treatment that corrects teeth alignment using braces or aligners.', 45000.00),
('Tooth Extraction', 'Removal of a damaged or decayed tooth.', 2000.00),
('Wisdom Teeth Removal', 'Surgical removal of one or more wisdom teeth.', 5000.00),
('Root Canal Treatment', 'Procedure to treat infection inside the tooth pulp.', 7000.00),
('Dentures', 'Removable replacement for missing teeth.', 15000.00);
GO

-- ================================================
-- First-time setup: create the initial admin account
-- Option A (recommended): hit POST /api/auth/seed in Swagger while in Development.
--   This creates: username=admin, password=admin123
--   Change the password immediately after first login via Manage Admins.
--
-- Option B: insert manually with a pre-computed bcrypt hash.
-- ================================================

-- 
CREATE TRIGGER trg_DeleteDentist
ON Dentists
INSTEAD OF DELETE
AS
BEGIN
    UPDATE Appointments
    SET Status = 'Cancelled'
    WHERE DentistID IN (SELECT DentistID FROM deleted)
    AND Status IN ('Pending', 'Approved');

    UPDATE Appointments
    SET DentistID = NULL
    WHERE DentistID IN (SELECT DentistID FROM deleted)
    AND Status = 'Completed';

    DELETE FROM Dentists
    WHERE DentistID IN (SELECT DentistID FROM deleted);
END;