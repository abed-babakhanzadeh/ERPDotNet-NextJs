using ERPDotNet.Domain.Common;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;

namespace ERPDotNet.Domain.Modules.ProductEngineering.Entities;

public class BOMSubstitute : BaseEntity
{
    public int Id { get; set; }

    // لینک به سطر اصلی (دیتیل)
    public int BOMDetailId { get; set; }
    public BOMDetail BOMDetail { get; set; }

    // کالای جایگزین
    public int SubstituteProductId { get; set; }
    public Product SubstituteProduct { get; set; }

    public int Priority { get; set; } = 1; // اولویت (۱ بالاتر)
    public decimal Factor { get; set; } = 1; // ضریب تبدیل (۱ عدد جایگزین = ۱ عدد اصلی)
}