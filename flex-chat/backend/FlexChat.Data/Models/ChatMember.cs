using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class ChatMember : BaseEntity<int>
    {
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public int? InvitedBy { get; set; }

        public int RoleId { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }

        public RoleType Role { get; set; }
        public Chat Chat { get; set; }
        public User User { get; set; }
    }
}
