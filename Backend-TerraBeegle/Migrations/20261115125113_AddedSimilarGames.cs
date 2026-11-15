using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class AddedSimilarGames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_game_remakes_Games_Game5Id",
                table: "game_remakes");

            migrationBuilder.DropForeignKey(
                name: "FK_game_remasters_Games_Game6Id",
                table: "game_remasters");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "PegiDescriptions",
                newName: "Description");

            migrationBuilder.RenameIndex(
                name: "IX_PegiDescriptions_Name",
                table: "PegiDescriptions",
                newName: "IX_PegiDescriptions_Description");

            migrationBuilder.RenameColumn(
                name: "Game6Id",
                table: "game_remasters",
                newName: "Game9Id");

            migrationBuilder.RenameColumn(
                name: "Game5Id",
                table: "game_remakes",
                newName: "Game8Id");

            migrationBuilder.AlterColumn<string>(
                name: "GameType",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "GameStatus",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AggregatedRatingCount",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "game_ports",
                columns: table => new
                {
                    Game5Id = table.Column<long>(type: "bigint", nullable: false),
                    PortsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_ports", x => new { x.Game5Id, x.PortsId });
                    table.ForeignKey(
                        name: "FK_game_ports_Games_Game5Id",
                        column: x => x.Game5Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_ports_Games_PortsId",
                        column: x => x.PortsId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_similar_games",
                columns: table => new
                {
                    Game6Id = table.Column<long>(type: "bigint", nullable: false),
                    SimilarGamesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_similar_games", x => new { x.Game6Id, x.SimilarGamesId });
                    table.ForeignKey(
                        name: "FK_game_similar_games_Games_Game6Id",
                        column: x => x.Game6Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_similar_games_Games_SimilarGamesId",
                        column: x => x.SimilarGamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_standalone_expansions",
                columns: table => new
                {
                    Game7Id = table.Column<long>(type: "bigint", nullable: false),
                    StandaloneExpansionsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_standalone_expansions", x => new { x.Game7Id, x.StandaloneExpansionsId });
                    table.ForeignKey(
                        name: "FK_game_standalone_expansions_Games_Game7Id",
                        column: x => x.Game7Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_standalone_expansions_Games_StandaloneExpansionsId",
                        column: x => x.StandaloneExpansionsId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Games_AggregatedRating",
                table: "Games",
                column: "AggregatedRating");

            migrationBuilder.CreateIndex(
                name: "IX_Games_GameStatus",
                table: "Games",
                column: "GameStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Games_PegiRating",
                table: "Games",
                column: "PegiRating");

            migrationBuilder.CreateIndex(
                name: "IX_Games_Rating",
                table: "Games",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Games_ReleaseDate",
                table: "Games",
                column: "ReleaseDate");

            migrationBuilder.CreateIndex(
                name: "IX_game_ports_PortsId",
                table: "game_ports",
                column: "PortsId");

            migrationBuilder.CreateIndex(
                name: "IX_game_similar_games_SimilarGamesId",
                table: "game_similar_games",
                column: "SimilarGamesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_standalone_expansions_StandaloneExpansionsId",
                table: "game_standalone_expansions",
                column: "StandaloneExpansionsId");

            migrationBuilder.AddForeignKey(
                name: "FK_game_remakes_Games_Game8Id",
                table: "game_remakes",
                column: "Game8Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_remasters_Games_Game9Id",
                table: "game_remasters",
                column: "Game9Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_game_remakes_Games_Game8Id",
                table: "game_remakes");

            migrationBuilder.DropForeignKey(
                name: "FK_game_remasters_Games_Game9Id",
                table: "game_remasters");

            migrationBuilder.DropTable(
                name: "game_ports");

            migrationBuilder.DropTable(
                name: "game_similar_games");

            migrationBuilder.DropTable(
                name: "game_standalone_expansions");

            migrationBuilder.DropIndex(
                name: "IX_Games_AggregatedRating",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_GameStatus",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_PegiRating",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_Rating",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_ReleaseDate",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AggregatedRatingCount",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "PegiDescriptions",
                newName: "Name");

            migrationBuilder.RenameIndex(
                name: "IX_PegiDescriptions_Description",
                table: "PegiDescriptions",
                newName: "IX_PegiDescriptions_Name");

            migrationBuilder.RenameColumn(
                name: "Game9Id",
                table: "game_remasters",
                newName: "Game6Id");

            migrationBuilder.RenameColumn(
                name: "Game8Id",
                table: "game_remakes",
                newName: "Game5Id");

            migrationBuilder.AlterColumn<string>(
                name: "GameType",
                table: "Games",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "GameStatus",
                table: "Games",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_game_remakes_Games_Game5Id",
                table: "game_remakes",
                column: "Game5Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_remasters_Games_Game6Id",
                table: "game_remasters",
                column: "Game6Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
