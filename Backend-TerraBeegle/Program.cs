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
using Backend_TerraBeegle.RateLimiting;
using IGDB;

var builder = WebApplication.CreateBuilder(args);

// 1. CORS: allows the Angular frontend (localhost:4200) to call the API
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

// 2. PostgreSQL database with Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 3. JWT authentication
var jwtKey = builder.Configuration["Jwt:Key"];

// the startup checks are skipped when the app is started by "dotnet ef" (migrations): there the settings from .env
// do not exist and they are not needed
if (!EF.IsDesignTime && (jwtKey is null || jwtKey.Length < 32))
{
    Console.Error.WriteLine("Jwt:Key must be at least 32 characters long for security reasons.");
    Environment.Exit(1);
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme) // implicit authentication method header is Authorization: Bearer....
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false; // disable renaming of claims
        options.TokenValidationParameters = new TokenValidationParameters // list of validation parameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)) //transforms the key in symmetric bytes
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

// Rate limiting (helpers and policy names in the RateLimiting folder)
builder.Services.AddRateLimiter(options =>
{
    // 429 = "Too Many Requests", the status code for rate limiting
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        // The policies have different windows (1 or 10 minutes), so the message uses the real waiting time
        string detail = "Too many requests. Try again later.";

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            var seconds = (int)Math.Ceiling(retryAfter.TotalSeconds);
            context.HttpContext.Response.Headers.RetryAfter = seconds.ToString();

            detail = seconds < 60
                ? $"Too many requests. Try again in {seconds} seconds."
                : $"Too many requests. Try again in {(int)Math.Ceiling(seconds / 60.0)} minutes.";
        }

        await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too many requests",
            Detail = detail
        }, cancellationToken);
    };
    
    options.AddFixedWindowPolicy(RateLimitPolicies.Login, 5, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByIp);
    options.AddFixedWindowPolicy(RateLimitPolicies.Register, 5, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByIp);
    options.AddFixedWindowPolicy(RateLimitPolicies.ResendEmail, 3, TimeSpan.FromMinutes(10), RateLimitOptionExtensions.ByIp);
    options.AddFixedWindowPolicy(RateLimitPolicies.ForgotPasswordRequest, 3, TimeSpan.FromMinutes(10), RateLimitOptionExtensions.ByIp);
    options.AddFixedWindowPolicy(RateLimitPolicies.ForgotPassword, 5, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByIp);
    options.AddFixedWindowPolicy(RateLimitPolicies.ChangeEmail, 3, TimeSpan.FromMinutes(10), RateLimitOptionExtensions.ByUser);
    options.AddFixedWindowPolicy(RateLimitPolicies.ConfirmEmail, 5, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByUser);
    options.AddFixedWindowPolicy(RateLimitPolicies.ChangePassword, 5, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByUser);
    options.AddFixedWindowPolicy(RateLimitPolicies.UserWrite, 30, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByUser);
    options.AddFixedWindowPolicy(RateLimitPolicies.UserGames, 30, TimeSpan.FromMinutes(1), RateLimitOptionExtensions.ByUser);
    // new policies go here (name in RateLimitPolicies, ByIp for public endpoints, ByUser for [Authorize])
});

// Enums (Theme, UserStatus) are sent as text ("Dark") instead of numbers (1)
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// All the errors (including empty 401/403/404) are returned as ProblemDetails
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IRawgService, RawgService>();
builder.Services.AddScoped<IIGDBService, IGDBService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddHostedService<UnverifiedUserCleanupService>();

// IHttpClientFactory for the HTTP calls to RAWG
builder.Services.AddHttpClient("RawgAPI", client =>
{
    client.BaseAddress = new Uri("https://api.rawg.io/api/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

builder.Services.AddSingleton(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();

    var clientId = configuration["EnvironmentVariables:IGDB_CLIENT_ID"];
    var clientSecret = configuration["EnvironmentVariables:IGDB_CLIENT_SECRET"];

    if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
    {
        Console.Error.WriteLine("EnvironmentVariables:IGDB_CLIENT_ID or IGDB_CLIENT_SECRET is missing. Set them to your IGDB API credentials.");
        Environment.Exit(1);;
    }

    return IGDBClient.CreateWithDefaults(clientId, clientSecret);
});

var ApiKey = builder.Configuration["EnvironmentVariables:RAWG_API_KEY"];

if (!EF.IsDesignTime && string.IsNullOrWhiteSpace(ApiKey))
{
    Console.Error.WriteLine("EnvironmentVariables:RAWG_API_KEY is missing. Set it to your RAWG API key.");
    Environment.Exit(1);
}

// without the SMTP settings the verification emails cannot be sent
string[] smtpSettings = ["Smtp:Host", "Smtp:Port", "Smtp:User", "Smtp:Password", "Smtp:From"];

foreach (var setting in smtpSettings)
{
    if (!EF.IsDesignTime && string.IsNullOrWhiteSpace(builder.Configuration[setting]))
    {
        Console.Error.WriteLine($"{setting} is missing. Set the SMTP_* variables in .env.");
        Environment.Exit(1);
    }
}

var app = builder.Build();

// Applies the pending migrations at startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        app.Logger.LogInformation("Database PostgreSQL verificato e pronto.");
    }
    // Only "Postgres is not reachable" is tolerated; any other error (e.g. PendingModelChangesException
    // when a model was changed without a migration) stops the app so it is noticed immediately
    catch (Npgsql.NpgsqlException ex) when (ex is not Npgsql.PostgresException)
    {
        app.Logger.LogWarning(ex, "Impossibile connettersi a PostgreSQL all'avvio. Verifica che il server sia attivo.");
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
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

// --- Endpoints API ---

// Health check: shows that the API is running
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    framework = ".NET 10 LTS",
    database = "PostgreSQL",
    timestamp = DateTime.UtcNow
}))
.WithName("GetHealthStatus");

app.Run();
