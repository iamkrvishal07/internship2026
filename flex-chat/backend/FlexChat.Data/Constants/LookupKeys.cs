namespace FlexChat.Data.Constants
{
    public static class LookupKeys
    {
        public static class ChatType
        {
            public const string Direct = "direct";
            public const string Group = "group";
        }

        public static class RoleType
        {
            public const string Member = "member";
            public const string Admin = "admin";
        }

        public static class ContentType
        {
            public const string Text = "text";
            public const string Attachment = "attachment";
            public const string TextWithImage = "textWithImage";
        }

        public static class AttachmentType
        {
            public const string Image = "image";
            public const string Video = "video";
            public const string Audio = "audio";
            public const string Document = "document";
        }
    }
}