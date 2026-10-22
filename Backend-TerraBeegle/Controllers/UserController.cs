using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetAll()
    {
        // Retrieving all users from the database and projecting them to UserResponseDTO
        var users = await db.Users.ProjectToType<UserResponseDTO>().ToListAsync();
        return users;
    }
    
    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserResponseDTO>> GetById(long id)
    {
        // Searching for the user by ID
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        return user.Adapt<UserResponseDTO>();
    }
}