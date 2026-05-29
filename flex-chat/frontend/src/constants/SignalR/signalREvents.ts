export const SIGNALR_SERVER_EVENTS = {
    JOIN_CHAT: "JoinChat",
    LEAVE_CHAT: "LeaveChat",
    SEND_MESSAGE: "SendMessage",
    EDIT_MESSAGE: "EditMessage",
    DELETE_MESSAGE: "DeleteMessage",
    SEND_TYPING: "SendTyping",
    ACKNOWLEDGE_DELIVERY: "AcknowledgeDelivery",
    MARK_READ: "MarkRead",
    TOGGLE_REACTION: "ToggleReaction",
    GET_ONLINE_USERS: "GetOnlineUsers",
    NOTIFY_NEW_CHAT: "NotifyNewChat",
} as const;

export const SIGNALR_CLIENT_EVENTS = {
    MESSAGE_RECEIVED: "MessageReceived",
    MESSAGE_SAVED: "MessageSaved",
    RECEIPT_UPDATED: "ReceiptUpdated",
    MESSAGE_DELETED: "MessageDeleted",
    MESSAGE_EDITED: "MessageEdited",
    REACTION_ADDED: "ReactionAdded",
    REACTION_REMOVED: "ReactionRemoved",
    USER_PRESENCE_CHANGED: "UserPresenceChanged",
    USER_TYPING: "UserTyping",
    CHAT_CREATED: "ChatCreated",
} as const;
