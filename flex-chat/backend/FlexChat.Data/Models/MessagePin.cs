using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{

    public class MessagePin : BaseEntity<int>
    {
        public int ChatId { get; set; }
        public long MessageId { get; set; }
        public int PinnedBy { get; set; }

        public DateTime PinnedAt { get; set; }
    }
}
