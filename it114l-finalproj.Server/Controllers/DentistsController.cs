using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace it114l_finalproj.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DentistsController : ControllerBase
{
    private readonly DbConnectionFactory _db;

    public DentistsController(DbConnectionFactory db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            using var conn = _db.CreateConnection();
            var dentists = await conn.QueryAsync<Dentist>(
                "SELECT * FROM Dentists ORDER BY LastName, FirstName");
            return Ok(dentists);
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
            var dentist = await conn.QuerySingleOrDefaultAsync<Dentist>(
                "SELECT * FROM Dentists WHERE DentistID = @Id", new { Id = id });
            if (dentist == null) return NotFound();
            return Ok(dentist);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateDentistRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var id = await conn.ExecuteScalarAsync<int>(@"
                INSERT INTO Dentists (FirstName, LastName, ContactNumber, Email, Specialization)
                OUTPUT INSERTED.DentistID
                VALUES (@FirstName, @LastName, @ContactNumber, @Email, @Specialization)",
                request);
            var created = await conn.QuerySingleAsync<Dentist>(
                "SELECT * FROM Dentists WHERE DentistID = @Id", new { Id = id });
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDentistRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(@"
                UPDATE Dentists SET
                    FirstName = @FirstName, LastName = @LastName,
                    ContactNumber = @ContactNumber, Email = @Email,
                    Specialization = @Specialization
                WHERE DentistID = @Id",
                new { request.FirstName, request.LastName, request.ContactNumber, request.Email, request.Specialization, Id = id });
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

            // 1. Cancel ALL active appointments
            await conn.ExecuteAsync(@"
            UPDATE Appointments
            SET Status = 'Cancelled'
            WHERE DentistID = @Id
            AND Status IN ('Pending', 'Approved')",
                new { Id = id });

            // 2. Remove dentist from ALL remaining appointments
            await conn.ExecuteAsync(@"
            UPDATE Appointments
            SET DentistID = NULL
            WHERE DentistID = @Id",
                new { Id = id });

            // 3. Now delete dentist
            var rows = await conn.ExecuteAsync(
                "DELETE FROM Dentists WHERE DentistID = @Id",
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
