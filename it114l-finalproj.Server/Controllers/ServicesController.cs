using Dapper;
using it114l_finalproj.Server.Data;
using it114l_finalproj.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace it114l_finalproj.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly DbConnectionFactory _db;

    public ServicesController(DbConnectionFactory db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            using var conn = _db.CreateConnection();
            var services = await conn.QueryAsync<Service>(
                "SELECT * FROM Services ORDER BY ServiceName");
            return Ok(services);
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
            var service = await conn.QuerySingleOrDefaultAsync<Service>(
                "SELECT * FROM Services WHERE ServiceID = @Id", new { Id = id });
            if (service == null) return NotFound();
            return Ok(service);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateServiceRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var id = await conn.ExecuteScalarAsync<int>(@"
                INSERT INTO Services (ServiceName, Description, Price)
                OUTPUT INSERTED.ServiceID
                VALUES (@ServiceName, @Description, @Price)",
                request);
            var created = await conn.QuerySingleAsync<Service>(
                "SELECT * FROM Services WHERE ServiceID = @Id", new { Id = id });
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceRequest request)
    {
        try
        {
            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(@"
                UPDATE Services SET
                    ServiceName = @ServiceName,
                    Description = @Description,
                    Price = @Price
                WHERE ServiceID = @Id",
                new { request.ServiceName, request.Description, request.Price, Id = id });
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
                "DELETE FROM Services WHERE ServiceID = @Id", new { Id = id });
            if (rows == 0) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
