using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGameAndFriendship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CoverImageUrl",
                table: "Games",
                newName: "BackgroundImage");

            migrationBuilder.AddColumn<string>(
                name: "NameOriginal",
                table: "Games",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating1count",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating2count",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating3count",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating4count",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating5count",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "Games",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Friendships",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameOriginal",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rating1count",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rating2count",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rating3count",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rating4count",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rating5count",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Friendships");

            migrationBuilder.RenameColumn(
                name: "BackgroundImage",
                table: "Games",
                newName: "CoverImageUrl");
        }
    }
}
