using FlexChat.Services.dtos.message;
using FlexChat.Services.interfaces;
using Infrastructure.Exceptions;
using Infrastructure.Logger;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FlexChatApi.Hubs
{
    public class ChatHub : Hub<IChatHubClient>
    {
        private readonly IChatService _chatService;
        private readonly IChatNotifier _chatNotifier;

        private readonly IAppLogger _logger;

        private static readonly HashSet<int> _onlineUsers = new();
        private static readonly Lock _lock = new();

        public ChatHub(IChatService chatService, IChatNotifier chatNotifier, IAppLogger logger)
        {
            _chatService = chatService;
            _chatNotifier = chatNotifier;
            _logger = logger;
        }
        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = GetCallerId();

                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));

                var chats = await _chatService.GetUserChatIdsAsync(userId);
                foreach (var chatId in chats)
                    await Groups.AddToGroupAsync(Context.ConnectionId, ChatGroup(chatId));

                bool firstConnection;
                lock (_lock) firstConnection = _onlineUsers.Add(userId);

                if (firstConnection)
                {
                    await Clients.All.UserPresenceChanged(userId, isOnline: true);

                    var receipts = await _chatService.MarkAllUndeliveredAsync(userId);
                    foreach (var receipt in receipts)
                    {
                        await Clients.Group(UserGroup(receipt.SenderId))
                            .ReceiptUpdated(receipt);
                    }
                }

                _logger.Info($"User {userId} connected [{Context.ConnectionId}]");
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.OnConnectedAsync");
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = GetCallerId();

                bool lastConnection;
                lock (_lock) lastConnection = _onlineUsers.Remove(userId);

                if (lastConnection)
                    await Clients.All.UserPresenceChanged(userId, isOnline: false);

                if (exception is not null)
                    _logger.Warning(exception, $"User {userId} disconnected with error.");
                else
                    _logger.Info($"User {userId} disconnected [{Context.ConnectionId}]");

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.OnDisconnectedAsync");
                throw;
            }
        }

        public async Task JoinChat(int chatId)
        {
            try
            {
                var userId = GetCallerId();

                if (!await _chatService.IsMemberAsync(userId, chatId))
                    throw new HubException("You are not a member of this chat.");

                await Groups.AddToGroupAsync(Context.ConnectionId, ChatGroup(chatId));
            }
            catch (HubException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.JoinChat");
                throw new HubException("Failed to join chat.");
            }
        }

        public async Task LeaveChat(int chatId)
        {

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ChatGroup(chatId));
        }
        public async Task SendTyping(int chatId, string fullName, bool isTyping)
        {
            try
            {
                var userId = GetCallerId();

                if (!await _chatService.IsMemberAsync(userId, chatId))
                    throw new HubException("You are not a member of this chat.");

                await Clients.OthersInGroup(ChatGroup(chatId))
                    .UserTyping(new TypingEventDto
                    {
                        ChatId = chatId,
                        UserId = userId,
                        FullName = fullName,
                        IsTyping = isTyping,
                    });
            }
            catch (HubException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.SendTyping");
                throw new HubException("Failed to send typing event.");
            }
        }

        public async Task SendMessage(int chatId, SendMessageDto request)
        {
            try
            {
                var userId = GetCallerId();

                var message = await _chatService.SendMessageAsync(userId, chatId, request);

                await Clients.Group(UserGroup(userId))
                    .MessageSaved(message);

                await _chatNotifier.NotifyGroupAsync(ChatGroup(chatId), "MessageReceived", message);
            }
            catch (HubException) { throw; }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.SendMessage");
                throw new HubException("Failed to send message.");
            }
        }
        public async Task AcknowledgeDelivery(long messageId)
        {
            try
            {
                var userId = GetCallerId();

                var receipt = await _chatService.MarkDeliveredAsync(userId, messageId);

                if (receipt is null) return;

                await Clients.Group(UserGroup(receipt.SenderId))
                    .ReceiptUpdated(receipt);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.AcknowledgeDelivery");
                throw new HubException("Failed to acknowledge delivery.");
            }
        }
        public async Task MarkRead(int chatId, MarkReadDto request)
        {

            try
            {
                var userId = GetCallerId();

                var receipts = await _chatService
                    .MarkMessagesReadAsync(
                        userId,
                        chatId,
                        request
                    );

                foreach (var receipt in receipts)
                {
                    await Clients.Group(UserGroup(receipt.SenderId))
                 .ReceiptUpdated(receipt);
                }
            }
            catch (Exception ex)
            {
                _logger.Error(
                    ex,
                    "Error in ChatHub.MarkRead"
                );

                throw new HubException(
                    "Failed to mark as read."
                );
            }
        }

        public async Task EditMessage(long messageId, string newContent)
        {
            try
            {
                var userId = GetCallerId();

                var editDto =
                    new EditMessageDto
                    {
                        Content = newContent
                    };

                var editedEvent =
                    await _chatService
                        .EditMessageAsync(
                            userId,
                            messageId,
                            editDto
                        );

                await Clients.Group(
                    ChatGroup(editedEvent.ChatId)
                ).MessageEdited(
                    editedEvent
                );
            }
            catch (HubException)
            {
                throw;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(
                    ex,
                    "Error in ChatHub.EditMessage"
                );

                throw new HubException(
                    "Failed to edit message."
                );
            }
        }


        public async Task DeleteMessage(long messageId)
        {
            try
            {
                var userId = GetCallerId();

                var deletedEvent =
                    await _chatService
                        .DeleteMessageAsync(
                            userId,
                            messageId
                        );

                await Clients.Group(
                    ChatGroup(deletedEvent.ChatId)
                ).MessageDeleted(deletedEvent);
            }
            catch (HubException)
            {
                throw;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(
                    ex,
                    "Error in ChatHub.DeleteMessage"
                );

                throw new HubException(
                    "Failed to delete message."
                );
            }
        }

        public async Task ToggleReaction(long messageId, string emojiCode)
        {
            try
            {
                var userId = GetCallerId();
                var (removed, added) = await _chatService.ToggleReactionAsync(
                    userId, messageId, emojiCode);

                if (removed is not null)
                    await Clients.Group(ChatGroup(removed.ChatId))
                        .ReactionRemoved(removed);

                if (added is not null)
                    await Clients.Group(ChatGroup(added.ChatId))
                        .ReactionAdded(added);
            }
            catch (HubException) { throw; }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.ToggleReaction");
                throw new HubException("Failed to toggle reaction.");
            }
        }

        public async Task NotifyNewChat(int chatId, int targetUserId)
        {
            try
            {
                var callerId = GetCallerId();

                if (!await _chatService.IsMemberAsync(callerId, chatId))
                    throw new HubException("Not a member of this chat.");

                await Groups.AddToGroupAsync(Context.ConnectionId, ChatGroup(chatId));

                var chat = await _chatService.GetChatByIdAsync(callerId, chatId);

                await Clients.Group(UserGroup(targetUserId)).ChatCreated(chat);
            }
            catch (HubException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatHub.NotifyNewChat");
                throw new HubException("Failed to notify new chat.");
            }
        }
        public Task<List<int>> GetOnlineUsers()
        {
            lock (_lock)
                return Task.FromResult(_onlineUsers.ToList());
        }
        private int GetCallerId()
        {

            var sub = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? Context.User?.FindFirstValue("sub");

            if (string.IsNullOrEmpty(sub) || !int.TryParse(sub, out var userId))
                throw new HubException("Unauthenticated.");

            return userId;
        }

        private static string ChatGroup(int chatId) => $"chat:{chatId}";
        private static string UserGroup(int userId) => $"user:{userId}";
    }
}
