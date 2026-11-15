using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class AddedFixedReviewForeignKeyType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_ApiGameId",
                table: "Reviews");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Games_ApiGameId",
                table: "Games",
                column: "ApiGameId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_ApiGameId",
                table: "Reviews",
                column: "ApiGameId",
                principalTable: "Games",
                principalColumn: "ApiGameId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_ApiGameId",
                table: "Reviews");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Games_ApiGameId",
                table: "Games");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_ApiGameId",
                table: "Reviews",
                column: "ApiGameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
