using FlexChat.Services.dtos.chat;
using FlexChat.Services.dtos.message;

namespace FlexChatApi.Hubs
{
    public interface IChatHubClient
    {
        Task MessageReceived(MessageDto message);
        Task MessageSaved(MessageDto message);
        Task EditMessage(long messageId, string newContent);
        Task MessageDeleted(MessageEditEventDto payload);
        Task MessageEdited(MessageEditedEventDto payload);
        Task MessageUndone(MessageUndoneEventDto payload);
        Task ReceiptUpdated(ReceiptUpdatedEventDto payload);
        Task ReactionAdded(ReactionAddedEventDto payload);
        Task ReactionRemoved(ReactionRemovedEventDto payload);
        Task ToggleReaction(long messageId, string emojiCode);

        Task UserTyping(TypingEventDto payload);
        Task UserPresenceChanged(int userId, bool isOnline);
        Task ChatCreated(ChatSummaryDto chat);
        Task ChatUpdated(ChatSummaryDto chat);
        Task NotifyNewChat(int chatId, int targetUserId);
        Task<List<int>> GetOnlineUsers();
    }
}