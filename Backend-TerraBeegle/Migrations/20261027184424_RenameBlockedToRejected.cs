using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class RenameBlockedToRejected : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // FriendshipStatus.Blocked was renamed to Rejected; Status is stored as text, so old rows
            // with "Blocked" can no longer be read. Does nothing if there are no such rows.
            migrationBuilder.Sql("UPDATE \"Friendships\" SET \"Status\" = 'Rejected' WHERE \"Status\" = 'Blocked';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Nothing to undo: after Up it is not known which Rejected rows were Blocked before
        }
    }
}
