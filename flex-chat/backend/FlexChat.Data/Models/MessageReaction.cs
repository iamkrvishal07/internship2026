using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class MessageReaction : CreatedEntity<long>
    {
        public long MessageId { get; set; }
        public int UserId { get; set; }

        public string EmojiCode { get; set; }
        public Message Message { get; set; }
        public User User { get; set; }
    }
}
