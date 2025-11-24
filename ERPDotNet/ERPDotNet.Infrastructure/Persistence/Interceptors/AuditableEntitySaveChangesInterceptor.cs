using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ERPDotNet.Infrastructure.Persistence.Interceptors;

public class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditableEntitySaveChangesInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    // یک متغیر برای جلوگیری از لوپ
    private static bool _isSavingAudit = false;
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        // اگر در حال ذخیره لاگ‌ها هستیم، دیگر اینترسپت نکن و بگذار رد شود
        if (_isSavingAudit) 
        {
            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        // 1. قبل از ذخیره اصلی
        var auditEntries = OnBeforeSaveChanges(eventData.Context);

        // 2. ذخیره اصلی دیتا
        var resultState = await base.SavingChangesAsync(eventData, result, cancellationToken);

        // 3. ذخیره لاگ‌ها (اگر لاگی وجود داشت)
        if (auditEntries != null && auditEntries.Count > 0)
        {
            await OnAfterSaveChanges(eventData.Context, auditEntries, cancellationToken);
        }

        return resultState;
    }

    private List<AuditEntry> OnBeforeSaveChanges(DbContext? context)
    {
        context.ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();

        if (context == null) return auditEntries;

        var userId = _currentUserService.UserId;

        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            // اگر خود رکورد AuditTrail بود یا تغییری نداشت، بیخیال شو
            if (entry.Entity is AuditTrail || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry(entry)
            {
                TableName = entry.Entity.GetType().Name, // اسم جدول (مثلا Unit)
                UserId = userId ?? "Anonymous"
            };

            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    // مقادیر موقت (مثل ID قبل از اینسرت) را فعلاً ول کن، بعداً پر می‌کنیم
                    continue;
                }

                string propertyName = property.Metadata.Name;
                
                // ما فیلدهای سیستمی را معمولاً لاگ نمی‌کنیم (اختیاری)
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.AuditType = "Create";
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        // ست کردن CreatedBy/At
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.CreatedBy = userId;
                        break;

                    case EntityState.Deleted:
                        auditEntry.AuditType = "Delete";
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            // هندل کردن Soft Delete
                            if (propertyName == nameof(BaseEntity.IsDeleted) && (bool)property.CurrentValue == true)
                            {
                                auditEntry.AuditType = "SoftDelete";
                            }
                            else
                            {
                                auditEntry.AuditType = "Update";
                            }
                            
                            auditEntry.ChangedColumns.Add(propertyName);
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                        }
                        // ست کردن LastModifiedBy/At
                        entry.Entity.LastModifiedAt = DateTime.UtcNow;
                        entry.Entity.LastModifiedBy = userId;
                        break;
                }
            }
        }
        
        // حذف entries که هیچ تغییری نداشتند (مثلا فقط فیلد CreatedAt عوض شده ولی ما نمیخوایم لاگ کنیم)
        foreach (var auditEntry in auditEntries.Where(e => !e.KeyValues.Any() && e.AuditType == null))
        {
            // منطق تمیزکاری اگر لازم بود
        }

        return auditEntries;
    }

    private async Task OnAfterSaveChanges(DbContext? context, List<AuditEntry> auditEntries, CancellationToken cancellationToken)
    {
        if (context == null) return;

        // پرچم را بالا می‌بریم که یعنی: "من دارم لاگ ذخیره می‌کنم، کاری به کارم نداشته باش"
        _isSavingAudit = true;

        try
        {
            foreach (var auditEntry in auditEntries)
            {
                foreach (var prop in auditEntry.Entry.Properties)
                {
                    if (prop.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                    }
                }
                context.Set<AuditTrail>().Add(auditEntry.ToAuditTrail());
            }

            // حالا ذخیره می‌کنیم (چون پرچم بالاست، اینترسپتور دوباره اجرا نمی‌شود)
            await context.SaveChangesAsync(cancellationToken);
        }
        finally
        {
            // در هر صورت پرچم را پایین می‌آوریم
            _isSavingAudit = false;
        }
    }
}