using FlexChat.Data.Models.Base;

public class UserOtp : CreatedEntity<int>, IExpirable
{
    public string Email { get; set; }
    public string OtpHash { get; set; }

    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}