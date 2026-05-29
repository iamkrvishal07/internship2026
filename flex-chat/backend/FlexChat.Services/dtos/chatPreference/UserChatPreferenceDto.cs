namespace FlexChat.Services.dtos.chatPreference
{
    public class UserChatPreferenceDto
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public string? Nickname { get; set; }
        public int? ThemeId { get; set; }
        public ThemeDto? Theme { get; set; }
        public string FontName { get; set; }
        public bool IsMuted { get; set; }
        public bool IsPinned { get; set; }
        public bool IsArchived { get; set; }
    }
}
