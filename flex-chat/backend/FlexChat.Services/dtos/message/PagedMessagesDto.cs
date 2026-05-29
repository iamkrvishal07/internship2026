namespace FlexChat.Services.dtos.message
{
    public class PagedMessagesDto
    {
        public List<MessageDto> Messages { get; set; } = new();
        public bool HasMore { get; set; }
        public long? NextCursor { get; set; }
    }
}
