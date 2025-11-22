using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using ERPDotNet.Domain.Modules.UserAccess.Entities;
using ERPDotNet.Infrastructure.Modules.UserAccess.Services;
using ERPDotNet.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using System.Text;
using ERPDotNet.Application; // برای متد اکستنشن
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Infrastructure.Common.Services;
using StackExchange.Redis;


var builder = WebApplication.CreateBuilder(args);

// 1. Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// این خط می‌گوید: هر وقت کسی IApplicationDbContext خواست، همان AppDbContext را به او بده
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<AppDbContext>());

// 2. Identity
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// 3. JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

// 2. Redis Configuration
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

// 1. سرویس‌های لایه اپلیکیشن (MediatR)
builder.Services.AddApplicationServices();
// برای استفاده در IDistributedCache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
});
// برای استفاده مستقیم (پاکسازی تگ‌ها)
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
    ConnectionMultiplexer.Connect(redisConnectionString));

// 4. Services
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddControllers();
builder.Services.AddScoped<ICacheService, RedisCacheService>();




// 5. OpenAPI with JWT Support
builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("ERPDotNet API");
        options.WithTheme(ScalarTheme.DeepSpace);
        options.WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();

app.UseCors(policy =>
    policy.WithOrigins("http://localhost:3000")
          .AllowAnyHeader()
          .AllowAnyMethod());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// =========================================================
// JWT Security Transformer for OpenAPI
// =========================================================
internal sealed class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    private readonly IAuthenticationSchemeProvider _authenticationSchemeProvider;

    public BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider authenticationSchemeProvider)
    {
        _authenticationSchemeProvider = authenticationSchemeProvider;
    }

    public async Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        var authenticationSchemes = await _authenticationSchemeProvider.GetAllSchemesAsync();

        if (authenticationSchemes.Any(authScheme => authScheme.Name == "Bearer"))
        {
            var requirements = new Dictionary<string, IOpenApiSecurityScheme>
            {
                ["Bearer"] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    In = ParameterLocation.Header,
                    BearerFormat = "JWT"
                }
            };

            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes = requirements;
        }
    }
}