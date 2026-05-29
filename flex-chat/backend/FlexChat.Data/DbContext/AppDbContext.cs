using FlexChat.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace FlexChat.Data.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserSession> UserSessions { get; set; }
        public DbSet<UserOtp> UserOtps { get; set; }
        public DbSet<UserBlock> UserBlocks { get; set; }

        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatMember> ChatMembers { get; set; }
        public DbSet<UserChatPreference> UserChatPreferences { get; set; }

        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageReceipt> MessageReceipts { get; set; }
        public DbSet<MessageReaction> MessageReactions { get; set; }
        public DbSet<MessagePin> MessagePins { get; set; }

        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

        public DbSet<ChatType> ChatTypes { get; set; }
        public DbSet<RoleType> RoleTypes { get; set; }
        public DbSet<ContentType> ContentTypes { get; set; }
        public DbSet<AttachmentType> AttachmentTypes { get; set; }

        public DbSet<Theme> Theme { get; set; }
        public DbSet<ThemePropertyType> ThemePropertyType { get; set; }
        public DbSet<ThemeProperty> ThemeProperty { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureTableNames(modelBuilder);
            ConfigureIndexes(modelBuilder);
            ConfigureRelationships(modelBuilder);
            ConfigureLookupTables(modelBuilder);
            SeedLookupData(modelBuilder);
            SeedThemeData(modelBuilder);
        }

        private void ConfigureTableNames(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("User");
            modelBuilder.Entity<UserSession>().ToTable("UserSession");
            modelBuilder.Entity<UserOtp>().ToTable("UserOtp");
            modelBuilder.Entity<UserBlock>().ToTable("UserBlock");

            modelBuilder.Entity<Chat>().ToTable("Chat");
            modelBuilder.Entity<ChatMember>().ToTable("ChatMember");
            modelBuilder.Entity<UserChatPreference>().ToTable("UserChatPreference");

            modelBuilder.Entity<Message>().ToTable("Message");
            modelBuilder.Entity<MessageReceipt>().ToTable("MessageReceipt");
            modelBuilder.Entity<MessageReaction>().ToTable("MessageReaction");
            modelBuilder.Entity<MessagePin>().ToTable("MessagePin");

            modelBuilder.Entity<Attachment>().ToTable("Attachment");
            modelBuilder.Entity<Notification>().ToTable("Notification");

            modelBuilder.Entity<Theme>().ToTable("Theme");
            modelBuilder.Entity<ThemePropertyType>().ToTable("ThemePropertyType");
            modelBuilder.Entity<ThemeProperty>().ToTable("ThemeProperty");

            modelBuilder.Entity<ChatType>().ToTable("ChatTypes");
            modelBuilder.Entity<RoleType>().ToTable("RoleTypes");
            modelBuilder.Entity<ContentType>().ToTable("ContentTypes");
            modelBuilder.Entity<AttachmentType>().ToTable("AttachmentTypes");
        }

        private void ConfigureIndexes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(x => x.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(x => x.Email)
                .IsUnique();

            modelBuilder.Entity<UserSession>()
                .HasIndex(x => x.RefreshToken)
                .IsUnique();

            modelBuilder.Entity<ChatMember>()
                .HasIndex(x => new { x.ChatId, x.UserId })
                .IsUnique();

            modelBuilder.Entity<MessageReceipt>()
                .HasIndex(x => new { x.MessageId, x.UserId })
                .IsUnique();

            modelBuilder.Entity<Message>()
                .HasIndex(x => new { x.ChatId, x.CreatedAt });

            modelBuilder.Entity<Theme>()
                .HasIndex(x => x.UserId);

            modelBuilder.Entity<Theme>()
                .HasIndex(x => new { x.UserId, x.Name })
                .IsUnique();

            modelBuilder.Entity<ThemePropertyType>()
                .HasIndex(x => x.Key)
                .IsUnique();

            modelBuilder.Entity<ThemeProperty>()
                .HasIndex(x => x.ThemeId);

            modelBuilder.Entity<ThemeProperty>()
                .HasIndex(x => new { x.ThemeId, x.PropertyTypeId })
                .IsUnique();

            modelBuilder.Entity<UserChatPreference>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ChatId }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Chat)
                    .WithMany()
                    .HasForeignKey(e => e.ChatId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Theme)
                    .WithMany()
                    .HasForeignKey(e => e.ThemeId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<ChatType>()
                .HasIndex(x => x.Code)
                .IsUnique();

            modelBuilder.Entity<RoleType>()
                .HasIndex(x => x.Code)
                .IsUnique();

            modelBuilder.Entity<ContentType>()
                .HasIndex(x => x.Code)
                .IsUnique();

            modelBuilder.Entity<AttachmentType>()
                .HasIndex(x => x.Code)
                .IsUnique();
        }

        private void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserBlock>()
                .HasOne(ub => ub.Blocker)
                .WithMany()
                .HasForeignKey(ub => ub.BlockerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<UserBlock>()
                .HasOne(ub => ub.Blocked)
                .WithMany()
                .HasForeignKey(ub => ub.BlockedId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Chat>()
                .HasOne(c => c.Creator)
                .WithMany(u => u.CreatedChats)
                .HasForeignKey(c => c.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Chat>()
                .HasOne(c => c.LastMessage)
                .WithMany()
                .HasForeignKey(c => c.LastMessageId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Chat>()
                .HasOne(c => c.ChatType)
                .WithMany(ct => ct.Chats)
                .HasForeignKey(c => c.ChatTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatMember>()
                .HasOne(cm => cm.Role)
                .WithMany(rt => rt.ChatMembers)
                .HasForeignKey(cm => cm.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Parent)
                .WithMany(m => m.Replies)
                .HasForeignKey(m => m.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Theme>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ThemePropertyType>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<ThemePropertyType>()
                .Property(x => x.Key)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<ThemePropertyType>()
                .Property(x => x.DisplayName)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<ThemePropertyType>()
                .Property(x => x.PropertyType)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<ThemeProperty>()
                .HasOne(tp => tp.Theme)
                .WithMany(t => t.Properties)
                .HasForeignKey(tp => tp.ThemeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ThemeProperty>()
                .HasOne(tp => tp.ThemePropertyType)
                .WithMany(x => x.ThemeProperties)
                .HasForeignKey(tp => tp.PropertyTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ThemeProperty>()
                .Property(x => x.PropertyValue)
                .IsRequired()
                .HasMaxLength(500);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.ContentType)
                .WithMany(ct => ct.Messages)
                .HasForeignKey(m => m.ContentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Attachment>()
                .HasOne(a => a.AttachmentType)
                .WithMany(at => at.Attachments)
                .HasForeignKey(a => a.AttachmentTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureLookupTables(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChatType>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Code).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<RoleType>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Code).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<ContentType>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Code).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<AttachmentType>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.Property(x => x.Code).IsRequired().HasMaxLength(50);
            });
        }

        private void SeedLookupData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChatType>().HasData(
                new ChatType { Id = 1, Code = "direct" },
                new ChatType { Id = 2, Code = "group" }
            );

            modelBuilder.Entity<RoleType>().HasData(
                new RoleType { Id = 1, Code = "member" },
                new RoleType { Id = 2, Code = "admin" }
            );

            modelBuilder.Entity<ContentType>().HasData(
                new ContentType { Id = 1, Code = "text" },
                new ContentType { Id = 2, Code = "attachment" },
                new ContentType { Id = 3, Code = "textWithImage" }
            );

            modelBuilder.Entity<AttachmentType>().HasData(
                new AttachmentType { Id = 1, Code = "image" },
                new AttachmentType { Id = 2, Code = "video" },
                new AttachmentType { Id = 3, Code = "audio" },
                new AttachmentType { Id = 4, Code = "document" }
            );
        }

        private void SeedThemeData(ModelBuilder modelBuilder)
        {
            var seededAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            modelBuilder.Entity<ThemePropertyType>().HasData(
                                new ThemePropertyType { Id = 1, Key = "senderChatBubbleBgColor", DisplayName = "Sender Bubble Background Color", Description = "Background color for sender message bubbles", DefaultValue = "#4f46e5", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 2, Key = "senderChatBubbleTextColor", DisplayName = "Sender Bubble Text Color", Description = "Text color for sender message bubbles", DefaultValue = "#ffffff", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 3, Key = "senderChatBubbleRadius", DisplayName = "Sender Bubble Border Radius", Description = "Border radius for sender message bubbles", DefaultValue = "18", PropertyType = "number", IsRequired = false, CreatedAt = seededAt },

                                new ThemePropertyType { Id = 4, Key = "receiverChatBubbleBgColor", DisplayName = "Receiver Bubble Background Color", Description = "Background color for receiver message bubbles", DefaultValue = "#f3f4f6", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 5, Key = "receiverChatBubbleTextColor", DisplayName = "Receiver Bubble Text Color", Description = "Text color for receiver message bubbles", DefaultValue = "#111827", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 6, Key = "receiverChatBubbleRadius", DisplayName = "Receiver Bubble Border Radius", Description = "Border radius for receiver message bubbles", DefaultValue = "18", PropertyType = "number", IsRequired = false, CreatedAt = seededAt },

                                new ThemePropertyType { Id = 7, Key = "headerColor", DisplayName = "Header Background Color", Description = "Background color for chat header", DefaultValue = "#ffffff", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 8, Key = "headerTextColor", DisplayName = "Header Text Color", Description = "Text color for chat header", DefaultValue = "#111827", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },

                                new ThemePropertyType { Id = 9, Key = "chatBackgroundColor", DisplayName = "Chat Background Color", Description = "Background color for chat area", DefaultValue = "#f9fafb", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 10, Key = "chatBackgroundTextColor", DisplayName = "Chat Text Color", Description = "Text color in chat area", DefaultValue = "#111827", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },

                                new ThemePropertyType { Id = 11, Key = "messageInputBgColor", DisplayName = "Message Input Background Color", Description = "Background color for message input field", DefaultValue = "#ffffff", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 12, Key = "messageInputTextColor", DisplayName = "Message Input Text Color", Description = "Text color for message input field", DefaultValue = "#111827", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 13, Key = "messageInputRadius", DisplayName = "Message Input Border Radius", Description = "Border radius for message input field", DefaultValue = "12", PropertyType = "number", IsRequired = false, CreatedAt = seededAt },

                                new ThemePropertyType { Id = 14, Key = "sendButtonBgColor", DisplayName = "Send Button Background Color", Description = "Background color for send button", DefaultValue = "#4f46e5", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 15, Key = "sendButtonArrowColor", DisplayName = "Send Button Arrow Color", Description = "Arrow/icon color for send button", DefaultValue = "#ffffff", PropertyType = "color", IsRequired = true, CreatedAt = seededAt },
                new ThemePropertyType { Id = 16, Key = "sendButtonRadius", DisplayName = "Send Button Border Radius", Description = "Border radius for send button", DefaultValue = "6", PropertyType = "number", IsRequired = false, CreatedAt = seededAt }
            );
        }
    }
}