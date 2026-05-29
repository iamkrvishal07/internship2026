using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chat
{
    public class AddMembersDto
    {
        public List<int> UserIds { get; set; } = new();
    }
}
