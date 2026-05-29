using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Models;
using FlexChat.Services.interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlexChat.Services.services
{
    public class ThemePropertyTypeCacheService : IThemePropertyTypeCacheService
    {
        private readonly IMemoryCache _cache;
        private readonly IRepository<ThemePropertyType> _propertyTypeRepo;
        private const string CACHE_KEY = "theme_property_types";
        private const int CACHE_DURATION_MINUTES = 60;

        public ThemePropertyTypeCacheService(IMemoryCache cache, IUnitOfWork unitOfWork)
        {
            _cache = cache;
            _propertyTypeRepo = unitOfWork.Repository<ThemePropertyType>();
        }

        public async Task<ThemePropertyType?> GetPropertyTypeByIdAsync(int id)
        {
            var propertyTypes = await GetAllPropertyTypesAsync();
            return propertyTypes.FirstOrDefault(x => x.Id == id);
        }

        public async Task<List<ThemePropertyType>> GetAllPropertyTypesAsync()
        {
            if (_cache.TryGetValue(CACHE_KEY, out List<ThemePropertyType>? cachedData) && cachedData != null)
            {
                return cachedData;
            }

            var propertyTypes = await _propertyTypeRepo.Query().ToListAsync();

            _cache.Set(CACHE_KEY, propertyTypes, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

            return propertyTypes;
        }

        public async Task RefreshCacheAsync()
        {
            _cache.Remove(CACHE_KEY);
            await GetAllPropertyTypesAsync();
        }
    }
}
