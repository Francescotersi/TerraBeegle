using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class AddParentPlatformToPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_FriendId",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_UserId",
                table: "Friendships");

            migrationBuilder.DropTable(
                name: "favorites");

            migrationBuilder.DropTable(
                name: "wishlist_items");

            migrationBuilder.DropIndex(
                name: "IX_Friendships_FriendId",
                table: "Friendships");

            migrationBuilder.DropIndex(
                name: "IX_Friendships_UserId_FriendId",
                table: "Friendships");

            migrationBuilder.DropCheckConstraint(
                name: "ck_friendships_not_self",
                table: "Friendships");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Friendships",
                newName: "User2Id");

            migrationBuilder.RenameColumn(
                name: "FriendId",
                table: "Friendships",
                newName: "User1Id");

            migrationBuilder.AlterColumn<string>(
                name: "Theme",
                table: "Users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Light",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Light");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Games",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Tba",
                table: "Games",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<long>(
                name: "ReceiverId",
                table: "Friendships",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "favorite_games",
                columns: table => new
                {
                    FavoritedByUsersId = table.Column<long>(type: "bigint", nullable: false),
                    FavoritesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_favorite_games", x => new { x.FavoritedByUsersId, x.FavoritesId });
                    table.ForeignKey(
                        name: "FK_favorite_games_Games_FavoritesId",
                        column: x => x.FavoritesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_favorite_games_Users_FavoritedByUsersId",
                        column: x => x.FavoritedByUsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Genres",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RawgGenreId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genres", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParentPlatforms",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RawgPlatformId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Image = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParentPlatforms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "wishlist_games",
                columns: table => new
                {
                    WishlistItemsId = table.Column<long>(type: "bigint", nullable: false),
                    WishlistedByUsersId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wishlist_games", x => new { x.WishlistItemsId, x.WishlistedByUsersId });
                    table.ForeignKey(
                        name: "FK_wishlist_games_Games_WishlistItemsId",
                        column: x => x.WishlistItemsId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wishlist_games_Users_WishlistedByUsersId",
                        column: x => x.WishlistedByUsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_genres",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    GenresId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_genres", x => new { x.GamesId, x.GenresId });
                    table.ForeignKey(
                        name: "FK_game_genres_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_genres_Genres_GenresId",
                        column: x => x.GenresId,
                        principalTable: "Genres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Platforms",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RawgPlatformId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ParentPlatformId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Platforms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Platforms_ParentPlatforms_ParentPlatformId",
                        column: x => x.ParentPlatformId,
                        principalTable: "ParentPlatforms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "game_platforms",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    PlatformsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_platforms", x => new { x.GamesId, x.PlatformsId });
                    table.ForeignKey(
                        name: "FK_game_platforms_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_platforms_Platforms_PlatformsId",
                        column: x => x.PlatformsId,
                        principalTable: "Platforms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_User1Id_User2Id",
                table: "Friendships",
                columns: new[] { "User1Id", "User2Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_User2Id",
                table: "Friendships",
                column: "User2Id");

            migrationBuilder.CreateIndex(
                name: "IX_favorite_games_FavoritesId",
                table: "favorite_games",
                column: "FavoritesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_genres_GenresId",
                table: "game_genres",
                column: "GenresId");

            migrationBuilder.CreateIndex(
                name: "IX_game_platforms_PlatformsId",
                table: "game_platforms",
                column: "PlatformsId");

            migrationBuilder.CreateIndex(
                name: "IX_Genres_RawgGenreId",
                table: "Genres",
                column: "RawgGenreId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParentPlatforms_RawgPlatformId",
                table: "ParentPlatforms",
                column: "RawgPlatformId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_ParentPlatformId",
                table: "Platforms",
                column: "ParentPlatformId");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_RawgPlatformId",
                table: "Platforms",
                column: "RawgPlatformId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wishlist_games_WishlistedByUsersId",
                table: "wishlist_games",
                column: "WishlistedByUsersId");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships");

            migrationBuilder.DropTable(
                name: "favorite_games");

            migrationBuilder.DropTable(
                name: "game_genres");

            migrationBuilder.DropTable(
                name: "game_platforms");

            migrationBuilder.DropTable(
                name: "wishlist_games");

            migrationBuilder.DropTable(
                name: "Genres");

            migrationBuilder.DropTable(
                name: "Platforms");

            migrationBuilder.DropTable(
                name: "ParentPlatforms");

            migrationBuilder.DropIndex(
                name: "IX_Friendships_User1Id_User2Id",
                table: "Friendships");

            migrationBuilder.DropIndex(
                name: "IX_Friendships_User2Id",
                table: "Friendships");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Tba",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "ReceiverId",
                table: "Friendships");

            migrationBuilder.RenameColumn(
                name: "User2Id",
                table: "Friendships",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "User1Id",
                table: "Friendships",
                newName: "FriendId");

            migrationBuilder.AlterColumn<string>(
                name: "Theme",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Light",
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10,
                oldDefaultValue: "Light");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Games",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "favorites",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_favorites", x => new { x.UserId, x.GameId });
                    table.ForeignKey(
                        name: "FK_favorites_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_favorites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wishlist_items",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wishlist_items", x => new { x.UserId, x.GameId });
                    table.ForeignKey(
                        name: "FK_wishlist_items_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_wishlist_items_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_FriendId",
                table: "Friendships",
                column: "FriendId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_UserId_FriendId",
                table: "Friendships",
                columns: new[] { "UserId", "FriendId" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_friendships_not_self",
                table: "Friendships",
                sql: "\"UserId\" <> \"FriendId\"");

            migrationBuilder.CreateIndex(
                name: "IX_favorites_GameId",
                table: "favorites",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_wishlist_items_GameId",
                table: "wishlist_items",
                column: "GameId");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_FriendId",
                table: "Friendships",
                column: "FriendId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_UserId",
                table: "Friendships",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
