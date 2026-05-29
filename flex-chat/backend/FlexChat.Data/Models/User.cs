using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{

    public class User : AuditableEntity<int>, ISoftDeletable
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }

        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }

        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public string? StatusMessage { get; set; }

        public ICollection<UserSession> Sessions { get; set; }
        public ICollection<Chat> CreatedChats { get; set; }
        public ICollection<ChatMember> ChatMemberships { get; set; }
        public ICollection<Message> SentMessages { get; set; }
    }
}
