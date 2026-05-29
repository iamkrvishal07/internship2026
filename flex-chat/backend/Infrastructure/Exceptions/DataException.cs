

namespace Infrastructure.Exceptions
{
    public class DataException : AppException
    {
        public DataException(string message, string errorCode = "DATA_ERROR")
            : base(message, errorCode, 500) { }
    }
}
