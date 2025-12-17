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
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using StackExchange.Redis;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region 1. Configuration & Secrets
// اطمینان حاصل کنید که در appsettings.json یا Environment Variable ها این مقادیر ست شده باشند
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKeyString = jwtSettings["Secret"] ?? builder.Configuration["JwtSettings:Secret"];

// یک کلید پیش‌فرض برای جلوگیری از کرش کردن در صورتی که کانفیگ خوانده نشد (فقط جهت اطمینان، در پروداکشن حتما ست کنید)
if (string.IsNullOrEmpty(secretKeyString))
{
    secretKeyString = "YourTemporarySecretKeyMustBeLongEnough123456!"; 
}

var secretKey = Encoding.UTF8.GetBytes(secretKeyString);

var redisConnectionString = builder.Configuration.GetConnectionString("Redis") 
    ?? "redis:6379"; // مقدار پیش فرض داکر
#endregion

#region 2. Infrastructure Layer
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
    ConnectionMultiplexer.Connect(redisConnectionString));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
});
#endregion

#region 3. Application Layer
builder.Services.AddApplicationServices();

builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IFileService, FileService>();
#endregion

#region 4. Presentation Layer
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

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
        ValidIssuer = jwtSettings["Issuer"] ?? "ERPDotNet",
        ValidAudience = jwtSettings["Audience"] ?? "ERPDotNetClient",
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});

// تنظیم CORS برای محیط پروداکشن با آی‌پی ولید
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowPublicIP",
        b => b.WithOrigins(
                "http://94.182.39.201:3000", // دسترسی خارجی
                "http://localhost:3000",     // دسترسی لوکال
                "http://192.168.0.241:3000"  // دسترسی شبکه داخلی
             )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()); // برای ارسال کوکی یا هدرهای خاص ضروری است
});
#endregion

var app = builder.Build();

#region 6. Automatic Database Migration
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}
#endregion

#region 5. Middleware Pipeline

// در محیط دولوپمنت سواگر را نشان بده
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// نکته مهم امنیتی: چون روی HTTP هستید و SSL ندارید، این خط را کامنت کردم
// اگر فعال باشد، مرورگر سعی می‌کند به پورت 443 برود و سایت باز نمی‌شود
// app.UseHttpsRedirection();

// اعمال پالیسی جدید CORS
app.UseCors("AllowPublicIP");

app.UseAuthentication();
// سرویس فایل‌های استاتیک برای آپلودها
app.UseStaticFiles(); 
app.UseAuthorization();

app.MapControllers();
#endregion

app.Run();

// Helpers...
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