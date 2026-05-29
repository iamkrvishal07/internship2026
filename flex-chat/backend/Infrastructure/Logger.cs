

//using System;
//using System.IO;

//namespace Infrastructure
//{
//    public static class Logger
//    {
//        private static readonly string logFolder =
//            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");

//        private static string GetLogFile()
//        {
//            return Path.Combine(logFolder,
//                $"log_{DateTime.Now:yyyyMMdd}.txt");
//        }

//        public static void Info(string message)
//        {
//            Write("INFO", message);
//        }

//        public static void Error(string message)
//        {
//            Write("ERROR", message);
//        }

//        public static void Exception(Exception ex)
//        {
//            Write("ERROR", ex.Message);
//            Write("STACK", ex.StackTrace);
//            Write("SOURCE", ex.Source);
//            Write("-----", "-----------------------------------");
//        }

//        private static void Write(string type, string message)
//        {
//            try
//            {
//                if (!Directory.Exists(logFolder))
//                    Directory.CreateDirectory(logFolder);

//                string line =
//                    $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{type}] {message}";

//                File.AppendAllText(GetLogFile(),
//                    line + Environment.NewLine);
//            }
//            catch
//            {

//            }
//        }
//    }
//}
