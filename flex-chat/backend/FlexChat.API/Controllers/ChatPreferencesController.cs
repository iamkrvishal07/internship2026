using FlexChat.Services.dtos.chatPreference;
using FlexChat.Services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlexChat.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class ChatPreferencesController : ControllerBase
    {
        private readonly IThemeService _themeService;

        public ChatPreferencesController(IThemeService themeService)
        {
            _themeService = themeService;
        }

        private int CallerId
        {
            get
            {
                return 1;
                var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(sub))
                    throw new UnauthorizedAccessException("User ID not found in claims");

                if (!int.TryParse(sub, out var callerId))
                    throw new InvalidOperationException("Invalid user ID format");

                return callerId;
            }
        }

        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatPreference(int chatId)
        {
            var preference = await _themeService.GetChatPreferenceAsync(CallerId, chatId);
            return Ok(preference);
        }

        [HttpPut("{chatId}/theme/{themeId}")]
        public async Task<IActionResult> ApplyThemeToChat(int chatId, int themeId)
        {
            var preference = await _themeService.ApplyThemeToChat(CallerId, chatId, themeId);
            return Ok(preference);
        }
    }
}