using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class Message : AuditableEntity<long>, ISoftDeletable
    {
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public long? ParentId { get; set; }

        public int ContentTypeId { get; set; }
        public string Content { get; set; }

        public bool IsDeleted { get; set; }
        public bool IsEdited { get; set; }
        public DateTime? EditedAt { get; set; }
        
        public ContentType ContentType { get; set; }
        public Chat Chat { get; set; }
        public User Sender { get; set; }

        public Message Parent { get; set; }
        public ICollection<Message> Replies { get; set; }

        public ICollection<MessageReceipt> Receipts { get; set; }
        public ICollection<MessageReaction> Reactions { get; set; }
        public ICollection<Attachment> Attachments { get; set; }
    }
}
