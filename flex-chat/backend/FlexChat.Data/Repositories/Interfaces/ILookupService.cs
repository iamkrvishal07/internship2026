namespace FlexChat.DAL.Repositories.Interfaces
{
    public interface ILookupService
    {
        Task<int> GetChatTypeIdAsync(string code);
        Task<string> GetChatTypeCodeAsync(int id);

        Task<int> GetRoleTypeIdAsync(string code);
        Task<string> GetRoleTypeCodeAsync(int id);

        Task<int> GetContentTypeIdAsync(string code);
        Task<string> GetContentTypeCodeAsync(int id);

        Task<int> GetAttachmentTypeIdAsync(string code);
        Task<string> GetAttachmentTypeCodeAsync(int id);
    }
}