using Microsoft.EntityFrameworkCore;
using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Data;
using System.Linq.Expressions;

namespace FlexChat.DAL.Repositories.Implementations
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync(bool asNoTracking = true)
        {
            IQueryable<T> query = _dbSet;
            if (asNoTracking) query = query.AsNoTracking();
            return await query.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> FindAsync(
            Expression<Func<T, bool>> predicate,
            bool asNoTracking = true)
        {
            IQueryable<T> query = _dbSet.Where(predicate);
            if (asNoTracking) query = query.AsNoTracking();
            return await query.ToListAsync();
        }

        public async Task<T?> FirstOrDefaultAsync(
            Expression<Func<T, bool>> predicate,
            bool asNoTracking = true)
        {
            IQueryable<T> query = _dbSet.Where(predicate);
            if (asNoTracking) query = query.AsNoTracking();
            return await query.FirstOrDefaultAsync();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(ICollection<T> entity)
        {
            await _dbSet.AddRangeAsync(entity);
        }

        public void Update(T entity)
            => _dbSet.Update(entity);

        public void Delete(T entity)
            => _dbSet.Remove(entity);

        public void RemoveRange(ICollection<T> entity)
            => _dbSet.RemoveRange(entity);

        public IQueryable<T> Query(bool asNoTracking = true)
        {
            IQueryable<T> query = _dbSet;
            return asNoTracking ? query.AsNoTracking() : query;
        }
    }
}
