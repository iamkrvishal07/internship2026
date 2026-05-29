using FlexChat.Data.Models.Base;

namespace FlexChat.Data.Models
{
    public class ChatType : BaseEntity<int>
    {
        public string Code { get; set; }

        // Navigation
        public ICollection<Chat> Chats { get; set; }
    }
}
