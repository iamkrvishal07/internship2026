using System;
using System.IO;
using System.Text;

namespace Infrastructure.Logger
{
    public class FileLogger : IAppLogger
    {
        private readonly string _logFolder;
        private static readonly object _lock = new object();

        public FileLogger(string logFolder = null)
        {
            _logFolder = logFolder
                ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
        }

        private string GetLogFile()
            => Path.Combine(_logFolder, $"log_{DateTime.UtcNow:yyyyMMdd}.txt");

        public void Info(string message)
            => Write("INFO   ", message);

        public void Warning(string message)
            => Write("WARNING", message);

        public void Error(string message)
            => Write("ERROR  ", message);

        public void Warning(Exception ex, string contextMessage)
        {
            Write("WARNING", contextMessage);
            Exception(ex, contextMessage);
        }

        public void Error(Exception ex, string contextMessage)
        {
            Write("ERROR  ", contextMessage);
            Exception(ex, contextMessage);
        }
        public void Exception(Exception ex, string contextMessage = null)
        {
            var sb = new StringBuilder();

            if (!string.IsNullOrWhiteSpace(contextMessage))
                sb.AppendLine($"Context : {contextMessage}");

            var current = ex;
            int depth = 0;
            while (current != null)
            {
                sb.AppendLine($"Exception[{depth}] : {current.GetType().FullName}");
                sb.AppendLine($"Message[{depth}]   : {current.Message}");
                sb.AppendLine($"Source[{depth}]    : {current.Source}");
                sb.AppendLine($"StackTrace[{depth}]:");
                sb.AppendLine(current.StackTrace);
                current = current.InnerException;
                depth++;
            }

            sb.AppendLine(new string('-', 60));

            Write("EXCEPTION", sb.ToString());
        }

        private void Write(string level, string message)
        {
            try
            {
                EnsureLogFolder();

                string line = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] [{level}] {message}";

                lock (_lock)
                {
                    File.AppendAllText(GetLogFile(), line + Environment.NewLine);
                }
            }
            catch (Exception logEx)
            {

                try
                {
                    Console.Error.WriteLine($"[LOGGER FAILURE] {logEx.Message}");
                    Console.Error.WriteLine($"[ORIGINAL MSG]   {message}");
                }
                catch { }
            }
        }

        private void EnsureLogFolder()
        {
            if (!Directory.Exists(_logFolder))
                Directory.CreateDirectory(_logFolder);
        }
    }
}
