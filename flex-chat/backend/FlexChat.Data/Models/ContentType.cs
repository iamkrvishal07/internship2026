using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class ContentType : BaseEntity<int>
    {
        public string Code { get; set; }

        // Navigation
        public ICollection<Message> Messages { get; set; }
    }
}
