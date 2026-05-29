using System.Linq.Expressions;

namespace FlexChat.DAL.Repositories.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(bool asNoTracking = true);
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, bool asNoTracking = true);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool asNoTracking = true);
        Task AddAsync(T entity);
        Task AddRangeAsync(ICollection<T> entity);
        void Update(T entity);
        void Delete(T entity);
        void RemoveRange(ICollection<T> entity);
        IQueryable<T> Query(bool asNoTracking = true);
    }
}
