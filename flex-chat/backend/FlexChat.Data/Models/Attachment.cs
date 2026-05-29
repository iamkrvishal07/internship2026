using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class Attachment : BaseEntity<long>
    {
        public long MessageId { get; set; }
        public int AttachmentTypeId { get; set; }

        public string OriginalName { get; set; }
        public string StoredName { get; set; }
        public string CdnUrl { get; set; }
        public string MimeType { get; set; }
        public long SizeBytes { get; set; }
        public DateTime UploadedAt { get; set; }

        public AttachmentType AttachmentType { get; set; }
        public Message Message { get; set; }
    }
}
