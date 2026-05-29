using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chat
{
    public class UpdateGroupChatDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }
}
