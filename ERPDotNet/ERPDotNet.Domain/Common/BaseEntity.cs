using System;

namespace ERPDotNet.Domain.Common;

public abstract class BaseEntity
{
    // تاریخ ایجاد رکورد (برای گزارش‌گیری حیاتی است)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // تاریخ آخرین ویرایش
    public DateTime? LastModifiedAt { get; set; }

    // حذف منطقی (Soft Delete): در ERP هیچ دیتایی فیزیکی پاک نمی‌شود!
    public bool IsDeleted { get; set; } = false;
}
