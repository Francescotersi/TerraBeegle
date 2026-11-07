using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend_TerraBeegle.Services;

// Deletes the 2FA logins that were never finished (the user closed the page, the code never arrived...).
// A used or failed challenge is already deleted by AuthController; only the abandoned ones stay in the table
public class  ExpiredLoginChallengeCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<ExpiredLoginChallengeCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await DeleteExpiredChallengesAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Error deleting expired login challenges");
            }
        }
    }

    private async Task DeleteExpiredChallengesAsync(CancellationToken stoppingToken)
    {
        // A new scope, because the BackgroundService is a singleton and AppDbContext is scoped
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // TokenExpiration is the limit of the whole login: after it, the challenge can never be used
        var now = DateTime.UtcNow;
        var count = await db.LoginChallenges
            .Where(c => c.TokenExpiration < now)
            .ExecuteDeleteAsync(stoppingToken);

        if (count > 0)
            logger.LogInformation("Deleted {Count} expired login challenges", count);
    }
}
