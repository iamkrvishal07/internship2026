using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class AttachmentType : BaseEntity<int>
    {
        public string Code { get; set; }

        // Navigation
        public ICollection<Attachment> Attachments { get; set; }
    }
}
