using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymScan.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileFieldsAndDailyNutritionGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Age",
                schema: "dbo",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                schema: "dbo",
                table: "Users",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HeightCm",
                schema: "dbo",
                table: "Users",
                type: "float(5)",
                precision: 5,
                scale: 1,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "WeightKg",
                schema: "dbo",
                table: "Users",
                type: "float(5)",
                precision: 5,
                scale: 1,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DailyNutritionGoals",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaloriesTarget = table.Column<int>(type: "int", nullable: false),
                    ProteinGramsTarget = table.Column<double>(type: "float(7)", precision: 7, scale: 1, nullable: false),
                    CarbohydratesGramsTarget = table.Column<double>(type: "float(7)", precision: 7, scale: 1, nullable: false),
                    FatGramsTarget = table.Column<double>(type: "float(7)", precision: 7, scale: 1, nullable: false),
                    GoalSource = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyNutritionGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyNutritionGoals_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyNutritionGoals_UserId",
                schema: "dbo",
                table: "DailyNutritionGoals",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyNutritionGoals_UserId_IsActive",
                schema: "dbo",
                table: "DailyNutritionGoals",
                columns: new[] { "UserId", "IsActive" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyNutritionGoals",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "Age",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Gender",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HeightCm",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WeightKg",
                schema: "dbo",
                table: "Users");
        }
    }
}
