using System.Text.Json.Serialization; // این را اضافه کنید

namespace ERPDotNet.Application.Common.Models;

public class PaginatedResult<T>
{
    // ویژگی‌ها باید set یا init داشته باشند تا پر شوند
    public List<T> Items { get; set; }
    public int PageNumber { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    // 1. سازنده پیش‌فرض (برای Redis و Json Deserialization حیاتی است)
    public PaginatedResult() 
    {
        Items = new List<T>();
    }

    // 2. سازنده اصلی (برای استفاده خودمان)
    public PaginatedResult(List<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }
}