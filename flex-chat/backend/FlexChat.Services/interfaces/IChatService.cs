using FlexChat.Services.dtos.chat;
using FlexChat.Services.dtos.message;

namespace FlexChat.Services.interfaces
{
    public interface IChatService
    {
        Task<List<ChatSummaryDto>> GetUserChatsAsync(int callerId);

        Task<ChatSummaryDto> GetOrCreateDirectChatAsync(int callerId, CreateDirectChatDto request);

        Task<ChatSummaryDto> CreateGroupChatAsync(int callerId, CreateGroupChatDto request);

        Task<ChatSummaryDto> UpdateGroupChatAsync(int callerId, int chatId, UpdateGroupChatDto request);
        Task<ChatSummaryDto> GetChatByIdAsync(int callerId, int chatId);

        //Message CRUD 
        Task<MessageDto> SendMessageAsync(int callerId, int chatId, SendMessageDto request);

        Task<PagedMessagesDto> GetMessagesAsync(int callerId, int chatId, long? beforeId, int pageSize = 50);

        Task<MessageEditedEventDto> EditMessageAsync(int callerId, long messageId, EditMessageDto request);
        Task<MessageEditEventDto> DeleteMessageAsync(int callerId, long messageId);

        Task UndoMessageAsync(int callerId, long messageId);

        Task<List<ReceiptUpdatedEventDto>> MarkMessagesReadAsync(int callerId, int chatId, MarkReadDto request);

        Task<ReceiptUpdatedEventDto?> MarkDeliveredAsync(int callerId, long messageId);
        Task AddMembersAsync(int callerId, int chatId, AddMembersDto request);

        Task RemoveMemberAsync(int callerId, int chatId, int targetUserId);

        Task UpdateMemberRoleAsync(int callerId, int chatId, int targetUserId, UpdateMemberRoleDto request);

        Task<bool> IsMemberAsync(int callerId, int chatId);

        Task<string?> GetMemberRoleAsync(int callerId, int chatId);

        Task<List<int>> GetUserChatIdsAsync(int userId);

        Task<(ReactionRemovedEventDto? Removed, ReactionAddedEventDto? Added)> ToggleReactionAsync(int callerId, long messageId, string emojiCode);

        Task<List<ReceiptUpdatedEventDto>> MarkAllUndeliveredAsync(int userId);
    }
}
