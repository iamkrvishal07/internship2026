namespace FlexChat.Services.dtos.message
{
    public class MessageStreamChunkDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
        public string Chunk { get; set; } = string.Empty;
        public bool IsFinal { get; set; }
    }

    public class MessageEditedEventDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
        public string NewContent { get; set; } = string.Empty;
        public DateTime EditedAt { get; set; }
    }

    public class MessageEditEventDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
    }

    public class MessageUndoneEventDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
    }

    public class TypingEventDto
    {
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public bool IsTyping { get; set; }
    }

    public class ReceiptUpdatedEventDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public int SenderId { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}
