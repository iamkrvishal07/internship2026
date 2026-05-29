using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.dtos.chatPreference
{
    public class UpdateThemeDto
    {
        public string Name { get; set; }
        public List<ThemePropertyInputDto> Properties { get; set; }
    }
}
