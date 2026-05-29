using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlexChat.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chat_ChatTypes_ChatTypeId1",
                table: "Chat");

            migrationBuilder.DropForeignKey(
                name: "FK_Message_Chat_ChatId1",
                table: "Message");

            migrationBuilder.DropIndex(
                name: "IX_Message_ChatId1",
                table: "Message");

            migrationBuilder.DropIndex(
                name: "IX_Chat_ChatTypeId1",
                table: "Chat");

            migrationBuilder.DropColumn(
                name: "ChatId1",
                table: "Message");

            migrationBuilder.DropColumn(
                name: "ChatTypeId1",
                table: "Chat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ChatId1",
                table: "Message",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChatTypeId1",
                table: "Chat",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Message_ChatId1",
                table: "Message",
                column: "ChatId1");

            migrationBuilder.CreateIndex(
                name: "IX_Chat_ChatTypeId1",
                table: "Chat",
                column: "ChatTypeId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Chat_ChatTypes_ChatTypeId1",
                table: "Chat",
                column: "ChatTypeId1",
                principalTable: "ChatTypes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Message_Chat_ChatId1",
                table: "Message",
                column: "ChatId1",
                principalTable: "Chat",
                principalColumn: "Id");
        }
    }
}
