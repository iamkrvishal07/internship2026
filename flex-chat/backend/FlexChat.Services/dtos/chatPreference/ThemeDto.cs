using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chatPreference
{
    public class ThemeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDefault { get; set; }
        public Dictionary<int, string> Properties { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
