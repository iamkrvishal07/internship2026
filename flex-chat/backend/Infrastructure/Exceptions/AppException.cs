using System;


namespace Infrastructure.Exceptions
{
    public class AppException : Exception
    {
        public string ErrorCode { get; }
        public int StatusCode { get; }

        public AppException(string message, string errorCode = "GENERAL_ERROR", int statusCode = 500)
            : base(message)
        {
            ErrorCode = errorCode;
            StatusCode = statusCode;
        }
    }
}
