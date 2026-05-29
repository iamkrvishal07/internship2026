using FlexChat.DAL.Repositories.Implementations;
using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlexChat.Data
{
    public static class DataDependencyInjection
    {
        public static IServiceCollection AddDataLayer(
            this IServiceCollection services,
            IConfiguration configuration)
        {

            services.AddDbContext<AppDbContext>(options =>
                     options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            return services;
        }
    }
}
