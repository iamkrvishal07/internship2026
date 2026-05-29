using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.user
{
    public class UserProfileUpateDto
    {
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public string? StatusMessage { get; set; }
    }
}
