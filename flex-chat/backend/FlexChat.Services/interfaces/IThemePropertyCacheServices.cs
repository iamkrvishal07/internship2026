using FlexChat.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.interfaces
{
    public interface IThemePropertyTypeCacheService
    {
        Task<ThemePropertyType?> GetPropertyTypeByIdAsync(int id);
        Task<List<ThemePropertyType>> GetAllPropertyTypesAsync();
        Task RefreshCacheAsync();
    }
}
