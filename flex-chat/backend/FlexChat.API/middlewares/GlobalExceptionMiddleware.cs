using Infrastructure.Exceptions;
using Infrastructure.Logger;

namespace FlexChatApi.Middlewares
{
    public class GlobalExceptionMiddleware
    {

        private readonly RequestDelegate _next;
        private readonly IAppLogger _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, IAppLogger logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            switch (ex)
            {
                case ValidationException ve:
                    _logger.Warning(ve, "Validation error");
                    await WriteJsonResponse(context, 400, ve.ErrorCode, ve.Message, ve.Errors);
                    break;

                case NotFoundException nfe:
                    _logger.Warning(nfe, "Resource not found");
                    await WriteJsonResponse(context, 404, nfe.ErrorCode, nfe.Message);
                    break;

                case BusinessException be:
                    _logger.Warning(be, "Business rule violation");
                    await WriteJsonResponse(context, 400, be.ErrorCode, be.Message);
                    break;

                default:
                    _logger.Error(ex, "Unhandled exception");
                    await WriteJsonResponse(context, 500, "SERVER_ERROR", "An internal error occurred.");
                    break;
            }
        }

        private static async Task WriteJsonResponse(HttpContext context, int statusCode,
            string errorCode, string message, List<string> errors = null)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            var response = new { errorCode, message, errors };
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}

