using System.Text;

namespace FlexChatApi.Middlewares
{
    public class RequestLoggerMiddleware
    {
        private readonly RequestDelegate _next;

        public RequestLoggerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            context.Request.EnableBuffering();

            using var reader = new StreamReader(
                context.Request.Body,
                Encoding.UTF8,
                leaveOpen: true
            );

            var requestBody = await reader.ReadToEndAsync();

            context.Request.Body.Position = 0;

            Console.WriteLine(requestBody);

            await _next(context);
        }
    }
}