using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    public partial class AddNumericCollation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // این دستور اگر Collation وجود نداشته باشد آن را می‌سازد
            migrationBuilder.Sql("CREATE COLLATION IF NOT EXISTS \"numeric\" (PROVIDER = icu, LOCALE = 'en-u-kn-true');");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // این دستور برای برگشت به عقب است
            migrationBuilder.Sql("DROP COLLATION IF EXISTS \"numeric\";");
        }
    }
}
