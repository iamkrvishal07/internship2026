using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Constants;
using FlexChat.Data.Models;
using FlexChat.Services.dtos.chat;
using FlexChat.Services.dtos.message;
using FlexChat.Services.Extensions;
using FlexChat.Services.interfaces;
using Infrastructure.Exceptions;
using Infrastructure.Logger;
using Microsoft.EntityFrameworkCore;

namespace FlexChat.Services.services
{
    public class ChatService : IChatService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotifier _notifier;
        private readonly IAppLogger _logger;
        private readonly ILookupService _lookup;

        private static readonly TimeSpan UndoWindow = TimeSpan.FromMinutes(5);

        public ChatService(
            IUnitOfWork unitOfWork,
            IChatNotifier notifier,
            IAppLogger logger,
            ILookupService lookup)
        {
            _unitOfWork = unitOfWork;
            _notifier = notifier;
            _logger = logger;
            _lookup = lookup;
        }

        public async Task<List<ChatSummaryDto>> GetUserChatsAsync(int callerId)
        {
            try
            {
                var memberships = await _unitOfWork.Repository<ChatMember>()
                    .Query()
                    .AsTracking()
                    .Where(cm => cm.UserId == callerId && cm.LeftAt == null)
                    .Include(cm => cm.Chat)
                        .ThenInclude(c => c.ChatType)
                    .Include(cm => cm.Chat)
                        .ThenInclude(c => c.LastMessage)
                            .ThenInclude(m => m!.Sender)
                    .Include(cm => cm.Chat)
                        .ThenInclude(c => c.LastMessage)
                            .ThenInclude(m => m!.ContentType)
                    .Include(cm => cm.Chat)
                        .ThenInclude(c => c.Members.Where(m => m.LeftAt == null))
                            .ThenInclude(m => m.User)
                    .Include(cm => cm.Chat)
                        .ThenInclude(c => c.Members.Where(m => m.LeftAt == null))
                            .ThenInclude(m => m.Role)
                    .OrderByDescending(cm => cm.Chat.UpdatedAt ?? cm.Chat.CreatedAt)
                    .ToListAsync();

                var chatIds = memberships.Select(m => m.ChatId).ToList();

                var unreadCounts = await _unitOfWork.Repository<MessageReceipt>()
                   .Query()
                   .Where(r => r.UserId == callerId
                            && r.ReadAt == null
                            && chatIds.Contains(r.Message.ChatId))
                   .GroupBy(r => r.Message.ChatId)
                   .Select(g => new { ChatId = g.Key, Count = g.Count() })
                   .ToDictionaryAsync(x => x.ChatId, x => x.Count);

                var result = new List<ChatSummaryDto>();
                foreach (var cm in memberships)
                {
                    var summary = await MapToChatSummaryAsync(
                        cm.Chat,
                        unreadCounts.GetValueOrDefault(cm.ChatId, 0));
                    result.Add(summary);
                }

                return result;
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.GetUserChatsAsync");
                throw new BusinessException("Failed to retrieve chats.");
            }
        }

        public async Task<List<int>> GetUserChatIdsAsync(int userId)
        {
            try
            {
                return await _unitOfWork.Repository<ChatMember>()
                    .Query()
                    .Where(cm => cm.UserId == userId && cm.LeftAt == null)
                    .Select(cm => cm.ChatId)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.GetUserChatIdsAsync");
                throw new BusinessException("Failed to retrieve chat ids.");
            }
        }

        public async Task<ChatSummaryDto> GetChatByIdAsync(int callerId, int chatId)
        {
            try
            {
                await EnsureMemberAsync(callerId, chatId);

                var chat = await _unitOfWork.Repository<Chat>()
                    .Query()
                    .Where(c => c.Id == chatId)
                    .Include(c => c.ChatType)
                    .Include(c => c.Members.Where(m => m.LeftAt == null))
                        .ThenInclude(m => m.User)
                    .Include(c => c.Members.Where(m => m.LeftAt == null))
                        .ThenInclude(m => m.Role)
                    .Include(c => c.LastMessage)
                        .ThenInclude(m => m!.Sender)
                    .Include(c => c.LastMessage)
                        .ThenInclude(m => m!.ContentType)
                    .FirstOrDefaultAsync()
                    ?? throw new NotFoundException("Chat", chatId);

                return await MapToChatSummaryAsync(chat, 0);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.GetChatByIdAsync");
                throw new BusinessException("Failed to retrieve chat.");
            }
        }

        public async Task<ChatSummaryDto> GetOrCreateDirectChatAsync(int callerId, CreateDirectChatDto request)
        {
            try
            {
                if (callerId == request.TargetUserId)
                    throw new BusinessException("Cannot create a chat with yourself.");

                var targetExists = await _unitOfWork.Repository<User>()
                    .Query()
                    .AnyAsync(u => u.Id == request.TargetUserId && !u.IsDeleted);

                if (!targetExists)
                    throw new NotFoundException("User", request.TargetUserId);

                var directTypeId = await _lookup.GetChatTypeIdAsync(LookupKeys.ChatType.Direct);

                var existing = await _unitOfWork.Repository<Chat>()
                    .Query()
                    .Where(c => c.ChatTypeId == directTypeId
                             && c.Members.Any(m => m.UserId == callerId && m.LeftAt == null)
                             && c.Members.Any(m => m.UserId == request.TargetUserId && m.LeftAt == null))
                    .Include(c => c.ChatType)
                    .Include(c => c.Members.Where(m => m.LeftAt == null))
                        .ThenInclude(m => m.User)
                    .Include(c => c.Members.Where(m => m.LeftAt == null))
                        .ThenInclude(m => m.Role)
                    .Include(c => c.LastMessage)
                        .ThenInclude(m => m!.Sender)
                    .Include(c => c.LastMessage)
                        .ThenInclude(m => m!.ContentType)
                    .FirstOrDefaultAsync();

                if (existing is not null)
                    return await MapToChatSummaryAsync(existing, 0);

                var memberRoleId = await _lookup.GetRoleTypeIdAsync(LookupKeys.RoleType.Member);

                Chat newChat = null!;

                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    newChat = new Chat
                    {
                        ChatTypeId = directTypeId,
                        Name = string.Empty,
                        ImageUrl = string.Empty,
                        Description = string.Empty,
                        CreatedBy = callerId,
                        CreatedAt = DateTime.UtcNow,
                    };

                    await _unitOfWork.Repository<Chat>().AddAsync(newChat);
                    await _unitOfWork.SaveChangesAsync();

                    await _unitOfWork.Repository<ChatMember>().AddAsync(new ChatMember
                    {
                        ChatId = newChat.Id,
                        UserId = callerId,
                        RoleId = memberRoleId,
                        JoinedAt = DateTime.UtcNow,
                    });

                    await _unitOfWork.Repository<ChatMember>().AddAsync(new ChatMember
                    {
                        ChatId = newChat.Id,
                        UserId = request.TargetUserId,
                        RoleId = memberRoleId,
                        JoinedAt = DateTime.UtcNow,
                    });

                    var defaultThemeCaller = await _unitOfWork.Repository<Theme>()
                        .FirstOrDefaultAsync(t => t.UserId == callerId && t.IsDefault, false);

                    var defaultThemeTarget = await _unitOfWork.Repository<Theme>()
                        .FirstOrDefaultAsync(t => t.UserId == request.TargetUserId && t.IsDefault, false);

                    await _unitOfWork.Repository<UserChatPreference>().AddAsync(new UserChatPreference
                    {
                        ChatId = newChat.Id,
                        UserId = callerId,
                        ThemeId = defaultThemeCaller?.Id,
                        IsMuted = false,
                        IsPinned = false,
                        IsArchived = false,
                        CreatedAt = DateTime.UtcNow,
                    });

                    await _unitOfWork.Repository<UserChatPreference>().AddAsync(new UserChatPreference
                    {
                        ChatId = newChat.Id,
                        UserId = request.TargetUserId,
                        ThemeId = defaultThemeTarget?.Id,
                        IsMuted = false,
                        IsPinned = false,
                        IsArchived = false,
                        CreatedAt = DateTime.UtcNow,
                    });

                    await _unitOfWork.SaveChangesAsync();
                });

                return await GetChatByIdAsync(callerId, newChat.Id);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.GetOrCreateDirectChatAsync");
                throw new BusinessException("Failed to create direct chat.");
            }
        }

        public async Task<ChatSummaryDto> CreateGroupChatAsync(int callerId, CreateGroupChatDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    throw new BusinessException("Group name is required.");

                var allMemberIds = request.MemberIds
                    .Append(callerId)
                    .Distinct()
                    .ToList();

                var groupTypeId = await _lookup.GetChatTypeIdAsync(LookupKeys.ChatType.Group);
                var adminRoleId = await _lookup.GetRoleTypeIdAsync(LookupKeys.RoleType.Admin);
                var memberRoleId = await _lookup.GetRoleTypeIdAsync(LookupKeys.RoleType.Member);

                Chat newChat = null!;

                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    newChat = new Chat
                    {
                        ChatTypeId = groupTypeId,
                        Name = request.Name.Trim(),
                        ImageUrl = request.ImageUrl ?? string.Empty,
                        Description = request.Description.Trim(),
                        CreatedBy = callerId,
                        CreatedAt = DateTime.UtcNow,
                    };

                    await _unitOfWork.Repository<Chat>().AddAsync(newChat);
                    await _unitOfWork.SaveChangesAsync();

                    var chatPreferenceRepo = _unitOfWork.Repository<UserChatPreference>();

                    foreach (var uid in allMemberIds)
                    {
                        await _unitOfWork.Repository<ChatMember>().AddAsync(new ChatMember
                        {
                            ChatId = newChat.Id,
                            UserId = uid,
                            InvitedBy = uid == callerId ? null : callerId,
                            RoleId = uid == callerId ? adminRoleId : memberRoleId,
                            JoinedAt = DateTime.UtcNow,
                        });

                        var defaultThemeTarget = await _unitOfWork.Repository<Theme>()
                        .FirstOrDefaultAsync(t => t.UserId == uid && t.IsDefault, false);

                        await chatPreferenceRepo.AddAsync(new UserChatPreference()
                        {
                            ChatId = newChat.Id,
                            UserId = uid,
                            ThemeId = defaultThemeTarget?.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                });

                var summary = await GetChatByIdAsync(callerId, newChat.Id);
                var memberIds = summary.Members.Select(m => m.UserId).ToList();
                await _notifier.NotifyUsersAsync(memberIds, "ChatCreated", summary);

                return summary;
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.CreateGroupChatAsync");
                throw new BusinessException("Failed to create group chat.");
            }
        }

        public async Task<ChatSummaryDto> UpdateGroupChatAsync(int callerId, int chatId, UpdateGroupChatDto request)
        {
            try
            {
                await EnsureAdminAsync(callerId, chatId);

                var groupTypeId = await _lookup.GetChatTypeIdAsync(LookupKeys.ChatType.Group);

                var chat = await _unitOfWork.Repository<Chat>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(c => c.Id == chatId && c.ChatTypeId == groupTypeId)
                    ?? throw new NotFoundException("Chat", chatId);

                if (request.Name is not null) chat.Name = request.Name.Trim();
                if (request.Description is not null) chat.Description = request.Description.Trim();
                if (request.ImageUrl is not null) chat.ImageUrl = request.ImageUrl;

                chat.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<Chat>().Update(chat);
                await _unitOfWork.SaveChangesAsync();

                var summary = await GetChatByIdAsync(callerId, chatId);
                var memberIds = summary.Members.Select(m => m.UserId).ToList();
                await _notifier.NotifyUsersAsync(memberIds, "ChatUpdated", summary);

                return summary;
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.UpdateGroupChatAsync");
                throw new BusinessException("Failed to update group chat.");
            }
        }

        public async Task<MessageDto> SendMessageAsync(int callerId, int chatId, SendMessageDto request)
        {
            try
            {
                await EnsureMemberAsync(callerId, chatId);

                if (string.IsNullOrWhiteSpace(request.Content))
                    throw new BusinessException("Message content cannot be empty.");

                if (request.ParentId.HasValue)
                {
                    var parentExists = await _unitOfWork.Repository<Message>()
                        .Query()
                        .AnyAsync(m => m.Id == request.ParentId
                                    && m.ChatId == chatId
                                    && !m.IsDeleted);

                    if (!parentExists)
                        throw new NotFoundException("Parent message", request.ParentId);
                }

                var contentTypeId = await _lookup.GetContentTypeIdAsync(request.ContentType);

                Message message = null!;

                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    message = new Message
                    {
                        ChatId = chatId,
                        SenderId = callerId,
                        ParentId = request.ParentId,
                        ContentTypeId = contentTypeId,
                        Content = request.Content,
                        IsDeleted = false,
                        IsEdited = false,
                        CreatedAt = DateTime.UtcNow,
                    };

                    await _unitOfWork.Repository<Message>().AddAsync(message);
                    await _unitOfWork.SaveChangesAsync();

                    var chat = await _unitOfWork.Repository<Chat>()
                        .Query(asNoTracking: false)
                        .FirstAsync(c => c.Id == chatId);

                    chat.LastMessageId = message.Id;
                    chat.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.Repository<Chat>().Update(chat);

                    var memberIds = await _unitOfWork.Repository<ChatMember>()
                        .Query()
                        .Where(cm => cm.ChatId == chatId
                                  && cm.UserId != callerId
                                  && cm.LeftAt == null)
                        .Select(cm => cm.UserId)
                        .ToListAsync();

                    foreach (var uid in memberIds)
                    {
                        await _unitOfWork.Repository<MessageReceipt>().AddAsync(new MessageReceipt
                        {
                            MessageId = message.Id,
                            UserId = uid,
                        });
                    }
                });

                return await HydrateMessageAsync(message.Id);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.SendMessageAsync");
                throw new BusinessException("Failed to send message.");
            }
        }

        public async Task<PagedMessagesDto> GetMessagesAsync(int callerId, int chatId, long? beforeId, int pageSize = 50)
        {
            try
            {
                await EnsureMemberAsync(callerId, chatId);

                pageSize = Math.Clamp(pageSize, 1, 100);

                var query = _unitOfWork.Repository<Message>()
                    .Query()
                    .Where(m => m.ChatId == chatId);

                if (beforeId.HasValue)
                    query = query.Where(m => m.Id < beforeId.Value);

                var messages = await query
                    .OrderByDescending(m => m.Id)
                    .Take(pageSize + 1)
                    .Include(m => m.Sender)
                    .Include(m => m.ContentType)
                    .Include(m => m.Attachments)
                        .ThenInclude(a => a.AttachmentType)
                    .Include(m => m.Reactions)
                    .Include(m => m.Receipts)
                    .Include(m => m.Parent)
                        .ThenInclude(p => p!.Sender)
                    .Include(m => m.Parent)
                        .ThenInclude(p => p!.ContentType)
                    .ToListAsync();

                var hasMore = messages.Count > pageSize;
                if (hasMore) messages = messages.Take(pageSize).ToList();

                var mappedMessages = new List<MessageDto>();
                foreach (var message in messages.OrderBy(m => m.Id))
                {
                    var dto = await MapToMessageDtoAsync(message);
                    mappedMessages.Add(dto);
                }

                return new PagedMessagesDto
                {
                    Messages = mappedMessages,
                    HasMore = hasMore,
                    NextCursor = hasMore ? messages.Min(m => m.Id) : null,
                };
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.GetMessagesAsync");
                throw new BusinessException("Failed to retrieve messages.");
            }
        }

        public async Task<MessageEditedEventDto> EditMessageAsync(int callerId, long messageId, EditMessageDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Content))
                    throw new BusinessException("Edited content cannot be empty.");

                var message = await _unitOfWork.Repository<Message>()
                    .Query(asNoTracking: false)
                    .Include(m => m.Sender)
                    .FirstOrDefaultAsync(m => m.Id == messageId)
                    ?? throw new NotFoundException("Message", messageId);

                if (message.IsDeleted)
                    throw new BusinessException("Cannot edit deleted message.");

                if (message.SenderId != callerId)
                    throw new BusinessException("You can only edit your own messages.");

                message.Content = request.Content.Trim();
                message.IsEdited = true;
                message.EditedAt = DateTime.UtcNow;
                message.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Repository<Message>().Update(message);
                await _unitOfWork.SaveChangesAsync();

                return new MessageEditedEventDto
                {
                    MessageId = messageId,
                    ChatId = message.ChatId,
                    NewContent = message.Content,
                    EditedAt = message.EditedAt!.Value,
                };
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error editing message");
                throw new BusinessException("Failed to edit message.");
            }
        }

        public async Task<MessageEditEventDto> DeleteMessageAsync(int callerId, long messageId)
        {
            try
            {
                var message = await _unitOfWork.Repository<Message>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(m => m.Id == messageId)
                    ?? throw new NotFoundException("Message", messageId);

                if (message.SenderId != callerId)
                    throw new BusinessException("Cannot delete this message.");

                message.IsDeleted = true;
                _unitOfWork.Repository<Message>().Update(message);
                await _unitOfWork.SaveChangesAsync();

                return new MessageEditEventDto
                {
                    MessageId = messageId,
                    ChatId = message.ChatId,
                };
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error deleting message");
                throw new BusinessException("Failed to delete message.");
            }
        }

        public async Task UndoMessageAsync(int callerId, long messageId)
        {
            try
            {
                var message = await _unitOfWork.Repository<Message>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(m => m.Id == messageId)
                    ?? throw new NotFoundException("Message", messageId);

                if (message.SenderId != callerId)
                    throw new BusinessException("You can only undo your own messages.");

                if (message.IsDeleted)
                    throw new BusinessException("Cannot undo an already deleted message.");

                if (DateTime.UtcNow - message.CreatedAt > UndoWindow)
                    throw new BusinessException(
                        $"Undo window expired. Messages can only be undone within {UndoWindow.TotalMinutes} minutes.");

                var chatId = message.ChatId;

                _unitOfWork.Repository<Message>().Delete(message);
                await _unitOfWork.SaveChangesAsync();

                await _notifier.NotifyGroupAsync(ChatGroup(chatId), "MessageUndone",
                    new MessageUndoneEventDto { MessageId = messageId, ChatId = chatId });
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.UndoMessageAsync");
                throw new BusinessException("Failed to undo message.");
            }
        }

        public async Task<List<ReceiptUpdatedEventDto>> MarkMessagesReadAsync(int callerId, int chatId, MarkReadDto request)
        {
            try
            {
                await EnsureMemberAsync(callerId, chatId);

                var receipts = await _unitOfWork.Repository<MessageReceipt>()
                    .Query(asNoTracking: false)
                    .Where(r => r.UserId == callerId
                             && r.Message.ChatId == chatId
                             && r.Message.Id <= request.LastReadMessageId
                             && r.ReadAt == null)
                    .Include(r => r.Message)
                    .ToListAsync();

                if (receipts.Count == 0) return new();

                var now = DateTime.UtcNow;

                foreach (var r in receipts)
                {
                    r.ReadAt = now;
                    r.DeliveredAt ??= now;
                    _unitOfWork.Repository<MessageReceipt>().Update(r);
                }

                await _unitOfWork.SaveChangesAsync();

                return receipts.Select(r => new ReceiptUpdatedEventDto
                {
                    MessageId = r.MessageId,
                    ChatId = chatId,
                    UserId = callerId,
                    SenderId = r.Message.SenderId,
                    DeliveredAt = r.DeliveredAt,
                    ReadAt = r.ReadAt,
                }).ToList();
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.MarkMessagesReadAsync");
                throw new BusinessException("Failed to mark messages as read.");
            }
        }


        public async Task<List<ReceiptUpdatedEventDto>> MarkAllUndeliveredAsync(int userId)
        {
            var receipts = await _unitOfWork.Repository<MessageReceipt>()
                .Query(asNoTracking: false)
                .Include(r => r.Message)
                .Where(r =>
                    r.UserId == userId &&
                    r.DeliveredAt == null)
                .ToListAsync();

            if (!receipts.Any()) return new();

            var now = DateTime.UtcNow;
            foreach (var r in receipts)
            {
                r.DeliveredAt = now;
                _unitOfWork.Repository<MessageReceipt>().Update(r);
            }

            await _unitOfWork.SaveChangesAsync();

            return receipts.Select(r => new ReceiptUpdatedEventDto
            {
                MessageId = r.MessageId,
                ChatId = r.Message.ChatId,
                UserId = userId,
                SenderId = r.Message.SenderId,
                DeliveredAt = r.DeliveredAt,
            }).ToList();
        }

        public async Task<ReceiptUpdatedEventDto?> MarkDeliveredAsync(int callerId, long messageId)
        {
            try
            {
                var receipt = await _unitOfWork.Repository<MessageReceipt>()
                    .Query(asNoTracking: false)
                    .Include(r => r.Message)
                    .FirstOrDefaultAsync(r => r.MessageId == messageId && r.UserId == callerId);

                if (receipt is null || receipt.DeliveredAt.HasValue)
                    return null;

                receipt.DeliveredAt = DateTime.UtcNow;
                _unitOfWork.Repository<MessageReceipt>().Update(receipt);
                await _unitOfWork.SaveChangesAsync();

                return new ReceiptUpdatedEventDto
                {
                    MessageId = messageId,
                    ChatId = receipt.Message.ChatId,
                    UserId = callerId,
                    SenderId = receipt.Message.SenderId,
                    DeliveredAt = receipt.DeliveredAt,
                };
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.MarkDeliveredAsync");
                throw new BusinessException("Failed to mark message as delivered.");
            }
        }

        public async Task AddMembersAsync(int callerId, int chatId, AddMembersDto request)
        {
            try
            {
                await EnsureAdminAsync(callerId, chatId);
                await EnsureGroupChatAsync(chatId);

                var memberRoleId = await _lookup.GetRoleTypeIdAsync(LookupKeys.RoleType.Member);

                var existing = await _unitOfWork.Repository<ChatMember>()
                    .Query(asNoTracking: false)
                    .Where(cm => cm.ChatId == chatId && request.UserIds.Contains(cm.UserId))
                    .ToListAsync();

                var alreadyActive = existing
                    .Where(cm => cm.LeftAt == null)
                    .Select(cm => cm.UserId)
                    .ToHashSet();

                var toAdd = request.UserIds.Where(uid => !alreadyActive.Contains(uid)).ToList();

                if (toAdd.Count == 0)
                    throw new BusinessException("All specified users are already members.");

                foreach (var uid in toAdd)
                {
                    var prev = existing.FirstOrDefault(cm => cm.UserId == uid);
                    if (prev is not null)
                    {
                        prev.LeftAt = null;
                        prev.JoinedAt = DateTime.UtcNow;
                        prev.InvitedBy = callerId;
                        _unitOfWork.Repository<ChatMember>().Update(prev);
                    }
                    else
                    {
                        await _unitOfWork.Repository<ChatMember>().AddAsync(new ChatMember
                        {
                            ChatId = chatId,
                            UserId = uid,
                            InvitedBy = callerId,
                            RoleId = memberRoleId,
                            JoinedAt = DateTime.UtcNow,
                        });
                    }
                }

                await _unitOfWork.SaveChangesAsync();

                var summary = await GetChatByIdAsync(callerId, chatId);
                await _notifier.NotifyUsersAsync(toAdd, "ChatCreated", summary);
                await _notifier.NotifyGroupAsync(ChatGroup(chatId), "ChatUpdated", summary);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.AddMembersAsync");
                throw new BusinessException("Failed to add members.");
            }
        }

        public async Task RemoveMemberAsync(int callerId, int chatId, int targetUserId)
        {
            try
            {
                await EnsureGroupChatAsync(chatId);

                var callerRoleCode = await GetMemberRoleAsync(callerId, chatId)
                    ?? throw new BusinessException("You are not a member of this chat.");

                if (callerId != targetUserId && callerRoleCode != LookupKeys.RoleType.Admin)
                    throw new BusinessException("Only admins can remove other members.");

                var member = await _unitOfWork.Repository<ChatMember>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(cm => cm.ChatId == chatId
                                            && cm.UserId == targetUserId
                                            && cm.LeftAt == null)
                    ?? throw new NotFoundException("Member", targetUserId);

                member.LeftAt = DateTime.UtcNow;
                _unitOfWork.Repository<ChatMember>().Update(member);
                await _unitOfWork.SaveChangesAsync();

                var summary = await GetChatByIdAsync(callerId, chatId);
                await _notifier.NotifyGroupAsync(ChatGroup(chatId), "ChatUpdated", summary);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.RemoveMemberAsync");
                throw new BusinessException("Failed to remove member.");
            }
        }

        public async Task UpdateMemberRoleAsync(int callerId, int chatId, int targetUserId, UpdateMemberRoleDto request)
        {
            try
            {
                await EnsureAdminAsync(callerId, chatId);
                await EnsureGroupChatAsync(chatId);

                var newRoleId = await _lookup.GetRoleTypeIdAsync(request.Role);

                var member = await _unitOfWork.Repository<ChatMember>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(cm => cm.ChatId == chatId
                                            && cm.UserId == targetUserId
                                            && cm.LeftAt == null)
                    ?? throw new NotFoundException("Member", targetUserId);

                member.RoleId = newRoleId;
                _unitOfWork.Repository<ChatMember>().Update(member);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.UpdateMemberRoleAsync");
                throw new BusinessException("Failed to update member role.");
            }
        }

        public async Task<bool> IsMemberAsync(int callerId, int chatId) =>
            await _unitOfWork.Repository<ChatMember>()
                .Query()
                .AnyAsync(cm => cm.ChatId == chatId
                             && cm.UserId == callerId
                             && cm.LeftAt == null);

        public async Task<string?> GetMemberRoleAsync(int callerId, int chatId) =>
            await _unitOfWork.Repository<ChatMember>()
                .Query()
                .Where(cm => cm.ChatId == chatId
                          && cm.UserId == callerId
                          && cm.LeftAt == null)
                .Include(cm => cm.Role)
                .Select(cm => (string?)cm.Role.Code)
                .FirstOrDefaultAsync();


        public async Task<(ReactionRemovedEventDto? Removed, ReactionAddedEventDto? Added)>
           ToggleReactionAsync(int callerId, long messageId, string emojiCode)
        {
            try
            {
                var message = await _unitOfWork.Repository<Message>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(m => m.Id == messageId)
                    ?? throw new AppException("Message not found.");

                await EnsureMemberAsync(callerId, message.ChatId);

                ReactionRemovedEventDto? removed = null;
                ReactionAddedEventDto? added = null;

                var existing = await _unitOfWork.Repository<MessageReaction>()
                    .Query(asNoTracking: false)
                    .FirstOrDefaultAsync(r =>
                        r.MessageId == messageId &&
                        r.UserId == callerId);

                if (existing is not null)
                {
                    _unitOfWork.Repository<MessageReaction>().Delete(existing);

                    removed = new ReactionRemovedEventDto
                    {
                        MessageId = messageId,
                        ChatId = message.ChatId,
                        UserId = callerId,
                        EmojiCode = existing.EmojiCode,
                    };

                    if (existing.EmojiCode == emojiCode)
                    {
                        await _unitOfWork.SaveChangesAsync();
                        return (removed, null);
                    }
                }

                await _unitOfWork.Repository<MessageReaction>().AddAsync(new MessageReaction
                {
                    MessageId = messageId,
                    UserId = callerId,
                    EmojiCode = emojiCode,
                    CreatedAt = DateTime.UtcNow,
                });

                await _unitOfWork.SaveChangesAsync();

                added = new ReactionAddedEventDto
                {
                    MessageId = messageId,
                    ChatId = message.ChatId,
                    UserId = callerId,
                    EmojiCode = emojiCode,
                };

                return (removed, added);
            }
            catch (AppException) { throw; }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in ChatService.ToggleReactionAsync");
                throw new BusinessException("Failed to toggle reaction.");
            }
        }

        private async Task EnsureMemberAsync(int callerId, int chatId)
        {
            if (!await IsMemberAsync(callerId, chatId))
                throw new BusinessException("You are not a member of this chat.");
        }

        private async Task EnsureAdminAsync(int callerId, int chatId)
        {
            var roleCode = await GetMemberRoleAsync(callerId, chatId);
            if (roleCode != LookupKeys.RoleType.Admin)
                throw new BusinessException("Admin privileges are required.");
        }

        private async Task EnsureGroupChatAsync(int chatId)
        {
            var groupTypeId = await _lookup.GetChatTypeIdAsync(LookupKeys.ChatType.Group);

            var chatTypeId = await _unitOfWork.Repository<Chat>()
                .Query()
                .Where(c => c.Id == chatId)
                .Select(c => (int?)c.ChatTypeId)
                .FirstOrDefaultAsync();

            if (chatTypeId is null)
                throw new NotFoundException("Chat", chatId);

            if (chatTypeId != groupTypeId)
                throw new BusinessException("This operation is only allowed on group chats.");
        }

        private async Task<MessageDto> HydrateMessageAsync(long messageId)
        {
            var message = await _unitOfWork.Repository<Message>()
                .Query()
                .Where(m => m.Id == messageId)
                .Include(m => m.Sender)
                .Include(m => m.ContentType)
                .Include(m => m.Attachments)
                    .ThenInclude(a => a.AttachmentType)
                .Include(m => m.Reactions)
                .Include(m => m.Receipts)
                .Include(m => m.Parent)
                    .ThenInclude(p => p!.Sender)
                .Include(m => m.Parent)
                    .ThenInclude(p => p!.ContentType)
                .FirstAsync();

            return await MapToMessageDtoAsync(message);
        }

        private async Task<MessageDto> MapToMessageDtoAsync(Message m)
        {
            MessageDto? parentPreview = null;

            if (m.Parent is not null)
            {
                var parentContentType = await m.Parent.ContentTypeId.ToContentTypeCodeAsync(_lookup);

                parentPreview = new MessageDto
                {
                    Id = m.Parent.Id,
                    ChatId = m.Parent.ChatId,
                    SenderId = m.Parent.SenderId,
                    SenderName = m.Parent.Sender?.FullName ?? string.Empty,
                    SenderAvatarUrl = m.Parent.Sender?.AvatarUrl ?? string.Empty,
                    ContentType = parentContentType,
                    Content = m.Parent.IsDeleted ? string.Empty : m.Parent.Content,
                    IsDeleted = m.Parent.IsDeleted,
                    IsEdited = m.Parent.IsEdited,
                    EditedAt = m.Parent.EditedAt,
                    CreatedAt = m.Parent.CreatedAt,
                };
            }

            var attachments = new List<AttachmentDto>();
            if (m.Attachments is not null)
            {
                foreach (var a in m.Attachments)
                {
                    var attachmentType = await a.AttachmentTypeId.ToAttachmentTypeCodeAsync(_lookup);

                    attachments.Add(new AttachmentDto
                    {
                        Id = a.Id,
                        OriginalName = a.OriginalName,
                        CdnUrl = a.CdnUrl,
                        MimeType = a.MimeType,
                        AttachmentType = attachmentType,
                        SizeBytes = a.SizeBytes,
                    });
                }
            }

            var contentType = await m.ContentTypeId.ToContentTypeCodeAsync(_lookup);

            return new MessageDto
            {
                Id = m.Id,
                ChatId = m.ChatId,
                SenderId = m.SenderId,
                SenderName = m.Sender?.FullName ?? string.Empty,
                SenderAvatarUrl = m.Sender?.AvatarUrl ?? string.Empty,
                ParentId = m.ParentId,
                ParentPreview = parentPreview,
                ContentType = contentType,
                Content = m.IsDeleted ? string.Empty : m.Content,
                IsDeleted = m.IsDeleted,
                IsEdited = m.IsEdited,
                EditedAt = m.EditedAt,
                CreatedAt = m.CreatedAt,
                Attachments = attachments,
                Reactions = m.Reactions?
                    .GroupBy(r => r.EmojiCode)
                    .Select(g => new ReactionSummaryDto
                    {
                        EmojiCode = g.Key,
                        Count = g.Count(),
                        UserIds = g.Select(r => r.UserId).ToList(),
                    }).ToList() ?? new(),
                Receipt = m.Receipts.Any()
                    ? new ReceiptSummaryDto
                    {
                        DeliveredUserIds = m.Receipts
                            .Where(r => r.DeliveredAt.HasValue)
                            .Select(r => r.UserId).ToList(),
                        ReadUserIds = m.Receipts
                            .Where(r => r.ReadAt.HasValue)
                            .Select(r => r.UserId).ToList(),
                        DeliveredAt = m.Receipts
                            .Where(r => r.DeliveredAt.HasValue)
                            .Min(r => r.DeliveredAt) is DateTime da
                                ? DateTime.SpecifyKind(da, DateTimeKind.Utc) : null,
                        ReadAt = m.Receipts
                            .Where(r => r.ReadAt.HasValue)
                            .Min(r => r.ReadAt) is DateTime ra
                                ? DateTime.SpecifyKind(ra, DateTimeKind.Utc) : null,
                    }
                    : null,
            };
        }

        private async Task<ChatSummaryDto> MapToChatSummaryAsync(Chat chat, int unreadCount)
        {
            MessagePreviewDto? lastMsg = null;

            if (chat.LastMessage is not null)
            {
                var lm = chat.LastMessage;

                var contentType = await lm.ContentTypeId.ToContentTypeCodeAsync(_lookup);

                lastMsg = new MessagePreviewDto(
                    lm.Id,
                    lm.SenderId,
                    lm.Sender?.FullName ?? string.Empty,
                    contentType,
                    lm.IsDeleted ? string.Empty : lm.Content,
                    lm.CreatedAt,
                    lm.IsDeleted
                );
            }

            var members = new List<ChatMemberDto>();
            if (chat.Members is not null)
            {
                foreach (var m in chat.Members)
                {
                    var roleCode = await m.RoleId.ToRoleTypeCodeAsync(_lookup);

                    members.Add(new ChatMemberDto(
                        m.UserId,
                        m.User?.FullName ?? string.Empty,
                        m.User?.AvatarUrl ?? string.Empty,
                        roleCode,
                        m.JoinedAt,
                        m.LeftAt
                    ));
                }
            }

            var chatType = await chat.ChatTypeId.ToChatTypeCodeAsync(_lookup);

            return new ChatSummaryDto(
                chat.Id,
                chatType,
                chat.Name,
                chat.ImageUrl,
                chat.Description,
                chat.CreatedBy,
                chat.CreatedAt,
                lastMsg,
                unreadCount,
                members
            );
        }

        private static string ChatGroup(int chatId) => $"chat:{chatId}";
    }
}