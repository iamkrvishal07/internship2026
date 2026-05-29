using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class RoleType : BaseEntity<int>
    {
        public string Code { get; set; }

        // Navigation
        public ICollection<ChatMember> ChatMembers { get; set; }
    }
}
