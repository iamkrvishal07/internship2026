namespace FlexChat.Services.dtos
{
    public class AuthResponseDto
    {

        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime AccessTokenExpiry { get; set; }
    }
}

