namespace ERPDotNet.Application.Common.Models;

public record PaginatedRequest
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    
    public string? SortColumn { get; init; } 
    public bool SortDescending { get; init; } = false;

    // === تغییر جدید: لیست فیلترهای پیشرفته ===
    // جستجوی ساده متنی (SearchTerm) را هم نگه می‌داریم برای سرچ‌باکس کلی بالای گرید
    public string? SearchTerm { get; init; }

    // فیلترهای ستونی (Advanced)
    public List<FilterModel>? Filters { get; init; }
}

public class FilterModel
{
    public string PropertyName { get; set; } // نام ستون (مثلا "ConversionFactor")
    public string Operation { get; set; }    // نوع عملیات: "eq", "gt", "lt", "contains"
    public string Value { get; set; }        // مقدار: "10", "kg"
}