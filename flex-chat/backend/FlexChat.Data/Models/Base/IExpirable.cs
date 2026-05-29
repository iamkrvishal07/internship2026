namespace FlexChat.Data.Models.Base
{
  
    public interface IExpirable
    {
        DateTime ExpiresAt { get; set; }
        bool IsUsed { get; set; }
    }
}
