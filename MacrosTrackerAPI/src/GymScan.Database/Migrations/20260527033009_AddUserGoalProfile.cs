using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymScan.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddUserGoalProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserGoalProfiles",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BiologicalSex = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    AgeYears = table.Column<int>(type: "int", nullable: false),
                    WeightKg = table.Column<double>(type: "float(6)", precision: 6, scale: 2, nullable: false),
                    HeightCm = table.Column<double>(type: "float(6)", precision: 6, scale: 2, nullable: false),
                    ActivityLevel = table.Column<int>(type: "int", nullable: false),
                    GoalType = table.Column<int>(type: "int", nullable: false),
                    CalculatedBmr = table.Column<double>(type: "float(8)", precision: 8, scale: 2, nullable: false),
                    CalculatedTdee = table.Column<double>(type: "float(8)", precision: 8, scale: 2, nullable: false),
                    CalorieAdjustment = table.Column<int>(type: "int", nullable: false),
                    DailyCaloriesTarget = table.Column<int>(type: "int", nullable: false),
                    DailyProteinGrams = table.Column<double>(type: "float(7)", precision: 7, scale: 1, nullable: false),
                    DailyCarbsGrams = table.Column<double>(type: "float(7)", precision: 7, scale: 1, nullable: false),
                    DailyFatGrams = table.Column<double>(type: "float(7)", precision: 7, scale: 1, nullable: false),
                    IsCalorieMinimumApplied = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGoalProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserGoalProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserGoalProfiles_UserId",
                schema: "dbo",
                table: "UserGoalProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserGoalProfiles",
                schema: "dbo");
        }
    }
}
