namespace FlexChat.Data.Models.Base
{

    public abstract class AuditableEntity<TKey> : CreatedEntity<TKey> where TKey : struct
    {
        public DateTime? UpdatedAt { get; set; }
    }
}
