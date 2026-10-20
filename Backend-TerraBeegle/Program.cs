using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurazione CORS per consentire al frontend Angular (localhost:4200) di chiamare l'API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 2. Configurazione Database PostgreSQL con Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Inizializza automaticamente il DB in sviluppo se PostgreSQL è attivo
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        app.Logger.LogInformation("Database PostgreSQL verificato e pronto.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning("Impossibile connettersi a PostgreSQL all'avvio ({Message}). Verifica che il server sia attivo.", ex.Message);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularDev");
app.UseHttpsRedirection();

// --- Endpoints API ---

// Health check per verificare lo stato di .NET 10 e PostgreSQL
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    framework = ".NET 10 LTS",
    database = "PostgreSQL",
    timestamp = DateTime.UtcNow
}))
.WithName("GetHealthStatus");

// API CRUD per ChallengeItems
app.MapGet("/api/challenges", async (AppDbContext db) =>
    await db.ChallengeItems.OrderBy(c => c.Id).ToListAsync())
.WithName("GetChallenges");

app.MapGet("/api/challenges/{id:int}", async (int id, AppDbContext db) =>
    await db.ChallengeItems.FindAsync(id) is ChallengeItem item
        ? Results.Ok(item)
        : Results.NotFound(new { message = $"Item {id} non trovato" }))
.WithName("GetChallengeById");

app.MapPost("/api/challenges", async (ChallengeItem item, AppDbContext db) =>
{
    item.CreatedAt = DateTime.UtcNow;
    db.ChallengeItems.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/challenges/{item.Id}", item);
})
.WithName("CreateChallenge");

app.MapPut("/api/challenges/{id:int}/toggle", async (int id, AppDbContext db) =>
{
    var item = await db.ChallengeItems.FindAsync(id);
    if (item is null) return Results.NotFound(new { message = $"Item {id} non trovato" });

    item.IsCompleted = !item.IsCompleted;
    await db.SaveChangesAsync();
    return Results.Ok(item);
})
.WithName("ToggleChallengeStatus");

app.MapDelete("/api/challenges/{id:int}", async (int id, AppDbContext db) =>
{
    var item = await db.ChallengeItems.FindAsync(id);
    if (item is null) return Results.NotFound();

    db.ChallengeItems.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("DeleteChallenge");

// Endpoint template di default
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
