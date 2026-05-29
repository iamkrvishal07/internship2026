namespace FlexChat.Data.Models.Base
{
    public interface ISoftDeletable
    {
        bool IsDeleted { get; set; }
    }
}
