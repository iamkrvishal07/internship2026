
namespace Infrastructure.Exceptions
{
    public class NotFoundException : AppException
    {
        public NotFoundException(string entity, object id)
            : base($"{entity} with id '{id}' was not found.", "NOT_FOUND", 404) { }
    }
}
