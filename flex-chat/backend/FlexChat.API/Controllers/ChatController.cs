using FlexChat.Services.dtos.chat;
using FlexChat.Services.dtos.chatPreference;
using FlexChat.Services.dtos.message;
using FlexChat.Services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlexChatApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IUserChatPreferenceService _userChatPreferenceService;

        public ChatController(IChatService chatService, IUserChatPreferenceService userChatPreferenceService)
        {
            _chatService = chatService;
            _userChatPreferenceService = userChatPreferenceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyChats()
        {
            var chats = await _chatService.GetUserChatsAsync(CallerId);
            Console.WriteLine(chats);
            return Ok(chats);
        }

        [HttpGet("{chatId:int}")]
        public async Task<IActionResult> GetChat(int chatId)
        {
            var chat = await _chatService.GetChatByIdAsync(CallerId, chatId);
            return Ok(chat);
        }

        [HttpPost("direct")]
        public async Task<IActionResult> GetOrCreateDirectChat([FromBody] CreateDirectChatDto request)
        {
            var chat = await _chatService.GetOrCreateDirectChatAsync(CallerId, request);
            return Ok(chat);
        }

        [HttpPost("group")]
        public async Task<IActionResult> CreateGroupChat([FromBody] CreateGroupChatDto request)
        {
            var chat = await _chatService.CreateGroupChatAsync(CallerId, request);
            return CreatedAtAction(nameof(GetChat), new { chatId = chat.Id }, chat);
        }

        [HttpPatch("{chatId:int}/group")]
        public async Task<IActionResult> UpdateGroupChat(int chatId, [FromBody] UpdateGroupChatDto request)
        {
            var chat = await _chatService.UpdateGroupChatAsync(CallerId, chatId, request);
            return Ok(chat);
        }

        [HttpPost("{chatId:int}/members")]
        public async Task<IActionResult> AddMembers(int chatId, [FromBody] AddMembersDto request)
        {
            await _chatService.AddMembersAsync(CallerId, chatId, request);
            return NoContent();
        }

        [HttpDelete("{chatId:int}/members/{targetUserId:int}")]
        public async Task<IActionResult> RemoveMember(int chatId, int targetUserId)
        {
            await _chatService.RemoveMemberAsync(CallerId, chatId, targetUserId);
            return NoContent();
        }

        [HttpPatch("{chatId:int}/members/{targetUserId:int}/role")]
        public async Task<IActionResult> UpdateMemberRole(int chatId, int targetUserId,
            [FromBody] UpdateMemberRoleDto request)
        {
            await _chatService.UpdateMemberRoleAsync(CallerId, chatId, targetUserId, request);
            return NoContent();
        }

        [HttpPost("{chatId:int}/messages")]
        public async Task<IActionResult> SendMessage(int chatId, [FromBody] SendMessageDto request)
        {
            var message = await _chatService.SendMessageAsync(CallerId, chatId, request);
            return CreatedAtAction(nameof(GetMessages), new { chatId }, message);
        }

        [HttpGet("{chatId:int}/messages")]
        public async Task<IActionResult> GetMessages(int chatId,
            [FromQuery] long? beforeId = null,
            [FromQuery] int pageSize = 50)
        {
            var result = await _chatService.GetMessagesAsync(CallerId, chatId, beforeId, pageSize);
            return Ok(result);
        }

        [HttpPatch("{chatId:int}/messages/{messageId:long}")]
        public async Task<IActionResult> EditMessage(int chatId, long messageId,
            [FromBody] EditMessageDto request)
        {
            var message = await _chatService.EditMessageAsync(CallerId, messageId, request);
            return Ok(message);
        }

        [HttpDelete("{chatId:int}/messages/{messageId:long}")]
        public async Task<IActionResult> DeleteMessage(int chatId, long messageId)
        {
            await _chatService.DeleteMessageAsync(CallerId, messageId);
            return NoContent();
        }

        [HttpDelete("{chatId:int}/messages/{messageId:long}/undo")]
        public async Task<IActionResult> UndoMessage(int chatId, long messageId)
        {
            await _chatService.UndoMessageAsync(CallerId, messageId);
            return NoContent();
        }


        [HttpPost("{chatId:int}/messages/read")]
        public async Task<IActionResult> MarkRead(int chatId, [FromBody] MarkReadDto request)
        {
            await _chatService.MarkMessagesReadAsync(CallerId, chatId, request);
            return NoContent();
        }

        [HttpGet("{chatId:int}/preference")]
        public async Task<IActionResult> GetChatPreference(int chatId)
        {
            var preference = await _userChatPreferenceService.GetChatPreferenceAsync(CallerId, chatId);
            return Ok(preference);
        }

        [HttpPatch("{chatId:int}/preference")]
        public async Task<IActionResult> UpdateChatPreference(int chatId, [FromBody] UserChatPreferenceDto request)
        {
            await _userChatPreferenceService.UpdateChatPreferencesAsync(CallerId, chatId, request);
            return NoContent();
        }

        private int CallerId
        {
            get
            {
                return 1;
                var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(sub))
                    throw new UnauthorizedAccessException("User ID not found in claims");

                if (!int.TryParse(sub, out var userId))
                    throw new InvalidOperationException("Invalid user ID format");

                return userId;
            }
        }
    }
}
