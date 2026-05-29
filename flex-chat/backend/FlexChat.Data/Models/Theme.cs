using FlexChat.Data.Models.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Data.Models
{
    public class Theme : AuditableEntity<int>
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public bool IsDefault { get; set; }

        public User User { get; set; }
        public ICollection<ThemeProperty> Properties { get; set; } = new List<ThemeProperty>();
    }
}
