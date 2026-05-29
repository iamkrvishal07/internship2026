using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chat
{
    public class CreateGroupChatDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public List<int> MemberIds { get; set; } = new();
    }

}
