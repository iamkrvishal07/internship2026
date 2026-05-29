using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class UserSession : CreatedEntity<int>, IExpirable
    {
        public int UserId { get; set; }

        public string RefreshToken { get; set; }
        public bool IsRevoked { get; set; }

        public DateTime? LastSeenAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        bool IExpirable.IsUsed
        {
            get => IsRevoked;
            set => IsRevoked = value;
        }
        public User User { get; set; }
    }
}
