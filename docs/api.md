# API Reference

Base URL: `/api`

`[Auth]` = requires `Authorization: Bearer <token>` header.

---

## Auth

### POST /api/auth/login
Login and receive a JWT.

**Body:** `{ username, password }`
**Returns:** `{ token, role, username }`

### POST /api/auth/seed *(dev only)*
Creates the default admin account if no users exist.
- Username: `admin` | Password: `admin123`
- Change the password immediately after first login.

---

## Appointments

### GET /api/appointments `[Auth]`
Returns all appointments with patient, dentist, and service names (joined).

### GET /api/appointments/:id `[Auth]`
Returns a single appointment with joined details.

### POST /api/appointments *(public)*
Books an appointment. Creates a new Patient record if the email doesn't exist.

**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "contactNumber": "string",
  "email": "string",
  "dentistID": 1,
  "serviceID": 1,
  "appointmentDate": "2026-04-01",
  "appointmentTime": "10:00:00"
}
```

### PUT /api/appointments/:id `[Auth]`
Updates appointment details and/or status.

**Body:** `{ dentistID, serviceID, appointmentDate, appointmentTime, status }`

### DELETE /api/appointments/:id `[Auth]`
Deletes an appointment (with confirmation prompt on the frontend).

---

## Dentists

### GET /api/dentists *(public)*
Returns all dentists.

### GET /api/dentists/:id *(public)*
Returns a single dentist.

### POST /api/dentists `[Auth]`
**Body:** `{ firstName, lastName, contactNumber, email, specialization }`

### PUT /api/dentists/:id `[Auth]`
**Body:** `{ firstName, lastName, contactNumber, email, specialization }`

### DELETE /api/dentists/:id `[Auth]`

---

## Services

### GET /api/services *(public)*
Returns all services.

### GET /api/services/:id *(public)*
Returns a single service.

### POST /api/services `[Auth]`
**Body:** `{ serviceName, description, price }`

### PUT /api/services/:id `[Auth]`
**Body:** `{ serviceName, description, price }`

### DELETE /api/services/:id `[Auth]`

---

## Patients

### GET /api/patients `[Auth]`
Returns all patients ordered by date registered.

### GET /api/patients/:id `[Auth]`
Returns a single patient.

### GET /api/patients/:id/history `[Auth]`
Returns all appointments for a patient (joined with dentist and service info).

---

## Users

### GET /api/users `[Auth]`
Returns all admin accounts (UserID, Username, Role — no password hash).

### POST /api/users `[Auth]`
Creates a new admin account.

**Body:** `{ username, password, role }` — role must be `"Admin"` or `"SuperAdmin"`

### DELETE /api/users/:id `[Auth]`
Deletes an admin account. Cannot delete your own account.
