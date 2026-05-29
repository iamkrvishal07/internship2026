using FlexChat.Services.interfaces;
using Infrastructure.Exceptions;
using Infrastructure.Logger;
using Infrastructure.settings;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace FlexChat.Services.services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _email;
        private readonly IAppLogger _logger;

        public EmailService(IOptions<EmailSettings> options, IAppLogger logger)
        {
            _email = options.Value;
            _logger = logger;
        }

        public async Task SendOtpAsync(string toEmail, string otp)
        {
            try
            {
                var message = new MimeMessage();

                message.From.Add(new MailboxAddress("FlexChat", _email.From));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = "OTP Verification";

                message.Body = new TextPart("plain")
                {
                    Text = $"Your OTP is: {otp}. It expires in 5 minutes."
                };

                using var client = new SmtpClient();

                await client.ConnectAsync(_email.Host, _email.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_email.UserName, _email.Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (SmtpCommandException ex)
            {
                _logger.Error(ex, $"SMTP command failed while sending OTP to {toEmail}");
                throw new BusinessException("Failed to send OTP email.");
            }
            catch (SmtpProtocolException ex)
            {
                _logger.Error(ex, $"SMTP protocol error while sending OTP to {toEmail}");
                throw new BusinessException("Email service is temporarily unavailable.");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, $"Unexpected error while sending OTP to {toEmail}");
                throw new BusinessException("Unable to send OTP. Please try again later.");
            }
        }
    }
}