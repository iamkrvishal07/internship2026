

namespace FlexChat.Services.dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Username { get; set; }

        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public string? StatusMessage { get; set; }
    }
}
