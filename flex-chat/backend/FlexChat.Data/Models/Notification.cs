using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class Notification : CreatedEntity<int>
    {
        public int RecipientId { get; set; }

        public string Type { get; set; }
        public string ReferenceId { get; set; }
        public string Payload { get; set; }

        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }

        public User Recipient { get; set; }
    }
}
