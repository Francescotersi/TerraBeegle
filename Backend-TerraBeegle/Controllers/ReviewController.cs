using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Authorization;
using Backend_TerraBeegle.Services;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using static Backend_TerraBeegle.Utils;

using Mapster;
using Npgsql;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/user/{username}/reviews")]
public class ReviewUserController(AppDbContext db) : ControllerBase
{
    // Lists the reviews written by a user
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<ReviewResponseDTO>>> GetReviews(string username, [FromQuery] PaginationDTO pagination)
    {
        var totalCount = await db.Reviews.CountAsync(r => r.User.Username == username);
        var reviews = new List<ReviewResponseDTO>();

        if (totalCount != 0) {
            // Load the games with their cover, then map them in memory like the favorites / wishlist do
            var page = await db.Reviews
                .Where(r => r.User.Username == username)
                .OrderByDescending(r => r.CreatedAt)
                .ThenByDescending(r => r.Id) // To ensure consistent ordering for reviews created at the same time
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Include(r => r.Game)
                    .ThenInclude(g => g.Images.Where(i => i.Type == ImageType.Cover))
                .ToListAsync();

            reviews = [.. page.Select(r => new ReviewResponseDTO
            {
                Id = r.Id,
                Rating = r.Rating,
                Content = r.Content,
                CreatedAt = r.CreatedAt,
                User = null, // no need to include the user since we already know the username
                Game = DBToGameDTO.DBToGameCardDTO(r.Game)
            })];
        }

        return Ok(CreatePagedResponse(
            reviews,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetReviews), new { username, Page = page, pagination.PageSize })
        ));
    }
}

[ApiController]
[Route("api/games/{gameId:long}/reviews")]
public class ReviewGameController(AppDbContext db, IIGDBService ApiService) : ControllerBase
{
    // Lists the reviews of a game
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<ReviewResponseDTO>>> GetReviews(long gameId, [FromQuery] PaginationDTO pagination)
    {
        // gameId in the URL is the IGDB id; Review.GameId points to Game.Id (the DB id)
        var totalCount = await db.Reviews.CountAsync(r => r.Game.ApiGameId == gameId);
        var reviews = new List<ReviewResponseDTO>();

        if (totalCount != 0) {
            reviews = await db.Reviews
                .Where(r => r.Game.ApiGameId == gameId)
                .OrderByDescending(r => r.CreatedAt)
                .ThenByDescending(r => r.Id) // To ensure consistent ordering for reviews created at the same time
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

        return Ok(CreatePagedResponse(
            reviews,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetReviews), new { gameId, Page = page, pagination.PageSize })
        ));
    }

    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    [HttpPost]
    public async Task<ActionResult<ReviewResponseDTO>> CreateReview(long gameId, [FromBody] ReviewCreateDTO reviewCreateDTO)
    {
        var currentUserId = GetCurrentUserId(User);
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
            game = await ApiService.GetOrCreateGameAsync(gameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
        {
            return NotFound("Game not found.");
        }

        if (game.ReleaseDate is not null && game.ReleaseDate > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return BadRequest("Cannot review a game that has not been released yet.");
        }

        // 409 Conflict: the frontend shows "You already reviewed this game." for it
        if (await db.Reviews.AnyAsync(r => r.GameId == game.Id && r.UserId == currentUserId.Value))
        {
            return Conflict("You have already reviewed this game.");
        }

        // Create a new review
        var review = new Review
        {
            Rating = reviewCreateDTO.Rating,
            Content = reviewCreateDTO.Content,
            GameId = game.Id,
            UserId = currentUserId.Value,
            CreatedAt = DateTime.UtcNow
        };

        db.Reviews.Add(review);

        // Update the game's average rating
        game.Rating = ((game.Rating ?? 0m) * game.RatingCount + review.Rating) / (game.RatingCount + 1); 
        game.RatingCount += 1; 

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Two "Publish" at the same time: the unique index (GameId, UserId) stopped the second one (it gave 500)
            return Conflict("You have already reviewed this game.");
        }
        
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

    // Edits your own review
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    [HttpPatch]
    public async Task<ActionResult<ReviewResponseDTO>> UpdateReview(long gameId, [FromBody] ReviewUpdateDTO reviewUpdateDTO)
    {
        var currentUserId = GetCurrentUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var review = await db.Reviews.FindAsync(reviewUpdateDTO.Id);
        var game = await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == gameId && !g.IsPlaceholder);
        if (review is null || game is null || review.GameId != game.Id)
        {
            return NotFound("Review not found.");
        }

        var user = await db.Users.FindAsync(currentUserId.Value);
        if (user is null || !user.EmailVerified)
        {
            return NotFound("User not found.");
        }

        if (review.UserId != currentUserId.Value)
        {
            // Forbid("...") expects an authentication scheme name, not a message (it gave 500), so StatusCode(403, ...)
            return StatusCode(StatusCodes.Status403Forbidden, "You can only update your own reviews.");
        }

        // The rating is required and already validated by [Range] on the DTO
        game.Rating = ((game.Rating ?? 0m) * game.RatingCount - review.Rating + reviewUpdateDTO.Rating) / game.RatingCount;
        review.Rating = reviewUpdateDTO.Rating;

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

    // Deletes your own review
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReview(long id)
    {
        var currentUserId = GetCurrentUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var review = await db.Reviews.FindAsync(id);
        if (review is null)
        {
            return NotFound("Review not found.");
        }

        if (review.UserId != currentUserId.Value)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "You can only delete your own reviews.");
        }

        var game = await db.Games.FindAsync(review.GameId);
        if (game is null)
        {
            return NotFound("Game not found.");
        }

        if (game.RatingCount <= 1)
        {
            game.Rating = null;
            game.RatingCount = 0;
        }
        else
        {
            game.Rating = ((game.Rating ?? 0m) * game.RatingCount - review.Rating) / (game.RatingCount - 1);
            game.RatingCount -= 1;
        }

        db.Reviews.Remove(review);
        await db.SaveChangesAsync();

        return NoContent();
    }
}