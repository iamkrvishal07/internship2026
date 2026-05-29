using Infrastructure.Logger;

namespace FlexChatApi.Middlewares
{
    public class ResponseLoggerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IAppLogger _logger;

        public ResponseLoggerMiddleware(RequestDelegate next, IAppLogger logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var originalBody = context.Response.Body;

            using var memoryStream = new MemoryStream();

            context.Response.Body = memoryStream;

            try
            {
                await _next(context);

                memoryStream.Seek(0, SeekOrigin.Begin);

                var responseBody = await new StreamReader(memoryStream)
                    .ReadToEndAsync();

                Console.WriteLine(responseBody);

                memoryStream.Seek(0, SeekOrigin.Begin);

                await memoryStream.CopyToAsync(originalBody);
            }
            finally
            {
                context.Response.Body = originalBody;
            }
        }
    }
}
