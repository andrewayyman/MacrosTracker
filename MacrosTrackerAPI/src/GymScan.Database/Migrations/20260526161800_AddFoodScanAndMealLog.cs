using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GymScan.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddFoodScanAndMealLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FoodScans",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FoodName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Calories = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: false),
                    Protein = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Carbs = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Fat = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ServingSizeGrams = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    ResultSource = table.Column<int>(type: "int", nullable: false),
                    ConfidencePercent = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ScannedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodScans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodScans_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LocalFoodItems",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AlternateNames = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CaloriesPer100g = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: false),
                    ProteinPer100g = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CarbsPer100g = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    FatPer100g = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TypicalServingSizeGrams = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalFoodItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MealLogs",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DiaryDate = table.Column<DateOnly>(type: "date", nullable: false),
                    MealType = table.Column<int>(type: "int", nullable: false),
                    FoodName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Calories = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: false),
                    Protein = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Carbs = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Fat = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ServingSizeGrams = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    FoodScanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LocalFoodItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LoggedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealLogs_FoodScans_FoodScanId",
                        column: x => x.FoodScanId,
                        principalSchema: "dbo",
                        principalTable: "FoodScans",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MealLogs_LocalFoodItems_LocalFoodItemId",
                        column: x => x.LocalFoodItemId,
                        principalSchema: "dbo",
                        principalTable: "LocalFoodItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MealLogs_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LocalFoodItems",
                columns: new[] { "Id", "AlternateNames", "CaloriesPer100g", "CarbsPer100g", "CreatedAt", "FatPer100g", "Name", "ProteinPer100g", "TypicalServingSizeGrams" },
                values: new object[,]
                {
                    { new Guid("a0000001-0000-0000-0000-000000000001"), "koshari|كشري", 160m, 28m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3m, "Koshary", 5.5m, 350m },
                    { new Guid("a0000001-0000-0000-0000-000000000002"), "foul medames|فول مدمس", 110m, 15m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2.5m, "Ful Medames", 7.5m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000003"), "falafel|طعمية", 330m, 32m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 18m, "Ta'meya", 13m, 60m },
                    { new Guid("a0000001-0000-0000-0000-000000000004"), "حواوشي", 280m, 22m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 15m, "Hawawshi", 14m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000005"), "mulukhiyah|ملوخية", 30m, 3.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0.4m, "Molokhia", 3m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000006"), "stuffed vegetables|محشي", 120m, 16m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5m, "Mahshi", 3.5m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000007"), "feteer|فطير مشلتت", 360m, 38m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 20m, "Feteer Meshaltet", 6m, 150m },
                    { new Guid("a0000001-0000-0000-0000-000000000008"), "kibda|كبدة اسكندراني", 190m, 8m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8m, "Liver Sandwich", 22m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000009"), "شاورما", 215m, 12m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 11m, "Shawarma", 17m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000010"), "كفتة", 260m, 5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 19m, "Kofta", 18m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000011"), "فراخ مشوية", 165m, 0m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3.6m, "Grilled Chicken", 31m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000012"), "رز مصري|vermicelli rice", 180m, 35m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3m, "Egyptian Rice", 3.5m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000013"), "عيش بلدي|aish baladi", 275m, 55m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1.5m, "Baladi Bread", 9m, 90m },
                    { new Guid("a0000001-0000-0000-0000-000000000014"), "شوربة عدس|ads soup", 65m, 10m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0.8m, "Lentil Soup", 4.5m, 350m },
                    { new Guid("a0000001-0000-0000-0000-000000000015"), "بابا غنوج", 120m, 8m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9m, "Baba Ghanoush", 2.5m, 100m },
                    { new Guid("a0000001-0000-0000-0000-000000000016"), "حمص", 166m, 14m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10m, "Hummus", 8m, 100m },
                    { new Guid("a0000001-0000-0000-0000-000000000017"), "أم علي", 250m, 30m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 12m, "Om Ali", 6m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000018"), "kunafa|كنافة", 390m, 45m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 20m, "Konafa", 7m, 150m },
                    { new Guid("a0000001-0000-0000-0000-000000000019"), "بسبوسة|namoura", 340m, 50m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 14m, "Basbousa", 4m, 80m },
                    { new Guid("a0000001-0000-0000-0000-000000000020"), "عيران|laban", 40m, 4m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1.5m, "Ayran", 2m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000021"), "hibiscus|كركديه", 5m, 1m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, "Karkade", 0.1m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000022"), "فطير بلدي", 310m, 40m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13m, "Fiteer Baladi", 7m, 120m },
                    { new Guid("a0000001-0000-0000-0000-000000000023"), "بصارة|fava bean dip", 90m, 12m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2m, "Bessara", 6m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000024"), "مسقعة|eggplant moussaka", 95m, 8m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6m, "Moussaka", 3m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000025"), "okra stew|باميه", 55m, 5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2.5m, "Bamia", 4m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000026"), "فتة", 200m, 20m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9m, "Fattah", 10m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000027"), "كباب", 245m, 3m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 17m, "Kebab", 20m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000028"), "rice pudding|رز بلبن", 130m, 22m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3m, "Roz Bel Laban", 3.5m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000029"), "عدس أصفر|yellow lentils", 116m, 20m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0.4m, "Kushari Lentils", 9m, 150m },
                    { new Guid("a0000001-0000-0000-0000-000000000030"), "فول بالزيت", 140m, 14m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6m, "Foul with Oil", 7m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000031"), "waraq enab|ورق عنب|dolma", 130m, 17m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5.5m, "Grape Leaves", 3m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000032"), "samosa|سمبوسك", 310m, 28m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 18m, "Sambousek", 8m, 60m },
                    { new Guid("a0000001-0000-0000-0000-000000000033"), "شكشوكة", 100m, 6m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5.5m, "Shakshuka", 7m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000034"), "طحينة", 595m, 21m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 54m, "Tahini", 17m, 30m },
                    { new Guid("a0000001-0000-0000-0000-000000000035"), "دقة", 480m, 20m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 38m, "Dukkah", 18m, 15m },
                    { new Guid("a0000001-0000-0000-0000-000000000036"), "جبنة دمياطي|Egyptian white cheese", 260m, 2m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 21m, "Gibna Domiati", 16m, 50m },
                    { new Guid("a0000001-0000-0000-0000-000000000037"), "halva|حلاوة طحينية", 500m, 55m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 27m, "Halawa Tahinia", 12m, 40m },
                    { new Guid("a0000001-0000-0000-0000-000000000038"), "mixed vegetable stew|تورلي", 60m, 8m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2.5m, "Torly", 2m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000039"), "baked pasta|مكرونة بشاميل", 195m, 22m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8.5m, "Macarona Bechamel", 8m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000040"), "فتة لحمة|meat fattah", 210m, 18m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10m, "Fatta", 12m, 350m },
                    { new Guid("a0000001-0000-0000-0000-000000000041"), "cottage cheese|جبنة قريش", 98m, 3.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4.5m, "Gebna Areesh", 11m, 100m },
                    { new Guid("a0000001-0000-0000-0000-000000000042"), "ساندوتش فول", 200m, 28m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6m, "Foul Sandwich", 8m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000043"), "مسقعة باذنجان|fried eggplant", 100m, 7m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7m, "Mesaka'a", 2.5m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000044"), "كباب حلة|pot kebab", 150m, 6m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8m, "Kabab Halla", 13m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000045"), "سحلب", 90m, 16m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2m, "Sahlab", 2m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000046"), "كشري بالصلصة", 170m, 30m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3.5m, "Kushari with Sauce", 5.5m, 400m },
                    { new Guid("a0000001-0000-0000-0000-000000000047"), "بانيه|breaded chicken", 230m, 14m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 12m, "Chicken Pane", 18m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000048"), "كبدة اسكندراني", 175m, 5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7m, "Alexandrian Liver", 23m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000049"), "ساندوتش سجق|sogo2", 280m, 24m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 15m, "Sausage Sandwich", 12m, 200m },
                    { new Guid("a0000001-0000-0000-0000-000000000050"), "ساندوتش طعمية", 290m, 34m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13m, "Taameya Sandwich", 10m, 180m },
                    { new Guid("a0000001-0000-0000-0000-000000000051"), "فتة بالخل", 180m, 22m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6m, "Fatteh with Vinegar", 9m, 250m },
                    { new Guid("a0000001-0000-0000-0000-000000000052"), "مشويات مشكلة", 220m, 2m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13m, "Mixed Grill", 24m, 300m },
                    { new Guid("a0000001-0000-0000-0000-000000000053"), "قطايف", 300m, 40m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13m, "Qatayef", 6m, 80m },
                    { new Guid("a0000001-0000-0000-0000-000000000054"), "بيض بلدي|fried eggs", 196m, 1m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 15m, "Baladi Eggs", 14m, 120m },
                    { new Guid("a0000001-0000-0000-0000-000000000055"), "مهلبية|milk pudding", 110m, 18m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3m, "Mehalabeya", 3m, 200m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_FoodScans_UserId_ScannedAt",
                schema: "dbo",
                table: "FoodScans",
                columns: new[] { "UserId", "ScannedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_LocalFoodItems_Name",
                schema: "dbo",
                table: "LocalFoodItems",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_MealLogs_FoodScanId",
                schema: "dbo",
                table: "MealLogs",
                column: "FoodScanId");

            migrationBuilder.CreateIndex(
                name: "IX_MealLogs_LocalFoodItemId",
                schema: "dbo",
                table: "MealLogs",
                column: "LocalFoodItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MealLogs_UserId_DiaryDate",
                schema: "dbo",
                table: "MealLogs",
                columns: new[] { "UserId", "DiaryDate" });

            migrationBuilder.CreateIndex(
                name: "IX_MealLogs_UserId_LoggedAt",
                schema: "dbo",
                table: "MealLogs",
                columns: new[] { "UserId", "LoggedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealLogs",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FoodScans",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LocalFoodItems",
                schema: "dbo");
        }
    }
}
