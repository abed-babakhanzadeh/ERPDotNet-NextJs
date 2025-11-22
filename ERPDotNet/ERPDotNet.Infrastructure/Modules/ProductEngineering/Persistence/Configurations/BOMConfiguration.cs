using ERPDotNet.Domain.Modules.ProductEngineering.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPDotNet.Infrastructure.Modules.ProductEngineering.Persistence.Configurations;

public class BOMHeaderConfiguration : IEntityTypeConfiguration<BOMHeader>
{
    public void Configure(EntityTypeBuilder<BOMHeader> builder)
    {
        builder.ToTable("bom_headers", "engineering"); // اسکیمای مهندسی

        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Version).HasMaxLength(20).IsRequired();

        // یک کالا می‌تواند چند BOM داشته باشد، اما نباید دو BOM فعال همزمان داشته باشد (تداخل تاریخ)
        // (این را در بیزنس لاجیک چک می‌کنیم، اینجا ایندکس معمولی می‌زنیم)
        builder.HasIndex(x => x.ProductId);
    }
}

public class BOMDetailConfiguration : IEntityTypeConfiguration<BOMDetail>
{
    public void Configure(EntityTypeBuilder<BOMDetail> builder)
    {
        builder.ToTable("bom_details", "engineering");

        builder.Property(x => x.Quantity).HasPrecision(18, 6);
        builder.Property(x => x.WastePercentage).HasPrecision(5, 2);

        // جلوگیری از لوپ (پدر و فرزند یکی نباشند - هرچند این چک دیتابیسی نیست)
    }
}

public class BOMSubstituteConfiguration : IEntityTypeConfiguration<BOMSubstitute>
{
    public void Configure(EntityTypeBuilder<BOMSubstitute> builder)
    {
        builder.ToTable("bom_substitutes", "engineering");
        
        builder.Property(x => x.Factor).HasPrecision(18, 6);
    }
}