using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Authorization;
using Backend_TerraBeegle.Services;
using Backend_TerraBeegle.Models;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/user/{username}/reviews")]
public class ReviewUserController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<ReviewResponseDTO>>> GetReviews(string username, [FromQuery] PaginationDTO pagination)
    {
        var totalCount = await db.Reviews.CountAsync(r => r.User.Username == username);
        var reviews = new List<ReviewResponseDTO>();

        if (totalCount != 0) {
            reviews = await db.Reviews
                .Where(r => r.User.Username == username)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(r => new ReviewResponseDTO
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    User = null, // no need to include the user since we already know the username
                    Game = r.Game.Adapt<GameMinDTO>()
                })
                .ToListAsync();
        }

        return Ok(Utils.CreatePagedResponse(
            reviews,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetReviews), new { username, Page = page, pagination.PageSize })
        ));
    }
}

[ApiController]
[Route("api/games/{gameId:int}/reviews")]
public class ReviewGameController(AppDbContext db, IRawgService rawgService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<ReviewResponseDTO>>> GetReviews(int gameId, [FromQuery] PaginationDTO pagination)
    {
        var totalCount = await db.Reviews.CountAsync(r => r.GameId == gameId);
        var reviews = new List<ReviewResponseDTO>();

        if (totalCount != 0) {
            reviews = await db.Reviews
                .Where(r => r.GameId == gameId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(r => new ReviewResponseDTO
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    User = r.User.Adapt<UserPublicResponseDTO>(),
                    Game = null // no need to include the game since we already know the gameId
                })
                .ToListAsync();
        }

        return Ok(Utils.CreatePagedResponse(
            reviews,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetReviews), new { gameId, Page = page, pagination.PageSize })
        ));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PagedResponseDTO<ReviewResponseDTO>>> CreateReview(int gameId, [FromBody] ReviewCreateDTO reviewCreateDTO)
    {
        if (reviewCreateDTO.Rating < 1 || reviewCreateDTO.Rating > 5)
        {
            return BadRequest("Rating must be between 1 and 5.");
        }

        var currentUserId = Utils.GetCurrentUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var user = await db.Users.FindAsync(currentUserId.Value);
        if (user is null)
        {
            return NotFound("User not found.");
        }

        // Check if the game exists
        Game? game;
        try
        {
            game = await rawgService.CreateGameAsync(gameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
        {
            return NotFound("Game not found.");
        }

        // Create a new review
        var review = new Review
        {
            Rating = reviewCreateDTO.Rating,
            Content = reviewCreateDTO.Content,
            GameId = game.RawgGameId,
            UserId = currentUserId.Value,
            CreatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();
        
        // Return the created review
        var createdReview = new ReviewResponseDTO
        {
            Id = review.Id,
            Rating = review.Rating,
            Content = review.Content,
            CreatedAt = review.CreatedAt,
            User = user.Adapt<UserPublicResponseDTO>()
        };

        return CreatedAtAction(nameof(GetReviews), new { gameId }, createdReview);
    }

    [Authorize]
    [HttpPatch]
    public async Task<ActionResult<ReviewResponseDTO>> UpdateReview(int gameId, [FromBody] ReviewUpdateDTO reviewUpdateDTO)
    {
        var currentUserId = Utils.GetCurrentUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var review = await db.Reviews.FindAsync(reviewUpdateDTO.Id);
        if (review is null || review.GameId != gameId)
        {
            return NotFound("Review not found.");
        }

        var user = await db.Users.FindAsync(currentUserId.Value);
        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (review.UserId != currentUserId.Value)
        {
            return Forbid("You can only update your own reviews.");
        }

        if (reviewUpdateDTO.Rating < 1 || reviewUpdateDTO.Rating > 5)
        {
            return BadRequest("Rating must be between 1 and 5.");
        }

        if (reviewUpdateDTO.Content != null)
        {
            review.Content = reviewUpdateDTO.Content;
        }

        await db.SaveChangesAsync();

        var updatedReview = new ReviewResponseDTO
        {
            Id = review.Id,
            Rating = review.Rating,
            Content = review.Content,
            CreatedAt = review.CreatedAt,
            User = user.Adapt<UserPublicResponseDTO>()
        };

        return Ok(updatedReview);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReview(int gameId, long id)
    {
        var currentUserId = Utils.GetCurrentUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var review = await db.Reviews.FindAsync(id);
        if (review is null || review.GameId != gameId)
        {
            return NotFound("Review not found.");
        }

        if (review.UserId != currentUserId.Value)
        {
            return Forbid("You can only delete your own reviews.");
        }

        db.Reviews.Remove(review);
        await db.SaveChangesAsync();

        return NoContent();
    }
}