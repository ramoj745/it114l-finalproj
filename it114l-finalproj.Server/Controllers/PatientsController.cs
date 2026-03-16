using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace it114l_finalproj.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly DbConnectionFactory _db;

    public PatientsController(DbConnectionFactory db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            using var conn = _db.CreateConnection();
            var patients = await conn.QueryAsync<Patient>(
                "SELECT * FROM Patients ORDER BY DateCreated DESC");
            return Ok(patients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var patient = await conn.QuerySingleOrDefaultAsync<Patient>(
                "SELECT * FROM Patients WHERE PatientID = @Id", new { Id = id });
            if (patient == null) return NotFound();
            return Ok(patient);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var history = await conn.QueryAsync<AppointmentDetail>(@"
                SELECT
                    a.AppointmentID, a.PatientID, a.DentistID, a.ServiceID,
                    a.AppointmentDate, a.AppointmentTime, a.Status,
                    p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
                    d.FirstName AS DentistFirstName, d.LastName AS DentistLastName,
                    s.ServiceName
                FROM Appointments a
                JOIN Patients p ON a.PatientID = p.PatientID
                JOIN Dentists d ON a.DentistID = d.DentistID
                JOIN Services s ON a.ServiceID = s.ServiceID
                WHERE a.PatientID = @Id
                ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC",
                new { Id = id });
            return Ok(history);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
