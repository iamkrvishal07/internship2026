// FlexChat.Services/Extensions/LookupExtensions.cs

using FlexChat.DAL.Repositories.Interfaces;

namespace FlexChat.Services.Extensions
{
    /// <summary>
    /// Extension methods for converting lookup IDs to codes (and vice versa).
    /// 
    /// PURPOSE:
    /// - Provides clean, fluent syntax: chatTypeId.ToChatTypeCodeAsync(_lookup)
    /// - Encapsulates the lookup service calls
    /// - Makes mapping code more readable and maintainable
    /// 
    /// LOCATION:
    /// - Lives in FlexChat.Services because:
    ///   a) It depends on ILookupService (also in Services layer)
    ///   b) Used primarily by service classes during DTO mapping
    ///   c) Not needed by Data layer (entities store IDs, not codes)
    /// 
    /// USAGE PATTERN:
    /// 
    /// WHEN READING (ID → Code for DTOs):
    ///   var chatTypeCode = await chat.ChatTypeId.ToChatTypeCodeAsync(_lookup);
    ///   // Returns: "Direct" or "Group" (LookupKeys constants)
    /// 
    /// WHEN SAVING (Code → ID for entities):
    ///   var chatTypeId = await LookupKeys.ChatType.Direct.ToChatTypeIdAsync(_lookup);
    ///   // Returns: 1 or 2 (database ID)
    /// 
    /// PERFORMANCE:
    /// - First call triggers DB load + caching in LookupService
    /// - Subsequent calls in same request are O(1) dictionary lookups
    /// - No performance concern even when mapping 100+ messages
    /// </summary>
    public static class LookupExtensions
    {
        // ── ChatType ──────────────────────────────────────────────────────

        /// <summary>
        /// Converts ChatType database ID to code string.
        /// Example: 1 → "Direct", 2 → "Group"
        /// </summary>
        public static async Task<string> ToChatTypeCodeAsync(
            this int chatTypeId,
            ILookupService lookup)
        {
            return await lookup.GetChatTypeCodeAsync(chatTypeId);
        }

        /// <summary>
        /// Converts ChatType code string to database ID.
        /// Example: "Direct" → 1, "Group" → 2
        /// </summary>
        public static async Task<int> ToChatTypeIdAsync(
            this string chatTypeCode,
            ILookupService lookup)
        {
            return await lookup.GetChatTypeIdAsync(chatTypeCode);
        }

        // ── RoleType ──────────────────────────────────────────────────────

        /// <summary>
        /// Converts RoleType database ID to code string.
        /// Example: 1 → "Member", 2 → "Admin"
        /// </summary>
        public static async Task<string> ToRoleTypeCodeAsync(
            this int roleTypeId,
            ILookupService lookup)
        {
            return await lookup.GetRoleTypeCodeAsync(roleTypeId);
        }

        /// <summary>
        /// Converts RoleType code string to database ID.
        /// Example: "Member" → 1, "Admin" → 2
        /// </summary>
        public static async Task<int> ToRoleTypeIdAsync(
            this string roleTypeCode,
            ILookupService lookup)
        {
            return await lookup.GetRoleTypeIdAsync(roleTypeCode);
        }

        // ── ContentType ───────────────────────────────────────────────────

        /// <summary>
        /// Converts ContentType database ID to code string.
        /// Example: 1 → "text", 2 → "attachment", 3 → "textWithImage"
        /// </summary>
        public static async Task<string> ToContentTypeCodeAsync(
            this int contentTypeId,
            ILookupService lookup)
        {
            return await lookup.GetContentTypeCodeAsync(contentTypeId);
        }

        /// <summary>
        /// Converts ContentType code string to database ID.
        /// Example: "text" → 1, "attachment" → 2
        /// </summary>
        public static async Task<int> ToContentTypeIdAsync(
            this string contentTypeCode,
            ILookupService lookup)
        {
            return await lookup.GetContentTypeIdAsync(contentTypeCode);
        }

        // ── AttachmentType ────────────────────────────────────────────────

        /// <summary>
        /// Converts AttachmentType database ID to code string.
        /// Example: 1 → "image", 2 → "video", 3 → "audio", 4 → "document"
        /// </summary>
        public static async Task<string> ToAttachmentTypeCodeAsync(
            this int attachmentTypeId,
            ILookupService lookup)
        {
            return await lookup.GetAttachmentTypeCodeAsync(attachmentTypeId);
        }

        /// <summary>
        /// Converts AttachmentType code string to database ID.
        /// Example: "image" → 1, "video" → 2
        /// </summary>
        public static async Task<int> ToAttachmentTypeIdAsync(
            this string attachmentTypeCode,
            ILookupService lookup)
        {
            return await lookup.GetAttachmentTypeIdAsync(attachmentTypeCode);
        }
    }
}