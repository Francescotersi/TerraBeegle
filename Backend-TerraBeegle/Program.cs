using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.Models;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend_TerraBeegle.Services;
using Microsoft.OpenApi;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurazione CORS per consentire al frontend Angular (localhost:4200) di chiamare l'API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Retry-After");
    });
});

// 2. Configurazione Database PostgreSQL con Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 3. Configurazione JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
             ?? throw new InvalidOperationException("Jwt:Key is not configured.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme) // implicit authentication method header is Authorization: Bearer....
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false; // disable renaming of claims
        options.TokenValidationParameters = new TokenValidationParameters // list of validation paramters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)) //transforms the key in symmetric bytes
        };
    });

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Put login token (without \"Bearer \")."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});

// Aggiungi rate limiting
builder.Services.AddRateLimiter(options =>
{
    // 429 = "Too Many Requests", codice per rate limiting
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        }
        
        await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too many requests",
            Detail = "Too many requests. Try again in a minute."
        }, cancellationToken);
    };

    // policy "login": ogni IP a un singolo contor
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,                    // max 5 request
                Window = TimeSpan.FromMinutes(1),   // per minut
                QueueLimit = 0
            }));

    options.AddPolicy("register", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions()
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
    // qui si potrebbe aggiungere un altro policy
});

// Enums (Theme, UserStatus) are sent as text ("Dark") instead of numbers (1)
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// All the errors (including empty 401/403/404) are returned as ProblemDetails
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Aggiunge IHttpClientFactory per le chiamate HTTP esterne
builder.Services.AddHttpClient("RawgAPI", client =>
{
    client.BaseAddress = new Uri("https://api.rawg.io/api");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

var ApiKey = builder.Configuration["EnvironmentVariables:RAWG_API_KEY"];

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
// First middleware, so it catches the exceptions from everything after it
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStatusCodePages();
app.UseCors("AllowAngularDev");
app.UseRateLimiter();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
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
