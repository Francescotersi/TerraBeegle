using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using Backend_TerraBeegle.DTOS;

namespace Backend_TerraBeegle.Controllers;

public static class Utils
{
    public static bool IsCurrentUser(ClaimsPrincipal user, long id)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return long.TryParse(sub, out var tokenUserId) && tokenUserId == id;
    }

    public static bool IsHttpUrl(string value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }

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
}