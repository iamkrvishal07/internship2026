using FlexChat.Data.Models.Base;
using System.Collections.Generic;

namespace FlexChat.Data.Models
{
    public class ThemePropertyType : CreatedEntity<int>
    {
        public string Key { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string DefaultValue { get; set; }
        public string PropertyType { get; set; }
        public bool IsRequired { get; set; }

        public ICollection<ThemeProperty> ThemeProperties { get; set; }
    }
}