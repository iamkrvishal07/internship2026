namespace FlexChat.Services.dtos.message
{
    public class AttachmentDto
    {
        public long Id { get; set; }
        public string OriginalName { get; set; } = string.Empty;
        public string CdnUrl { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public string AttachmentType { get; set; } = string.Empty;
        public long SizeBytes { get; set; }
    }
}
