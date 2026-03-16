using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace it114l_finalproj.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DbConnectionFactory _db;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public AuthController(DbConnectionFactory db, IConfiguration config, IWebHostEnvironment env)
    {
        _db = db;
        _config = config;
        _env = env;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var admin = await conn.QuerySingleOrDefaultAsync<Admin>(
                "SELECT * FROM Admins WHERE Username = @Username",
                new { request.Username });

            if (admin == null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            var token = GenerateJwt(admin);
            return Ok(new { token, username = admin.Username });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Dev-only: creates a default admin if none exist yet
    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        if (!_env.IsDevelopment())
            return NotFound();

        try
        {
            using var conn = _db.CreateConnection();
            var count = await conn.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Admins");
            if (count > 0)
                return BadRequest(new { message = "Admins already exist. Use the admin panel to manage accounts." });

            var hash = BCrypt.Net.BCrypt.HashPassword("admin123");
            await conn.ExecuteAsync(
                "INSERT INTO Admins (Username, PasswordHash) VALUES (@Username, @PasswordHash)",
                new { Username = "admin", PasswordHash = hash });

            return Ok(new { message = "Default admin created. Username: admin | Password: admin123 — change this immediately." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    private string GenerateJwt(Admin admin)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, admin.AdminID.ToString()),
            new Claim(ClaimTypes.Name, admin.Username)
        };
        var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.AddHours(8),
            claims: claims,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
