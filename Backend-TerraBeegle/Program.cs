using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.Models;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

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
// Enums (Theme, UserStatus) are sent as text ("Dark") instead of numbers (1)
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// Aggiunge IHttpClientFactory per le chiamate HTTP esterne
builder.Services.AddHttpClient("RawgAPI", client =>
{
    client.BaseAddress = new Uri("https://api.rawg.io/api");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
}); 

var app = builder.Build();

// Inizializza automaticamente il DB in sviluppo se PostgreSQL è attivo
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
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
app.MapControllers();

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

app.Run();
