using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Services.dtos;
using FlexChat.Services.dtos.page;
using FlexChat.Data.Models;
using FlexChat.Services.interfaces;
using Infrastructure.Exceptions;
using Infrastructure.Logger;
using Microsoft.EntityFrameworkCore;
using FlexChat.Services.dtos.user;

namespace FlexChat.Services.services
{
    public class UserService : IUserService
    {

        private readonly IAppLogger _logger;
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork, IAppLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        public async Task<PagedResultDto<UserDto>> GetUsersAsync(string? search, int page, int pageSize)
        {
            try
            {
                var query = _unitOfWork.Repository<User>().Query();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.Trim();

                    query = query.Where(u =>
                        EF.Functions.Like(u.Username, $"%{search}%") 
                        ||
                        EF.Functions.Like(u.FullName, $"%{search}%")
                    );
                }

                var total = await query.CountAsync();

                var users = await query
                    .OrderBy(u => u.Username)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        FullName = u.FullName,
                        AvatarUrl = u.AvatarUrl,
                        Bio = u.Bio,
                        StatusMessage = u.StatusMessage
                    })
                    .ToListAsync();

                return new PagedResultDto<UserDto>
                {
                    Items = users,
                    TotalCount = total,
                    Page = page,
                    PageSize = pageSize
                };
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in UserService.GetUsersAsync");
                throw new BusinessException("Failed to fetch users");
            }
        }

        public async Task<UserProfileDto> GetUserProfileAsync(int id)
        {
            try
            {
                var data = await _unitOfWork
                    .Repository<User>()
                    .Query()
                    .Where(x => x.Id == id)
                    .Select(x => new UserProfileDto
                    {
                        Username = x.Username,
                        Email= x.Email,
                        AvatarUrl = x.AvatarUrl,
                        Bio = x.Bio,
                        FullName = x.FullName,
                        StatusMessage = x.StatusMessage,
                        CreatedAt = DateOnly.FromDateTime(x.CreatedAt)
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    throw new NotFoundException("User", id);

                return data;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in UserService.GetUserProfileAsync");
                throw new BusinessException("Failed to fetch user profile");
            }
        }

        public async Task<UserProfileDto> UpdateUserProfile(int id, UserProfileUpateDto userProfile)
        {
            var userRepo = _unitOfWork.Repository<User>();

            var user = await userRepo.GetByIdAsync(id);

            if (user == null)
            {
                throw new NotFoundException("User",id);
            }

            user.FullName = userProfile.FullName;
            user.Bio = userProfile.Bio;
            //user.AvatarUrl = userProfile.AvatarUrl; // Uncomment later once file handling is in place
            user.StatusMessage = userProfile.StatusMessage;

            userRepo.Update(user);

            await _unitOfWork.SaveChangesAsync();

            return new UserProfileDto() { 
                Username = user.Username,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                CreatedAt = DateOnly.FromDateTime(user.CreatedAt),
                Email = user.Email,
                FullName = user.FullName,
                StatusMessage = user.StatusMessage
            };
        }
    }
}
