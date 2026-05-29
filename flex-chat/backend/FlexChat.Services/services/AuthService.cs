using FlexChat.DAL.Repositories.Interfaces;
using FlexChat.Data.Models;
using FlexChat.Services.dtos;
using FlexChat.Services.interfaces;
using Infrastructure.Exceptions;
using Infrastructure.Logger;
using Infrastructure.settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace FlexChat.Services.services
{

    public class AuthService : IAuthService
    {
        private readonly JwtSettings _jwt;
        private readonly IAppLogger _logger;
        private readonly IEmailService _emailService;
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(IUnitOfWork unitOfWork, IOptions<JwtSettings> jwtOptions, IEmailService emailService, IAppLogger logger)
        {
            _unitOfWork = unitOfWork;
            _jwt = jwtOptions.Value;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto request)
        {
            try
            {
                var user = await _unitOfWork
                    .Repository<User>()
                    .FirstOrDefaultAsync(x => x.Username == request.Username && !x.IsDeleted);

                if (user == null)
                    throw new BusinessException("Invalid username or password");

                var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

                if (!isPasswordValid)
                    throw new BusinessException("Invalid username or password");

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = "User",
                    Username = user.Username,
                };

                var authResponse = await GenerateTokenPairAsync(userDto);

                var session = new UserSession
                {
                    UserId = user.Id,
                    RefreshToken = authResponse.RefreshToken,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(7)
                };

                await _unitOfWork.Repository<UserSession>().AddAsync(session);
                await _unitOfWork.SaveChangesAsync();

                return authResponse;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in AuthService.LoginAsync");
                throw;
            }
        }

        public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                    throw new BusinessException("Invalid refresh token");

                var session = await _unitOfWork
                    .Repository<UserSession>()
                    .Query()
                    .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);

                if (session == null)
                    throw new UnauthorizedAccessException("Invalid refresh token");

                if (session.ExpiresAt < DateTime.UtcNow)
                    throw new BusinessException("Refresh token expired");

                var user = await _unitOfWork
                    .Repository<User>()
                    .FirstOrDefaultAsync(x => x.Id == session.UserId && !x.IsDeleted);

                if (user == null)
                    throw new BusinessException("User not found");

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = "User",
                    Username = user.Username,

                };

                var newTokens = await GenerateTokenPairAsync(userDto);

                session.RefreshToken = newTokens.RefreshToken;
                session.CreatedAt = DateTime.UtcNow;
                session.ExpiresAt = DateTime.UtcNow.AddDays(7);

                _unitOfWork.Repository<UserSession>().Update(session);
                await _unitOfWork.SaveChangesAsync();

                return newTokens;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in AuthService.RefreshTokenAsync");
                throw new UnauthorizedAccessException("Failed to refresh token");
            }
        }

        public async Task RevokeTokenAsync(string username)
        {
            try
            {
                var user = await _unitOfWork
                    .Repository<User>()
                    .FirstOrDefaultAsync(x => x.Username == username && !x.IsDeleted);

                if (user == null)
                    return;

                var sessions = await _unitOfWork
                    .Repository<UserSession>()
                    .Query()
                    .Where(x => x.UserId == user.Id)
                    .ToListAsync();

                foreach (var session in sessions)
                {
                    _unitOfWork.Repository<UserSession>().Delete(session);
                }

                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in AuthService.RevokeTokenAsync");
                throw new BusinessException("Failed to revoke token");
            }
        }

        public async Task RegisterAsync(string email)
        {
            try
            {
                var existingUser = await _unitOfWork
                    .Repository<User>()
                    .FirstOrDefaultAsync(x => x.Email == email && !x.IsDeleted);

                if (existingUser != null)
                    throw new BusinessException("User already registered. Please login.");

                var otp = new Random().Next(100000, 999999).ToString();

                var hashedOtp = BCrypt.Net.BCrypt.HashPassword(otp);

                var userOtp = new UserOtp
                {
                    Email = email,
                    OtpHash = hashedOtp,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                    IsUsed = false
                };

                await _unitOfWork.Repository<UserOtp>().AddAsync(userOtp);
                await _unitOfWork.SaveChangesAsync();

                await _emailService.SendOtpAsync(email, otp);
            }
            catch (BusinessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in AuthService.RegisterAsync");
                throw new BusinessException("Failed to process registration.");
            }
        }
        public async Task<AuthResponseDto?> VerifyOtpAndRegisterAsync(VerifyOtpDto request)
        {
            try
            {
                var otpRecord = await _unitOfWork
                    .Repository<UserOtp>()
                    .Query()
                    .Where(x => x.Email == request.Email)
                    .OrderByDescending(x => x.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otpRecord == null)
                    throw new BusinessException("OTP not found");

                if (otpRecord.ExpiresAt < DateTime.UtcNow)
                    throw new BusinessException("OTP expired");

                if (otpRecord.IsUsed)
                    throw new BusinessException("OTP already used");

                var isValidOtp = BCrypt.Net.BCrypt.Verify(request.Otp, otpRecord.OtpHash);

                if (!isValidOtp)
                    throw new BusinessException("Invalid OTP");

                otpRecord.IsUsed = true;
                _unitOfWork.Repository<UserOtp>().Update(otpRecord);

                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<User>().AddAsync(user);

                await _unitOfWork.SaveChangesAsync();

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    Role = "User"
                };

                var authResponse = await GenerateTokenPairAsync(userDto);

                var session = new UserSession
                {
                    UserId = user.Id,
                    RefreshToken = authResponse.RefreshToken,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(7)
                };

                await _unitOfWork.Repository<UserSession>().AddAsync(session);

                await _unitOfWork.SaveChangesAsync();

                return authResponse;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in AuthService.VerifyOtpAndRegisterAsync");
                throw new BusinessException("Failed to verify OTP.");
            }
        }
        private async Task<AuthResponseDto> GenerateTokenPairAsync(UserDto user)
        {
            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            return await Task.FromResult(new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes)
            });
        }

        private string GenerateAccessToken(UserDto user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwt.Key)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes);
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            try
            {
                username = username.Trim();
                var exists = await _unitOfWork.Repository<User>()
                .Query()
                   .AnyAsync(u => u.Username != null &&
                   u.Username.ToLower() == username.ToLower());

                return !exists;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in UserService.IsUsernameAvailableAsync");
                throw new BusinessException("Failed to check username availability");
            }
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            try
            {
                email = email.Trim();
                var exists = await _unitOfWork.Repository<User>()
                    .Query()
                    .AnyAsync(u => u.Email != null &&
                        u.Email.ToLower() == email.ToLower() && !u.IsDeleted);

                return !exists;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error in AuthService.IsEmailAvailableAsync");
                throw new BusinessException("Failed to check email availability");
            }
        }
    }
}
