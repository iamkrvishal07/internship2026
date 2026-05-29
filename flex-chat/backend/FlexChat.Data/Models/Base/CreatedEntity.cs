namespace FlexChat.Data.Models.Base
{

    public abstract class CreatedEntity<TKey> : BaseEntity<TKey> where TKey : struct
    {
        public DateTime CreatedAt { get; set; }
    }
}
