using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
    
namespace Backend_TerraBeegle.RateLimiting;

public static class RateLimitOptionExtensions
{
    // One counter per IP address. For public endpoints (login, register, resend-email, forgot-password),
    // where there is no token. Users on the same network (same public IP) share the counter
    public static string ByIp(HttpContext context) =>
        "ip:" + (context.Connection.RemoteIpAddress?.ToString() ?? "unknown");

    // One counter per account (the "sub" claim from the JWT), from any network. For [Authorize] endpoints.
    // Works only if UseRateLimiter() comes after UseAuthentication(); without a token it falls back to ByIp
    public static string ByUser(HttpContext context)
    {
        var sub = context.User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return sub is null ? ByIp(context) : "user:" + sub;
    }

    // Registers a fixed-window rate limit policy in one line
    public static void AddFixedWindowPolicy(this RateLimiterOptions options, string policyName, int permitLimit, TimeSpan window, Func<HttpContext, string> partitionKey)
    {
        options.AddPolicy(policyName, context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: partitionKey(context),
                factory: _ => new FixedWindowRateLimiterOptions()
                {
                    PermitLimit = permitLimit,
                    Window = window,
                    QueueLimit = 0
                }));
    }
}