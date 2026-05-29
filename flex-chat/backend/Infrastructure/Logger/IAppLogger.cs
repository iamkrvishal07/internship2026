using System;


namespace Infrastructure.Logger
{
    public interface IAppLogger
    {
        void Info(string message);
        void Warning(string message);
        void Error(string message);
        void Exception(Exception ex, string contextMessage = null);
        void Warning(Exception ex, string contextMessage);
        void Error(Exception ex, string contextMessage);
    }
}
