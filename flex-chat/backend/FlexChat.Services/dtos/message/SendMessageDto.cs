namespace FlexChat.Services.dtos.message
{
    public class SendMessageDto
    {
        public string ContentType { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public long? ParentId { get; set; }
    }
}
