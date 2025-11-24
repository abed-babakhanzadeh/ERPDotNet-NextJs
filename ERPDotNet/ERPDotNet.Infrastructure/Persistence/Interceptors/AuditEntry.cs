using ERPDotNet.Domain.Common; // برای دسترسی به AuditTrail
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace ERPDotNet.Infrastructure.Persistence.Interceptors;

public class AuditEntry
{
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public EntityEntry Entry { get; }
    public string UserId { get; set; }
    public string TableName { get; set; }
    public Dictionary<string, object> KeyValues { get; } = new();
    public Dictionary<string, object> OldValues { get; } = new();
    public Dictionary<string, object> NewValues { get; } = new();
    public List<string> ChangedColumns { get; } = new();
    public string AuditType { get; set; } // Create, Update, Delete

    public AuditTrail ToAuditTrail()
    {
        var audit = new AuditTrail
        {
            UserId = UserId,
            Type = AuditType,
            TableName = TableName,
            DateTime = DateTime.UtcNow,
            PrimaryKey = JsonSerializer.Serialize(KeyValues),
            OldValues = OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
            NewValues = NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
            AffectedColumns = ChangedColumns.Count == 0 ? null : JsonSerializer.Serialize(ChangedColumns)
        };
        return audit;
    }
}