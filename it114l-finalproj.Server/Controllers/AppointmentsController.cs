using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace it114l_finalproj.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly DbConnectionFactory _db;

    public AppointmentsController(DbConnectionFactory db) => _db = db;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            using var conn = _db.CreateConnection();
            var appointments = await conn.QueryAsync<AppointmentDetail>(@"
                SELECT
                    a.AppointmentID, a.PatientID, a.DentistID, a.ServiceID,
                    a.AppointmentDate, a.AppointmentTime, a.Status,
                    p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
                    ISNULL(d.FirstName, 'No') AS DentistFirstName,
                    ISNULL(d.LastName, 'Dentist') AS DentistLastName,
                    s.ServiceName
                FROM Appointments a
                LEFT JOIN Patients p ON a.PatientID = p.PatientID
                LEFT JOIN Dentists d ON a.DentistID = d.DentistID
                LEFT JOIN Services s ON a.ServiceID = s.ServiceID
                ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC");
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var appointment = await conn.QuerySingleOrDefaultAsync<AppointmentDetail>(@"
                SELECT
                    a.AppointmentID, a.PatientID, a.DentistID, a.ServiceID,
                    a.AppointmentDate, a.AppointmentTime, a.Status,
                    p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
                    ISNULL(d.FirstName, 'No') AS DentistFirstName,
                    ISNULL(d.LastName, 'Dentist') AS DentistLastName,
                    s.ServiceName
                FROM Appointments a
                LEFT JOIN Patients p ON a.PatientID = p.PatientID
                LEFT JOIN Dentists d ON a.DentistID = d.DentistID
                LEFT JOIN Services s ON a.ServiceID = s.ServiceID
                WHERE a.AppointmentID = @Id",
                new { Id = id });

            if (appointment == null) return NotFound();
            return Ok(appointment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Public — patients book here
    [HttpPost]
    public async Task<IActionResult> Book([FromBody] BookAppointmentRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();

            // Find existing patient by email or create a new record
            var patient = await conn.QuerySingleOrDefaultAsync<Patient>(
                "SELECT * FROM Patients WHERE Email = @Email", new { request.Email });

            int patientId;
            if (patient == null)
            {
                patientId = await conn.ExecuteScalarAsync<int>(@"
                    INSERT INTO Patients (FirstName, LastName, ContactNumber, Email, DateCreated)
                    OUTPUT INSERTED.PatientID
                    VALUES (@FirstName, @LastName, @ContactNumber, @Email, GETDATE())",
                    new { request.FirstName, request.LastName, request.ContactNumber, request.Email });
            }
            else
            {
                patientId = patient.PatientID;
                await conn.ExecuteAsync(@"
                    UPDATE Patients 
                    SET FirstName = @FirstName, LastName = @LastName, ContactNumber = @ContactNumber
                    WHERE PatientID = @PatientID",
                    new { request.FirstName, request.LastName, request.ContactNumber, PatientID = patientId });
            }

            var appointmentId = await conn.ExecuteScalarAsync<int>(@"
                INSERT INTO Appointments (PatientID, DentistID, ServiceID, AppointmentDate, AppointmentTime, Status)
                OUTPUT INSERTED.AppointmentID
                VALUES (@PatientID, @DentistID, @ServiceID, @AppointmentDate, @AppointmentTime, 'Pending')",
                new { PatientID = patientId, request.DentistID, request.ServiceID, request.AppointmentDate, request.AppointmentTime });

            return Ok(new { appointmentId, message = "Appointment booked successfully!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(@"
                UPDATE Appointments SET
                    DentistID = @DentistID,
                    ServiceID = @ServiceID,
                    AppointmentDate = @AppointmentDate,
                    AppointmentTime = @AppointmentTime,
                    Status = @Status
                WHERE AppointmentID = @Id",
                new { request.DentistID, request.ServiceID, request.AppointmentDate, request.AppointmentTime, request.Status, Id = id });

            if (rows == 0) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(
                "DELETE FROM Appointments WHERE AppointmentID = @Id", new { Id = id });

            if (rows == 0) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
