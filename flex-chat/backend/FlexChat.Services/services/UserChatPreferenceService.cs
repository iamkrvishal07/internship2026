using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Models;
using FlexChat.Services.dtos.chatPreference;
using FlexChat.Services.interfaces;
using Infrastructure.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace FlexChat.Services.services
{
    public class UserChatPreferenceService : IUserChatPreferenceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<UserChatPreference> _userChatPreferenceRepository;
        private readonly IRepository<Theme> _themeRepository;

        public UserChatPreferenceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _userChatPreferenceRepository = _unitOfWork.Repository<UserChatPreference>();
            _themeRepository = _unitOfWork.Repository<Theme>();
        }

        public async Task UpdateChatPreferencesAsync(int userId, int chatId, UserChatPreferenceDto chatPreferenceDto)
        {
            var chatPreference = await _userChatPreferenceRepository
                       .FirstOrDefaultAsync(obj=>obj.UserId == userId && obj.ChatId == chatId, false);

            if (chatPreference == null)
                throw new NotFoundException("ChatPreference", chatId);

            var theme = await _themeRepository.FirstOrDefaultAsync(obj=>obj.Id == chatPreferenceDto.ThemeId);

            if (theme == null && chatPreferenceDto.ThemeId.HasValue)
                throw new NotFoundException("Theme", chatPreferenceDto.ThemeId.Value);

            chatPreference.IsPinned = chatPreferenceDto.IsPinned;
            chatPreference.IsArchived = chatPreferenceDto.IsArchived;
            chatPreference.IsMuted = chatPreferenceDto.IsMuted;

            chatPreference.Nickname = chatPreferenceDto.Nickname;
            chatPreference.FontName = chatPreferenceDto.FontName;

            chatPreference.ThemeId = chatPreferenceDto.ThemeId;
            chatPreference.UpdatedAt = DateTime.UtcNow;

            _userChatPreferenceRepository.Update(chatPreference);

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<UserChatPreferenceDto> GetChatPreferenceAsync(int userId, int chatId)
        {
            var chatPreference = await _userChatPreferenceRepository.Query()
                .Include(obj => obj.Theme)
                .ThenInclude(obj => obj.Properties)
                .FirstOrDefaultAsync(obj => obj.UserId == userId && obj.ChatId == chatId)
                ?? throw new NotFoundException("ChatPreference", chatId);

            return MapToDto(chatPreference);
        }

        private static UserChatPreferenceDto MapToDto(UserChatPreference chatPreference)
        {
            return new UserChatPreferenceDto
            {
                Id = chatPreference.Id,
                ChatId = chatPreference.ChatId,
                Nickname = chatPreference.Nickname,
                ThemeId = chatPreference.ThemeId,
                FontName = chatPreference.FontName,
                Theme = chatPreference.Theme != null ? new ThemeDto
                {
                    Id = chatPreference.Theme.Id,
                    Name = chatPreference.Theme.Name,
                    IsDefault = chatPreference.Theme.IsDefault,
                    CreatedAt = chatPreference.Theme.CreatedAt,
                    UpdatedAt = chatPreference.Theme.UpdatedAt,
                    Properties = chatPreference.Theme.Properties.ToDictionary(p => p.PropertyTypeId, p => p.PropertyValue)
                } : null,
                IsMuted = chatPreference.IsMuted,
                IsPinned = chatPreference.IsPinned,
                IsArchived = chatPreference.IsArchived
            };
        }
    }
}
