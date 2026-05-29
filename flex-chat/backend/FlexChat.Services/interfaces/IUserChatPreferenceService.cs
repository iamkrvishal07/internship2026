using FlexChat.Services.dtos.chatPreference;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace FlexChat.Services.interfaces
{
    public interface IUserChatPreferenceService
    {
        Task<UserChatPreferenceDto> GetChatPreferenceAsync(int userId, int chatId);
        Task UpdateChatPreferencesAsync(int userId, int chatId, UserChatPreferenceDto chatPreferenceDto);
    }
}
