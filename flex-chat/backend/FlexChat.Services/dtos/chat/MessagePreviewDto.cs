using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chat
{
    public record MessagePreviewDto(
        long Id,
        int SenderId,
        string SenderName,
        string ContentType,
        string Content,
        DateTime CreatedAt,
        bool IsDeleted
    );
}
