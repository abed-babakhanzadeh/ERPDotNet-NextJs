using ERPDotNet.Domain.Common;

namespace ERPDotNet.Domain.Common;

public class AuditTrail
{
    public int Id { get; set; }
    public string UserId { get; set; } // کاربری که تغییر داد
    public string Type { get; set; } // Create, Update, Delete, SoftDelete
    public string TableName { get; set; } // نام جدول (مثلا Units)
    public DateTime DateTime { get; set; } = DateTime.UtcNow;
    
    public string? PrimaryKey { get; set; } // ID رکورد تغییر یافته

    public string? OldValues { get; set; } // JSON مقدار قبلی
    public string? NewValues { get; set; } // JSON مقدار جدید
    public string? AffectedColumns { get; set; } // ستون‌هایی که تغییر کردند
}