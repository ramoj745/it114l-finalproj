using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using it114l_finalproj.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace it114l_finalproj.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly DbConnectionFactory _db;
        private readonly IEmailSender _emailSender;

        public AppointmentsController(DbConnectionFactory db, IEmailSender emailSender)
        {
            _db = db;
            _emailSender = emailSender;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = _db.CreateConnection();

                var appointments = await conn.QueryAsync<AppointmentDetail>(@"
                    SELECT
                        a.AppointmentID,
                        a.PatientID,
                        a.DentistID,
                        a.ServiceID,
                        a.AppointmentDate,
                        a.AppointmentTime,
                        a.Status,
                        a.ConfirmationCode,
                        a.IsDeleted,
                        p.FirstName AS PatientFirstName,
                        p.LastName AS PatientLastName,
                        p.Email AS PatientEmail,
                        ISNULL(d.FirstName, 'No') AS DentistFirstName,
                        ISNULL(d.LastName, 'Dentist') AS DentistLastName,
                        s.ServiceName
                    FROM Appointments a
                    JOIN Patients p ON a.PatientID = p.PatientID
                    LEFT JOIN Dentists d ON a.DentistID = d.DentistID
                    JOIN Services s ON a.ServiceID = s.ServiceID
                    WHERE a.IsDeleted = 0
                    ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC");

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("availability")]
        public async Task<IActionResult> GetAvailability([FromQuery] int dentistId, [FromQuery] DateTime date)
        {
            try
            {
                using var conn = _db.CreateConnection();

                var bookedTimes = await conn.QueryAsync<TimeSpan>(@"
                    SELECT AppointmentTime
                    FROM Appointments
                    WHERE DentistID = @DentistId
                      AND AppointmentDate = @Date
                      AND Status = 'Approved'
                      AND IsDeleted = 0
                    ORDER BY AppointmentTime",
                    new
                    {
                        DentistId = dentistId,
                        Date = date.Date
                    });

                return Ok(bookedTimes.Select(t => t.ToString(@"hh\:mm")));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Book([FromBody] BookAppointmentRequest request)
        {
            try
            {
                if (!TimeSpan.TryParse(request.AppointmentTime, out TimeSpan apptTime))
                    return BadRequest(new { message = "Invalid time format. Use HH:mm (24-hour), e.g., 14:30." });

                if (apptTime < new TimeSpan(8, 0, 0) || apptTime > new TimeSpan(18, 30, 0))
                    return BadRequest(new { message = "Appointments allowed only between 8:00 and 18:30." });

                using var conn = _db.CreateConnection();

                var clash = await conn.ExecuteScalarAsync<int>(@"
                    SELECT COUNT(1)
                    FROM Appointments
                    WHERE DentistID = @DentistID
                      AND AppointmentDate = @AppointmentDate
                      AND AppointmentTime = @AppointmentTime
                      AND Status IN ('Pending', 'Approved')
                      AND IsDeleted = 0",
                    new
                    {
                        request.DentistID,
                        request.AppointmentDate,
                        AppointmentTime = apptTime
                    });

                if (clash > 0)
                    return Conflict(new { message = "Timeslot already taken for this dentist." });

                var patient = await conn.QuerySingleOrDefaultAsync<Patient>(
                    "SELECT * FROM Patients WHERE Email = @Email",
                    new { request.Email });

                int patientId;

                if (patient == null)
                {
                    patientId = await conn.ExecuteScalarAsync<int>(@"
                        INSERT INTO Patients (FirstName, LastName, ContactNumber, Email, DateCreated)
                        OUTPUT INSERTED.PatientID
                        VALUES (@FirstName, @LastName, @ContactNumber, @Email, GETDATE())",
                        new
                        {
                            request.FirstName,
                            request.LastName,
                            request.ContactNumber,
                            request.Email
                        });
                }
                else
                {
                    patientId = patient.PatientID;

                    await conn.ExecuteAsync(@"
                        UPDATE Patients
                        SET FirstName = @FirstName,
                            LastName = @LastName,
                            ContactNumber = @ContactNumber
                        WHERE PatientID = @PatientID",
                        new
                        {
                            request.FirstName,
                            request.LastName,
                            request.ContactNumber,
                            PatientID = patientId
                        });
                }

                var appointmentId = await conn.ExecuteScalarAsync<int>(@"
                    INSERT INTO Appointments (
                        PatientID,
                        DentistID,
                        ServiceID,
                        AppointmentDate,
                        AppointmentTime,
                        Status,
                        IsDeleted
                    )
                    OUTPUT INSERTED.AppointmentID
                    VALUES (
                        @PatientID,
                        @DentistID,
                        @ServiceID,
                        @AppointmentDate,
                        @AppointmentTime,
                        'Pending',
                        0
                    )",
                    new
                    {
                        PatientID = patientId,
                        request.DentistID,
                        request.ServiceID,
                        request.AppointmentDate,
                        AppointmentTime = apptTime
                    });

                return Ok(new
                {
                    appointmentId,
                    message = "Appointment booked successfully and is pending approval."
                });
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
                if (!TimeSpan.TryParse(request.AppointmentTime, out TimeSpan apptTime))
                    return BadRequest(new { message = "Invalid time format. Use HH:mm (24-hour), e.g., 14:30." });

                if (apptTime < new TimeSpan(8, 0, 0) || apptTime > new TimeSpan(18, 30, 0))
                    return BadRequest(new { message = "Appointments allowed only between 8:00 and 18:30." });

                using var conn = _db.CreateConnection();

                var rows = await conn.ExecuteAsync(@"
                    UPDATE Appointments
                    SET DentistID = @DentistID,
                        ServiceID = @ServiceID,
                        AppointmentDate = @AppointmentDate,
                        AppointmentTime = @AppointmentTime,
                        Status = @Status
                    WHERE AppointmentID = @Id",
                    new
                    {
                        request.DentistID,
                        request.ServiceID,
                        request.AppointmentDate,
                        AppointmentTime = apptTime,
                        request.Status,
                        Id = id
                    });

                if (rows == 0)
                    return NotFound();

                if (request.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
                {
                    var appointmentInfo = await conn.QuerySingleOrDefaultAsync<dynamic>(@"
                        SELECT
                            p.Email,
                            p.FirstName,
                            a.AppointmentDate,
                            a.AppointmentTime
                        FROM Appointments a
                        JOIN Patients p ON a.PatientID = p.PatientID
                        WHERE a.AppointmentID = @Id",
                        new { Id = id });

                    if (appointmentInfo != null && !string.IsNullOrWhiteSpace((string?)appointmentInfo.Email))
                    {
                        var confirmationCode = Guid.NewGuid().ToString("N")[..6].ToUpper();

                        await conn.ExecuteAsync(@"
                            UPDATE Appointments
                            SET ConfirmationCode = @ConfirmationCode
                            WHERE AppointmentID = @Id",
                            new
                            {
                                ConfirmationCode = confirmationCode,
                                Id = id
                            });

                        var formattedTime = appointmentInfo.AppointmentTime is TimeSpan ts
                            ? DateTime.Today.Add(ts).ToString("hh:mm tt")
                            : appointmentInfo.AppointmentTime.ToString();

                        var subject = "Appointment Approved";
                        var body = $@"
                            <p>Hello {appointmentInfo.FirstName},</p>
                            <p>Your appointment has been approved.</p>
                            <p><strong>Date:</strong> {((DateTime)appointmentInfo.AppointmentDate):MMMM dd, yyyy}</p>
                            <p><strong>Time:</strong> {formattedTime}</p>
                            <p><strong>Confirmation Code:</strong> {confirmationCode}</p>
                            <p>Please keep this code for your visit.</p>";

                        await _emailSender.SendAsync((string)appointmentInfo.Email, subject, body);
                    }
                }

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

                var rows = await conn.ExecuteAsync(@"
                    UPDATE Appointments
                    SET IsDeleted = 1
                    WHERE AppointmentID = @Id",
                    new { Id = id });

                if (rows == 0)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}