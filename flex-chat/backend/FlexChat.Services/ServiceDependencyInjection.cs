using FlexChat.DAL.Repositories.Implementations;
using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Models;
using FlexChat.Services.interfaces;
using FlexChat.Services.services;
using Microsoft.Extensions.DependencyInjection;

namespace FlexChat.Services
{
    public static class ServiceDependencyInjection
    {
        public static IServiceCollection AddServiceLayer(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IChatService, ChatService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IThemeService, ThemeService>();
            services.AddMemoryCache();
            services.AddScoped<IThemePropertyTypeCacheService, ThemePropertyTypeCacheService>();
            services.AddScoped<IUserChatPreferenceService, UserChatPreferenceService>();

            // ILookupService is defined in FlexChat.Data (no upward reference).
            // LookupService is implemented in FlexChat.Services.
            // Scoped: shares the DbContext/UnitOfWork lifetime per request.
            services.AddScoped<ILookupService, LookupService>();

            return services;
        }
    }
}