using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Models;
using FlexChat.Services.dtos.chatPreference;
using FlexChat.Services.interfaces;
using Infrastructure.Constants;
using Infrastructure.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace FlexChat.Services.services
{
    public class ThemeService : IThemeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<Theme> _themeRepo;
        private readonly IRepository<ThemeProperty> _themePropertyRepo;
        private readonly IRepository<UserChatPreference> _userChatPreferencesRepo;
        private readonly IThemePropertyTypeCacheService _propertyTypeCacheService;


        public ThemeService(IUnitOfWork unitOfWork, IThemePropertyTypeCacheService propertyTypeCacheService)
        {
            _unitOfWork = unitOfWork;
            _themeRepo = _unitOfWork.Repository<Theme>();
            _themePropertyRepo = _unitOfWork.Repository<ThemeProperty>();
            _userChatPreferencesRepo = _unitOfWork.Repository<UserChatPreference>();
            _propertyTypeCacheService = propertyTypeCacheService;
        }

        public async Task<ThemeDto> CreateThemeAsync(int userId, CreateThemeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Theme name is required");

            if (dto.Properties == null || dto.Properties.Count == 0)
                throw new ArgumentNullException(nameof(dto.Properties), "Properties cannot be empty");

            var themeExists = await _themeRepo.Query(false)
                .AnyAsync(obj => obj.UserId == userId && obj.Name == dto.Name);

            if (themeExists)
                throw new BusinessException($"Theme '{dto.Name}' already exists");

            var isNotDefault = await _themeRepo.Query(false)
                .AnyAsync(obj => obj.UserId == userId);

            var propertiesDict = dto.Properties.ToDictionary(p => p.PropertyTypeId, p => p.PropertyValue);
            var properties = await ValidateAndCreateThemePropertiesAsync(propertiesDict);

            var theme = new Theme
            {
                UserId = userId,
                Name = dto.Name,
                IsDefault = !isNotDefault,
                CreatedAt = DateTime.UtcNow
            };

            await _themeRepo.AddAsync(theme);
            await _unitOfWork.SaveChangesAsync();

            properties.ForEach(obj => obj.ThemeId = theme.Id);
            await _themePropertyRepo.AddRangeAsync(properties);
            await _unitOfWork.SaveChangesAsync();

            return await GetThemeAsync(theme.Id, userId);
        }

        public async Task<ThemeDto> GetThemeAsync(int themeId, int? userId = null)
        {
            var query = _themeRepo.Query()
                .Include(obj => obj.Properties)
                .Where(p => p.Id == themeId);

            if (userId.HasValue && userId > 0)
            {
                query = query.Where(p => p.UserId == userId.Value);
            }

            var theme = await query.FirstOrDefaultAsync()
                ?? throw new NotFoundException("Theme", themeId);

            return MapToDto(theme);
        }

        public async Task<List<ThemeDto>> GetThemeByNameAsync(int userId, string name, int page = 1, int pageSize = 10)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            var themes = await _themeRepo.Query()
                .Include(obj => obj.Properties)
                .Where(obj => obj.UserId == userId && obj.Name.Contains(name))
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!themes.Any())
                throw new NotFoundException("Theme", name);

            return themes.Select(MapToDto).ToList();
        }

        public async Task<List<ThemeDto>> GetUserThemesAsync(int userId, int page = 1, int pageSize = 10)
        {
            var data = await _themeRepo.Query()
                                       .Include(obj => obj.Properties)
                                       .Where(obj => obj.UserId == userId)
                                       .Skip((page - 1) * pageSize)
                                       .Take(pageSize)
                                       .ToListAsync()
                                ?? throw new NotFoundException("Theme", userId);
            return [.. data.Select(MapToDto)];
        }

        public async Task<ThemeDto> UpdateThemeAsync(int userId, int themeId, UpdateThemeDto dto)
        {
            var theme = await _themeRepo.Query()
                .Include(obj => obj.Properties)
                .FirstOrDefaultAsync(p => p.Id == themeId && p.UserId == userId)
                ?? throw new NotFoundException("Theme", themeId);

            if (!string.IsNullOrWhiteSpace(dto.Name))
                theme.Name = dto.Name;

            theme.UpdatedAt = DateTime.UtcNow;

            if (dto.Properties != null && dto.Properties.Count > 0)
            {
                _themePropertyRepo.RemoveRange(theme.Properties);
                var propertiesDict = dto.Properties.ToDictionary(p => p.PropertyTypeId, p => p.PropertyValue);
                var properties = await ValidateAndCreateThemePropertiesAsync(propertiesDict);
                properties.ForEach(obj => obj.ThemeId = theme.Id);
                await _themePropertyRepo.AddRangeAsync(properties);
            }

            _themeRepo.Update(theme);
            await _unitOfWork.SaveChangesAsync();

            return await GetThemeAsync(themeId, userId);
        }

        public async Task DeleteThemeAsync(int themeId, int userId)
        {
            var theme = await _themeRepo.Query().FirstOrDefaultAsync(obj => obj.Id == themeId && obj.UserId == userId)
                                    ?? throw new NotFoundException("Theme", themeId);

            var preferences = await _userChatPreferencesRepo.Query(false)
                                    .Where(obj => obj.ThemeId == themeId).ToListAsync();

            foreach (var preference in preferences)
            {
                preference.ThemeId = null;
                _userChatPreferencesRepo.Update(preference);
            }

            var properties = await _themePropertyRepo.Query(false)
                                    .Where(obj => obj.ThemeId == themeId).ToListAsync();

            _themePropertyRepo.RemoveRange(properties);
            _themeRepo.Delete(theme);

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<ThemeDto> GetDefaultThemeAsync(int userId)
        {
            var data = await _themeRepo.Query()
                                    .Include(obj => obj.Properties)
                                    .FirstOrDefaultAsync(obj => obj.UserId == userId
                                        && obj.IsDefault == true)
                                    ?? throw new NotFoundException("Theme", userId);

            return MapToDto(data);
        }

        public async Task<UserChatPreferenceDto> GetChatPreferenceAsync(int userId, int chatId)
        {
            var preference = await _userChatPreferencesRepo
                                        .Query(false)
                                        .Include(obj => obj.Theme)
                                            .ThenInclude(obj => obj.Properties)
                                        .FirstOrDefaultAsync(obj => obj.UserId == userId
                                        && obj.ChatId == chatId) ?? throw new NotFoundException("UserChatPreference", userId + "-" + chatId);

            return new UserChatPreferenceDto
            {
                Id = preference.Id,
                ChatId = preference.ChatId,
                Nickname = preference.Nickname,
                ThemeId = preference.ThemeId,
                Theme = preference.Theme != null ? MapToDto(preference.Theme) : null,
                IsMuted = preference.IsMuted,
                IsPinned = preference.IsPinned,
                IsArchived = preference.IsArchived
            };
        }

        public async Task<UserChatPreferenceDto> ApplyThemeToChat(int userId, int chatId, int themeId)
        {
            var chatPreference = await _userChatPreferencesRepo
                                .FirstOrDefaultAsync(obj => obj.UserId == userId
                                && obj.ChatId == chatId, false)
                                ?? throw new NotFoundException("UserChatPreference",
                                userId + " - " + chatId);

            chatPreference.ThemeId = themeId;

            _userChatPreferencesRepo.Update(chatPreference);

            await _unitOfWork.SaveChangesAsync();

            return await GetChatPreferenceAsync(userId, chatId);
        }

        public async Task<ThemeDto> SetThemeAsDefaultAsync(int userId, int themeId)
        {
            var theme = await _themeRepo.Query()
                .Include(obj => obj.Properties)
                .FirstOrDefaultAsync(p => p.Id == themeId && p.UserId == userId)
                ?? throw new NotFoundException("Theme", themeId);

            var otherDefaultThemes = await _themeRepo.Query(false)
                .Where(p => p.UserId == userId && p.Id != themeId && p.IsDefault)
                .ToListAsync();

            foreach (var otherTheme in otherDefaultThemes)
            {
                otherTheme.IsDefault = false;
                _themeRepo.Update(otherTheme);
            }

            theme.IsDefault = true;
            theme.UpdatedAt = DateTime.UtcNow;
            _themeRepo.Update(theme);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(theme);
        }

        private static ThemeDto MapToDto(Theme theme)
        {
            return new ThemeDto
            {
                Id = theme.Id,
                Name = theme.Name,
                IsDefault = theme.IsDefault,
                CreatedAt = theme.CreatedAt,
                UpdatedAt = theme.UpdatedAt,
                Properties = theme.Properties?
                    .ToDictionary(p => p.PropertyTypeId, p => p.PropertyValue)
                    ?? new Dictionary<int, string>()
            };
        }

        private bool ValidatePropertyValue(string propertyType, string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            return propertyType switch
            {
                UiElementPropertyTypes.Color => Regex.IsMatch(value, @"^#[0-9A-Fa-f]{6}$"),
                UiElementPropertyTypes.Number => int.TryParse(value, out _),
                UiElementPropertyTypes.Select => !string.IsNullOrWhiteSpace(value),
                UiElementPropertyTypes.Boolean => bool.TryParse(value, out _),
                UiElementPropertyTypes.Text => value.Length <= 255,
                _ => false
            };
        }

        private async Task<List<ThemeProperty>> ValidateAndCreateThemePropertiesAsync(Dictionary<int, string> properties)
        {
            var themeProperties = new List<ThemeProperty>();

            foreach (var prop in properties)
            {
                var propType = await _propertyTypeCacheService.GetPropertyTypeByIdAsync(prop.Key);

                if (propType == null)
                    throw new NotFoundException("ThemePropertyType", prop.Key);

                if(!String.IsNullOrEmpty(prop.Value) && !ValidatePropertyValue(propType.PropertyType, prop.Value))
                        throw new BusinessException($"Invalid value for property type: {propType.PropertyType}");

                 themeProperties.Add(new ThemeProperty()
                {
                    PropertyTypeId = prop.Key,
                    PropertyValue = prop.Value != null?prop.Value:propType.DefaultValue,
                    CreatedAt = DateTime.UtcNow
                });
            }

            return themeProperties;
        }
    }
}