using FlexChat.Services.dtos;
using FlexChat.Services.dtos.page;
using FlexChat.Services.dtos.user;

namespace FlexChat.Services.interfaces
{
    public interface IUserService
    {
        Task<PagedResultDto<UserDto>> GetUsersAsync(string? search, int page, int pageSize);
        Task<UserProfileDto> GetUserProfileAsync(int id);
        Task<UserProfileDto> UpdateUserProfile(int id, UserProfileUpateDto userProfile);
    }
}
