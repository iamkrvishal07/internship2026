namespace FlexChat.Services.dtos.message
{
    public class ReactionAddedEventDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public string EmojiCode { get; set; } = string.Empty;
    }

    public class ReactionRemovedEventDto
    {
        public long MessageId { get; set; }
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public string EmojiCode { get; set; } = string.Empty;
    }
}
