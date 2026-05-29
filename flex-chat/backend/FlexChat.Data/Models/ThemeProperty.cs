using FlexChat.Data.Models.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Data.Models
{
    public class ThemeProperty : CreatedEntity<int>
    {
        public int ThemeId { get; set; }
        public int PropertyTypeId { get; set; }
        public string PropertyValue { get; set; }
        public Theme Theme { get; set; }
        public ThemePropertyType ThemePropertyType { get; set; }
    }
}
