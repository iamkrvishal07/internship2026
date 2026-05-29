using System;
using System.Collections.Generic;
using System.Text;
using FlexChat.Services.dtos.chatPreference;

namespace FlexChat.Services.interfaces
{
    public interface IThemeService
    {
        Task<ThemeDto> CreateThemeAsync(int userId, CreateThemeDto dto);
        Task<ThemeDto> GetThemeAsync(int themeId, int? userId = null);
        Task<List<ThemeDto>> GetThemeByNameAsync(int userId, string name, int page, int pageSize);
        Task<List<ThemeDto>> GetUserThemesAsync(int userId, int page, int pageSize);
        Task<ThemeDto> UpdateThemeAsync(int userId, int themeId, UpdateThemeDto dto);
        Task DeleteThemeAsync(int themeId, int userId);
        Task<ThemeDto> GetDefaultThemeAsync(int userId);
        Task<UserChatPreferenceDto> ApplyThemeToChat(int userId, int chatId, int themeId);
        Task<UserChatPreferenceDto> GetChatPreferenceAsync(int userId, int chatId);
        Task<ThemeDto> SetThemeAsDefaultAsync(int userId, int themeId);
    }
}