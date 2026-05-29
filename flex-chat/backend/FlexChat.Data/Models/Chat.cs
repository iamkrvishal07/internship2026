using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class Chat : AuditableEntity<int>
    {
        public int ChatTypeId { get; set; }
        public string Name        { get; set; }
        public string ImageUrl    { get; set; }
        public string Description { get; set; }

        public int CreatedBy { get; set; }

        public long? LastMessageId { get; set; }

        public ChatType ChatType { get; set; }
        public User    Creator     { get; set; }
        public Message LastMessage { get; set; }

        public ICollection<ChatMember> Members  { get; set; }
        public ICollection<Message>   Messages  { get; set; }
    }
}
