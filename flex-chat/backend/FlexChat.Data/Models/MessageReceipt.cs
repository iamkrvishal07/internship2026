using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class MessageReceipt : BaseEntity<long>
    {
        public long MessageId { get; set; }
        public int UserId { get; set; }

        public DateTime? DeliveredAt { get; set; }
        public DateTime? ReadAt { get; set; }

        public Message Message { get; set; }
        public User User { get; set; }
    }
}
