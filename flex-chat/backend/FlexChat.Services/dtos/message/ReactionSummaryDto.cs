namespace FlexChat.Services.dtos.message
{
    public class ReactionSummaryDto
    {
        public string EmojiCode { get; set; } = string.Empty;
        public int Count { get; set; }
        public List<int> UserIds { get; set; } = new();
    }
}
