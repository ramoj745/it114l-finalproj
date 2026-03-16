# Database Schema

Database: `DentalClinicDB` (SQL Server)

---

## Patients

Automatically created when a patient books an appointment. Matched by email — repeat bookings reuse the same record.

| Column | Type | Constraints |
|---|---|---|
| PatientID | INT | PK, IDENTITY(1,1) |
| FirstName | NVARCHAR(50) | NOT NULL |
| LastName | NVARCHAR(50) | NOT NULL |
| ContactNumber | NVARCHAR(11) | NOT NULL |
| Email | NVARCHAR(100) | NOT NULL |
| DateCreated | DATETIME | NOT NULL, DEFAULT GETDATE() |

---

## Dentists

Managed by admins. Listed publicly for the booking form.

| Column | Type | Constraints |
|---|---|---|
| DentistID | INT | PK, IDENTITY(1,1) |
| FirstName | NVARCHAR(50) | NOT NULL |
| LastName | NVARCHAR(50) | NOT NULL |
| ContactNumber | NVARCHAR(11) | NOT NULL |
| Email | NVARCHAR(100) | NOT NULL |
| Specialization | NVARCHAR(100) | NOT NULL |

---

## Services

Managed by admins. Listed publicly for the booking form.

| Column | Type | Constraints |
|---|---|---|
| ServiceID | INT | PK, IDENTITY(1,1) |
| ServiceName | NVARCHAR(100) | NOT NULL |
| Description | NVARCHAR(255) | NOT NULL |
| Price | DECIMAL(10,2) | NOT NULL |

---

## Admins

Admin accounts only. Patients do not log in.

| Column | Type | Constraints |
|---|---|---|
| AdminID | INT | PK, IDENTITY(1,1) |
| Username | NVARCHAR(50) | NOT NULL, UNIQUE |
| PasswordHash | NVARCHAR(255) | NOT NULL (bcrypt) |

---

## Appointments

Created when a patient submits the booking form. Status defaults to `Pending`.

| Column | Type | Constraints |
|---|---|---|
| AppointmentID | INT | PK, IDENTITY(1,1) |
| PatientID | INT | FK → Patients(PatientID) |
| DentistID | INT | FK → Dentists(DentistID) |
| ServiceID | INT | FK → Services(ServiceID) |
| AppointmentDate | DATE | NOT NULL |
| AppointmentTime | TIME | NOT NULL |
| Status | NVARCHAR(20) | NOT NULL, DEFAULT 'Pending', CHECK IN ('Pending','Approved','Completed','Cancelled') |
