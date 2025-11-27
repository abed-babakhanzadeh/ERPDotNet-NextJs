using ERPDotNet.API.Services;
using ERPDotNet.Application;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using ERPDotNet.Domain.Modules.UserAccess.Entities;
using ERPDotNet.Infrastructure;
using ERPDotNet.Infrastructure.Common.Services;
using ERPDotNet.Infrastructure.Modules.UserAccess.Services;
using ERPDotNet.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using StackExchange.Redis;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region 1. Configuration & Secrets
// دریافت تنظیمات ضروری
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"] 
    ?? throw new InvalidOperationException("JWT Secret is missing in appsettings.json"));

var redisConnectionString = builder.Configuration.GetConnectionString("Redis") 
    ?? throw new InvalidOperationException("Redis connection string is missing.");
#endregion

#region 2. Infrastructure Layer (Database, Redis, Identity)
// ثبت سرویس‌های لایه اینفراستراکچر (شامل DbContext و Interceptors)
builder.Services.AddInfrastructureServices(builder.Configuration);

// Identity Configuration
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Redis (Direct Connection & Cache)
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
    ConnectionMultiplexer.Connect(redisConnectionString));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
});
#endregion

#region 3. Application Layer (MediatR, Services)
// ثبت سرویس‌های لایه اپلیکیشن (MediatR و Behavior ها)
builder.Services.AddApplicationServices();

// ثبت سرویس‌های خاص
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
#endregion

#region 4. Presentation Layer (API, Auth, Swagger)
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

// Authentication & JWT
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

// OpenAPI (Swagger/Scalar)
builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});
#endregion

var app = builder.Build();

#region 5. Middleware Pipeline
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
#endregion

app.Run();

// =========================================================
// Helpers
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