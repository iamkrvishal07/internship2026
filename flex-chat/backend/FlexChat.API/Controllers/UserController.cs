using FlexChat.Services.dtos.user;
using FlexChat.Services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FlexChatApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? searchTerm, int page = 1, int pageSize = 10)
        {
            var result = await _userService.GetUsersAsync(searchTerm, page, pageSize);
            return Ok(result);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var data = await _userService.GetUserProfileAsync(Convert.ToInt32(userId));

            return Ok(data);
        }

        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UserProfileUpateDto userProfile)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();
            
            var updatedUser = await _userService.UpdateUserProfile(Convert.ToInt32(userId), userProfile);

            return Ok(updatedUser);
        }
    }
}
