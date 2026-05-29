using System;
using System.Collections.Generic;
using System.Text;
using FlexChat.Services.dtos.message;


namespace FlexChat.Services.dtos.chat
{
    public record ChatSummaryDto(
        int Id,
        string Type,
        string Name,
        string ImageUrl,
        string Description,
        int CreatedBy,
        DateTime CreatedAt,
        MessagePreviewDto? LastMessage,
        int UnreadCount,
        List<ChatMemberDto> Members
    );
}
