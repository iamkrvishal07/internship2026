namespace FlexChat.Services.dtos
{
    public class VerifyOtpDto
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string Otp { get; set; }
        public string Password { get; set; }
    }
}
