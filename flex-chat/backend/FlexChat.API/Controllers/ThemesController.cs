using FlexChat.Services.dtos.chatPreference;
using FlexChat.Services.interfaces;
using Infrastructure.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlexChat.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ThemesController : Controller
    {
        private readonly IThemeService _themeService;
        private readonly IThemePropertyTypeCacheService _themePropertyTypeCacheService;

        private int CallerId
        {
            get
            {
                var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(sub))
                    throw new UnauthorizedAccessException("User ID not found in claims");

                if (!int.TryParse(sub, out var CallerId))
                    throw new InvalidOperationException("Invalid user ID format");

                return CallerId;
            }
        }

        public ThemesController(IThemeService themeService, IThemePropertyTypeCacheService themePropertyTypeCacheService)
        {
            _themeService = themeService;
            _themePropertyTypeCacheService = themePropertyTypeCacheService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTheme([FromBody] CreateThemeDto dto)
        {
            var theme = await _themeService.CreateThemeAsync(CallerId, dto);
            return CreatedAtAction(nameof(GetTheme), new { id = theme.Id }, theme);
        }

        [HttpGet("{id}")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<IActionResult> GetTheme(int id)
        {
            var theme = await _themeService.GetThemeAsync(id, CallerId);
            return Ok(theme);
        }

        [HttpGet("by-name/{name}")]
        public async Task<IActionResult> GetThemeByName(string name, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var theme = await _themeService.GetThemeByNameAsync(CallerId, name.Trim(), page, pageSize);
            return Ok(theme);
        }

        [HttpGet("default")]
        public async Task<IActionResult> GetDefaultTheme()
        {
            var theme = await _themeService.GetDefaultThemeAsync(CallerId);
            return Ok(theme);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTheme(int id, [FromBody] UpdateThemeDto dto)
        {
            var theme = await _themeService.UpdateThemeAsync(CallerId,id, dto);
            return Ok(theme);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTheme(int id)
        {
            await _themeService.DeleteThemeAsync(id, CallerId);
            return NoContent();
        }

        [HttpPut("{themeId}/set-as-default")]
        public async Task<IActionResult> SetThemeAsDefault(int themeId)
        {
            var result = await _themeService.SetThemeAsDefaultAsync(CallerId, themeId);
            return Ok(result);
        }

        [HttpGet("theme-property-types")]
        public async Task<IActionResult> GetThemePropertyTypes()
        {
            var propertyTypes = await _themePropertyTypeCacheService.GetAllPropertyTypesAsync();
            return Ok(propertyTypes);
        }

        [HttpGet("property-type-validation-constants")]
        public IActionResult GetPropertyTypeConstants()
        {
            var constants = typeof(UiElementPropertyTypes)
                .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static)
                .Where(f => f.IsLiteral && !f.IsInitOnly)
                .Select(f => f.GetValue(null))
                .ToList();

            return Ok(constants);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserThemes([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var themes = await _themeService.GetUserThemesAsync(CallerId, page, pageSize);
            return Ok(themes);
        }
    }
}