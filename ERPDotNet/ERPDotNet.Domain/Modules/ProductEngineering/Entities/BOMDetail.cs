using ERPDotNet.Domain.Common;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;

namespace ERPDotNet.Domain.Modules.ProductEngineering.Entities;

public class BOMDetail : BaseEntity
{
    public int Id { get; set; }

    // لینک به هدر
    public int BOMHeaderId { get; set; }
    public BOMHeader BOMHeader { get; set; }

    // ماده اولیه (فرزند)
    public int ChildProductId { get; set; }
    public Product ChildProduct { get; set; }

    // مقدار مصرف
    public decimal Quantity { get; set; }
    
    // درصد ضایعات (پیش‌بینی پرت مواد)
    public decimal WastePercentage { get; set; } = 0;

    // لیست کالاهای جایگزین برای این سطر
    public ICollection<BOMSubstitute> Substitutes { get; set; } = new List<BOMSubstitute>();
}