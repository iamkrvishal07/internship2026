using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.user
{
    public class UserProfileDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public string? StatusMessage { get; set; }

        public DateOnly CreatedAt { get; set; }
    }
}
