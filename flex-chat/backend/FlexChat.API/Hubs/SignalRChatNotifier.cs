using FlexChat.Services.interfaces;
using Microsoft.AspNetCore.SignalR;

namespace FlexChatApi.Hubs
{
    public class SignalRChatNotifier : IChatNotifier
    {
        private readonly IHubContext<ChatHub> _hub; // untyped — no IChatHubClient

        public SignalRChatNotifier(IHubContext<ChatHub> hub)
        {
            _hub = hub;
        }

        public async Task NotifyGroupAsync(string group, string eventName, object payload)
        {
            await _hub.Clients.Group(group).SendAsync(eventName, payload);
        }

        public async Task NotifyUsersAsync(List<int> userIds, string eventName, object payload)
        {
            var groups = userIds.Select(uid => $"user:{uid}").ToList();
            await _hub.Clients.Groups(groups).SendAsync(eventName, payload);
        }
    }
}