namespace ERPDotNet.Domain.Common;

public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; } // جدید

    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; } // جدید

    public bool IsDeleted { get; set; } = false;
}
