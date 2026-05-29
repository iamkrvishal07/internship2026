namespace FlexChat.Services.dtos.message
{
    public class MessageDto
    {
        public long Id { get; set; }
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        // we can remove this sendig in each request is not ideal we can reuse from message cache refer how i have used in message toaster
        public string SenderAvatarUrl { get; set; } = string.Empty;
        public long? ParentId { get; set; }
        public MessageDto? ParentPreview { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public bool IsEdited { get; set; }
        public DateTime? EditedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new();
        public List<ReactionSummaryDto> Reactions { get; set; } = new();
        public ReceiptSummaryDto? Receipt { get; set; }
    }
}
