using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class UserBlock : BaseEntity<int>
    {
        public int BlockerId { get; set; }
        public int BlockedId { get; set; }

        public DateTime BlockedAt { get; set; }
        public User Blocker { get; set; }
        public User Blocked { get; set; }
    }
}
