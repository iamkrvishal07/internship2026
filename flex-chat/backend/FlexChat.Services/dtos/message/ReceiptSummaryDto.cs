namespace FlexChat.Services.dtos.message
{
    public class ReceiptSummaryDto
    {
        public List<int> DeliveredUserIds { get; set; } = new();

        public List<int> ReadUserIds { get; set; } = new();

        public int DeliveredCount => DeliveredUserIds.Count;

        public int ReadCount => ReadUserIds.Count;

        public DateTime? DeliveredAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }


}
