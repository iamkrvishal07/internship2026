using FlexChat.Services.dtos;
using FlexChat.Services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlexChatApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AccountController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AccountController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var result = await _authService.LoginAsync(request);

            if (result == null)
                return Unauthorized();

            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                accessToken = result.AccessToken,
                accessTokenExpiry = result.AccessTokenExpiry
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized();

            var result = await _authService.RefreshTokenAsync(refreshToken);

            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                accessToken = result.AccessToken,
                accessTokenExpiry = result.AccessTokenExpiry
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {

            await _authService.RegisterAsync(request.Email);
            return Ok(new { message = "OTP sent successfully" });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
        {
            var result = await _authService.VerifyOtpAndRegisterAsync(request);
            Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                accessToken = result.AccessToken,
                accessTokenExpiry = result.AccessTokenExpiry
            });
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var username = User.Identity?.Name;

            if (!string.IsNullOrEmpty(username))
            {
                await _authService.RevokeTokenAsync(username);
            }

            Response.Cookies.Delete("refreshToken");

            return Ok("Logged out successfully");
        }

        [HttpGet("check-username")]
        public async Task<IActionResult> CheckUsername([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(new { message = "Username is required" });

            var isAvailable = await _authService.IsUsernameAvailableAsync(username);
            return Ok(new { isAvailable });
        }

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Email is required" });

            var isAvailable = await _authService.IsEmailAvailableAsync(email);
            return Ok(new { isAvailable });
        }
    }
}
