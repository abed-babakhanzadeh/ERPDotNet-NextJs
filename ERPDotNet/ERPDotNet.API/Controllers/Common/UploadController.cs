using Microsoft.AspNetCore.Mvc;
using ERPDotNet.API.Attributes;

namespace ERPDotNet.API.Controllers.Common;

[Route("api/[controller]")]
[ApiController]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost]
    [HasPermission("BaseInfo.Products.Create")] // یا هر پرمیشن مناسب
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("فایلی انتخاب نشده است");

        // ساخت نام یکتا برای فایل
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        
        // مسیر ذخیره‌سازی: wwwroot/uploads/products
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "products");
        
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // برگرداندن مسیر نسبی
        return Ok(new { path = $"/uploads/products/{fileName}" });
    }
}