using ERPDotNet.Domain.Common;

namespace ERPDotNet.Domain.Modules.BaseInfo.Entities;

public class Product : BaseEntity
{
    public int Id { get; set; }
    public string Code { get; set; } // کد کالا (مثلاً 101-001)
    public string Name { get; set; } // نام کالا
    public string? TechnicalSpec { get; set; } // مشخصات فنی
    
    // واحد سنجش اصلی (مبنای انبارداری)
    // تمام محاسبات موجودی انبار با این واحد انجام می‌شود
    public int UnitId { get; set; }
    public Unit Unit { get; set; }

    // لیست واحدهای فرعی و ضرایب تبدیل آن‌ها
    public ICollection<ProductUnitConversion> UnitConversions { get; set; } = new List<ProductUnitConversion>();

    // نوع تامین (تولیدی، خریدنی، ...)
    public ProductSupplyType SupplyType { get; set; }

    public bool IsActive { get; set; } = true;
}

// اینام (Enum) برای نوع تامین
public enum ProductSupplyType
{
    Purchased = 1, // خریدنی (مواد اولیه)
    Manufactured = 2, // تولیدی (محصول نهایی/نیمه ساخته)
    Service = 3 // خدمات (غیر کالایی)
}