namespace FlexChat.Data.Models.Base
{
    public abstract class BaseEntity<TKey> where TKey : struct
    {
        public TKey Id { get; set; }
    }
}
