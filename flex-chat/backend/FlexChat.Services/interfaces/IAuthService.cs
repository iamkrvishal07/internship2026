using FlexChat.Services.dtos;


namespace FlexChat.Services.interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto request);
        Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken);
        Task RevokeTokenAsync(string username);
        Task RegisterAsync(string email);
        Task<AuthResponseDto?> VerifyOtpAndRegisterAsync(VerifyOtpDto request);
        Task<bool> IsUsernameAvailableAsync(string username);
        Task<bool> IsEmailAvailableAsync(string email);


    }
}
