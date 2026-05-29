// FlexChat.Services/Services/LookupService.cs

using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Models;
using Infrastructure.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace FlexChat.Services.services
{

    public class LookupService : ILookupService
    {
        private readonly IUnitOfWork _unitOfWork;

        private Dictionary<string, int>? _chatTypeByCode;
        private Dictionary<int, string>? _chatTypeById;

        private Dictionary<string, int>? _roleTypeByCode;
        private Dictionary<int, string>? _roleTypeById;

        private Dictionary<string, int>? _contentTypeByCode;
        private Dictionary<int, string>? _contentTypeById;

        private Dictionary<string, int>? _attachmentTypeByCode;
        private Dictionary<int, string>? _attachmentTypeById;

        public LookupService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<int> GetChatTypeIdAsync(string code)
        {
            await EnsureChatTypesAsync();
            return Resolve(_chatTypeByCode!, code, "ChatType");
        }
        public async Task<string> GetChatTypeCodeAsync(int id)
        {
            await EnsureChatTypesAsync();
            return Resolve(_chatTypeById!, id, "ChatType");
        }
        private async Task EnsureChatTypesAsync()
        {
            if (_chatTypeByCode is not null) return; // Already loaded

            var rows = await _unitOfWork.Repository<ChatType>()
                .Query()
                .ToListAsync();

            _chatTypeByCode = rows.ToDictionary(r => r.Code, r => r.Id, StringComparer.OrdinalIgnoreCase);
            _chatTypeById = rows.ToDictionary(r => r.Id, r => r.Code);
        }

        public async Task<int> GetRoleTypeIdAsync(string code)
        {
            await EnsureRoleTypesAsync();
            return Resolve(_roleTypeByCode!, code, "RoleType");
        }

        public async Task<string> GetRoleTypeCodeAsync(int id)
        {
            await EnsureRoleTypesAsync();
            return Resolve(_roleTypeById!, id, "RoleType");
        }

        private async Task EnsureRoleTypesAsync()
        {
            if (_roleTypeByCode is not null) return;

            var rows = await _unitOfWork.Repository<RoleType>()
                .Query()
                .ToListAsync();

            _roleTypeByCode = rows.ToDictionary(r => r.Code, r => r.Id, StringComparer.OrdinalIgnoreCase);
            _roleTypeById = rows.ToDictionary(r => r.Id, r => r.Code);
        }


        public async Task<int> GetContentTypeIdAsync(string code)
        {
            await EnsureContentTypesAsync();
            return Resolve(_contentTypeByCode!, code, "ContentType");
        }

        public async Task<string> GetContentTypeCodeAsync(int id)
        {
            await EnsureContentTypesAsync();
            return Resolve(_contentTypeById!, id, "ContentType");
        }

        private async Task EnsureContentTypesAsync()
        {
            if (_contentTypeByCode is not null) return;

            var rows = await _unitOfWork.Repository<ContentType>()
                .Query()
                .ToListAsync();

            _contentTypeByCode = rows.ToDictionary(r => r.Code, r => r.Id, StringComparer.OrdinalIgnoreCase);
            _contentTypeById = rows.ToDictionary(r => r.Id, r => r.Code);
        }

        public async Task<int> GetAttachmentTypeIdAsync(string code)
        {
            await EnsureAttachmentTypesAsync();
            return Resolve(_attachmentTypeByCode!, code, "AttachmentType");
        }

        public async Task<string> GetAttachmentTypeCodeAsync(int id)
        {
            await EnsureAttachmentTypesAsync();
            return Resolve(_attachmentTypeById!, id, "AttachmentType");
        }

        private async Task EnsureAttachmentTypesAsync()
        {
            if (_attachmentTypeByCode is not null) return;

            var rows = await _unitOfWork.Repository<AttachmentType>()
                .Query()
                .ToListAsync();

            _attachmentTypeByCode = rows.ToDictionary(r => r.Code, r => r.Id, StringComparer.OrdinalIgnoreCase);
            _attachmentTypeById = rows.ToDictionary(r => r.Id, r => r.Code);
        }

        private static TValue Resolve<TKey, TValue>(
            Dictionary<TKey, TValue> dict, TKey key, string tableName)
            where TKey : notnull
        {
            if (dict.TryGetValue(key, out var value))
                return value;

            throw new BusinessException(
                $"Unknown {tableName} lookup key: '{key}'. " +
                $"Valid keys are: {string.Join(", ", dict.Keys)}.");
        }
    }
}
