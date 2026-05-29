using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chat
{
    public record ChatMemberDto(
        int UserId,
        string FullName,
        string AvatarUrl,
        string Role,
        DateTime JoinedAt,
        DateTime? LeftAt
    );
}
