

using System.Collections.Generic;

namespace Infrastructure.Exceptions
{
    public class ValidationException : BusinessException
    {
        public List<string> Errors { get; }
        public ValidationException(List<string> errors)
            : base("Validation failed", "VALIDATION_ERROR")
        {
            Errors = errors;
        }
    }
}
