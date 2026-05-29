using System;
using System.Collections.Generic;
using System.Text;

namespace FlexChat.Services.interfaces
{
    public interface IChatNotifier
    {
        Task NotifyGroupAsync(string group, string eventName, object payload);
        Task NotifyUsersAsync(List<int> userIds, string eventName, object payload);
    }
}
