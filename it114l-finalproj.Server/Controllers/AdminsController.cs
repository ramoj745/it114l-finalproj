using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace it114l_finalproj.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminsController : ControllerBase
{
    private readonly DbConnectionFactory _db;

    public AdminsController(DbConnectionFactory db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            using var conn = _db.CreateConnection();
            var admins = await conn.QueryAsync(
                "SELECT AdminID, Username FROM Admins ORDER BY Username");
            return Ok(admins);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdminRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var exists = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(*) FROM Admins WHERE Username = @Username", new { request.Username });
            if (exists > 0)
                return Conflict(new { message = "Username already exists." });

            var hash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var id = await conn.ExecuteScalarAsync<int>(@"
                INSERT INTO Admins (Username, PasswordHash)
                OUTPUT INSERTED.AdminID
                VALUES (@Username, @PasswordHash)",
                new { request.Username, PasswordHash = hash });

            return Ok(new { adminID = id, username = request.Username });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var currentAdminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (currentAdminId == id)
                return BadRequest(new { message = "Cannot delete your own account." });

            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(
                "DELETE FROM Admins WHERE AdminID = @Id", new { Id = id });
            if (rows == 0) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
