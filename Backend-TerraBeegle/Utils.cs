using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using Backend_TerraBeegle.DTOS;

namespace Backend_TerraBeegle;

public class Utils
{
    // True if the id belongs to the user in the token
    public static bool IsCurrentUser(ClaimsPrincipal user, long id)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return long.TryParse(sub, out var tokenUserId) && tokenUserId == id;
    }

    // Reads the user id from the token, or null
    public static long? GetCurrentUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (long.TryParse(sub, out var tokenUserId))
        {
            return tokenUserId;
        }
        return null;
    }

    // public static async Task<bool> IsUserVerified(long userId, AppDbContext db)
    // {
    //     return await db.Users.AnyAsync(u => u.Id == userId && u.EmailVerified);
    // }

    public static bool IsHttpUrl(string value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }

    // Builds the standard paginated response with page links
    public static PagedResponseDTO<T> CreatePagedResponse<T>(IEnumerable<T> items, int totalCount, PaginationDTO pagination, Func<int, string?> pageUrl)
    {
        var totalPages = (int)Math.Ceiling((double)totalCount / pagination.PageSize);

        return new PagedResponseDTO<T>
        {
            Items = [.. items],
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            PreviousPageUrl = pagination.Page > 1 ? pageUrl(pagination.Page - 1) : null,
            NextPageUrl = pagination.Page < totalPages ? pageUrl(pagination.Page + 1) : null
        };
    }

    public static long YearToUnixTimestamp(int anno, bool min = false)
    {
        DateTimeOffset data = min
            ? new (anno, 1, 1, 0, 0, 0, TimeSpan.Zero)
            : new (anno, 12, 31, 23, 59, 59, TimeSpan.Zero);

        return data.ToUnixTimeSeconds();
    }
}