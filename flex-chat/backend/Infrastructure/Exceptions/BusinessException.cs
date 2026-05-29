namespace Infrastructure.Exceptions
{
    public class BusinessException : AppException
    {
        public BusinessException(string message, string errorCode = "BUSINESS_ERROR")
            : base(message, errorCode, 400) { }
    }
}
