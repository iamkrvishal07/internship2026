using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class UserChatPreference : AuditableEntity<int>
    {
        public int UserId { get; set; }
        public int ChatId { get; set; }

        public string? Nickname { get; set; }
        public int? ThemeId { get; set; }
        public string FontName { get; set; } = "Inter";

        public bool IsMuted { get; set; } = false;
        public bool IsPinned { get; set; } = false;
        public bool IsArchived { get; set; } = false;

        public Chat Chat { get; set; }
        public User User { get; set; }
        public Theme Theme { get; set; }
    }
}
