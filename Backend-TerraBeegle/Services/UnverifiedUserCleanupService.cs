using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend_TerraBeegle.Services;

public class UnverifiedUserCleanupService(
    IServiceScopeFactory scopeFactory, 
    ILogger<UnverifiedUserCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        //await DeleteUnverifiedUsersAsync(stoppingToken); //for testing
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await DeleteUnverifiedUsersAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Error deleting unverified users");
            }          
        }
    }
    
    private async Task DeleteUnverifiedUsersAsync(CancellationToken stoppingToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var limit = DateTime.UtcNow.AddDays(-2);
        var ids = db.Users.Where(u => !u.EmailVerified && u.CreatedAt < limit).Select(u => u.Id);
        await using var transaction = await db.Database.BeginTransactionAsync(stoppingToken);
        
        await db.Friendships.Where(f => ids.Contains(f.User1Id) || ids.Contains(f.User2Id)).ExecuteDeleteAsync(stoppingToken);
        
        var count = await db.Users.Where(u => ids.Contains(u.Id)).ExecuteDeleteAsync(stoppingToken);
        
        await transaction.CommitAsync(stoppingToken);
        
        if (count > 0)
            logger.LogInformation("Deleted {Count} unverified users", count);
    }
}