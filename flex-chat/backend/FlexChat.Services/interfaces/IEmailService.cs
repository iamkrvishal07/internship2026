namespace FlexChat.Services.interfaces
{
    public interface IEmailService
    {
        Task SendOtpAsync(string toEmail, string otp);
    }
}
