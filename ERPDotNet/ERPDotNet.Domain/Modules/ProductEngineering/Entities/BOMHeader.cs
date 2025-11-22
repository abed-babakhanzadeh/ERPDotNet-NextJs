using ERPDotNet.Domain.Common;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;

namespace ERPDotNet.Domain.Modules.ProductEngineering.Entities;

public class BOMHeader : BaseEntity
{
    public int Id { get; set; }
    
    // محصول نهایی (پدر)
    public int ProductId { get; set; }
    public Product Product { get; set; }

    public string Title { get; set; } // عنوان فرمول (مثلا: فرمول تابستانی)
    public string Version { get; set; } // نسخه (v1.0)
    
    public BOMStatus Status { get; set; } // وضعیت چرخه حیات
    public BOMType Type { get; set; } // نوع (تولید، مهندسی)

    public DateTime FromDate { get; set; } // تاریخ شروع اعتبار
    public DateTime? ToDate { get; set; }  // تاریخ پایان اعتبار (نال = ابد)

    public bool IsActive { get; set; } // فعال/غیرفعال دستی

    // اقلام زیرمجموعه
    public ICollection<BOMDetail> Details { get; set; } = new List<BOMDetail>();
}

public enum BOMStatus
{
    Draft = 1,      // پیش‌نویس
    Approved = 2,   // تایید شده
    Active = 3,     // فعال در خط تولید
    Obsolete = 4    // منسوخ شده
}

public enum BOMType
{
    Manufacturing = 1, // ساخت (MBOM)
    Engineering = 2,   // مهندسی (EBOM)
    Sales = 3          // فروش (Kit)
}