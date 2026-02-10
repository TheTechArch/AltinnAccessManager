using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;
using AltinnAccessManager.Server.Configuration;
using AltinnAccessManager.Server.Models;
using Microsoft.Extensions.Options;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service for handling ID-porten authentication flows.
/// </summary>
public class IdPortenService : IIdPortenService
{
    private readonly HttpClient _httpClient;
    private readonly IdPortenSettings _settings;
    private readonly ILogger<IdPortenService> _logger;

    public IdPortenService(
        HttpClient httpClient,
        IOptions<IdPortenSettings> settings,
        ILogger<IdPortenService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public (string AuthorizationUrl, AuthorizationState State) GenerateAuthorizationUrl(string? returnUrl = null)
    {
        // Generate PKCE code verifier and challenge
        var codeVerifier = GenerateCodeVerifier();
        var codeChallenge = GenerateCodeChallenge(codeVerifier);

        // Generate state and nonce for security
        var state = GenerateRandomString(32);
        var nonce = GenerateRandomString(32);

        var authState = new AuthorizationState
        {
            State = state,
            CodeVerifier = codeVerifier,
            Nonce = nonce,
            ReturnUrl = returnUrl
        };

        // Build the authorization URL
        var queryParams = new Dictionary<string, string>
        {
            ["client_id"] = _settings.ClientId,
            ["redirect_uri"] = _settings.RedirectUri,
            ["response_type"] = "code",
            ["scope"] = _settings.Scopes,
            ["state"] = state,
            ["nonce"] = nonce,
            ["code_challenge"] = codeChallenge,
            ["code_challenge_method"] = "S256",
            ["ui_locales"] = "nb" // Norwegian Bokmål
        };

        var queryString = string.Join("&", queryParams.Select(p => $"{p.Key}={HttpUtility.UrlEncode(p.Value)}"));
        var authorizationUrl = $"{_settings.AuthorizationEndpoint}?{queryString}";

        _logger.LogInformation("Generated authorization URL for ID-porten login");

        return (authorizationUrl, authState);
    }

    /// <inheritdoc />
    public async Task<TokenResponse?> ExchangeCodeForTokensAsync(string code, AuthorizationState state)
    {
        try
        {
            var tokenRequestParams = new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = _settings.RedirectUri,
                ["client_id"] = _settings.ClientId,
                ["code_verifier"] = state.CodeVerifier
            };

            // Add client secret based on auth method
            if (_settings.AuthMethod == "client_secret_post" && !string.IsNullOrEmpty(_settings.ClientSecret))
            {
                tokenRequestParams["client_secret"] = _settings.ClientSecret;
            }

            var request = new HttpRequestMessage(HttpMethod.Post, _settings.TokenEndpoint)
            {
                Content = new FormUrlEncodedContent(tokenRequestParams)
            };

            // Add basic auth header if using client_secret_basic
            if (_settings.AuthMethod == "client_secret_basic" && !string.IsNullOrEmpty(_settings.ClientSecret))
            {
                var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.ClientSecret}"));
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            }

            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Token exchange failed with status {StatusCode}: {Content}", response.StatusCode, content);
                return null;
            }

            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(content);
            _logger.LogInformation("Successfully exchanged authorization code for tokens");

            return tokenResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exchanging authorization code for tokens");
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<TokenResponse?> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var tokenRequestParams = new Dictionary<string, string>
            {
                ["grant_type"] = "refresh_token",
                ["refresh_token"] = refreshToken,
                ["client_id"] = _settings.ClientId
            };

            // Add client secret based on auth method
            if (_settings.AuthMethod == "client_secret_post" && !string.IsNullOrEmpty(_settings.ClientSecret))
            {
                tokenRequestParams["client_secret"] = _settings.ClientSecret;
            }

            var request = new HttpRequestMessage(HttpMethod.Post, _settings.TokenEndpoint)
            {
                Content = new FormUrlEncodedContent(tokenRequestParams)
            };

            // Add basic auth header if using client_secret_basic
            if (_settings.AuthMethod == "client_secret_basic" && !string.IsNullOrEmpty(_settings.ClientSecret))
            {
                var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.ClientSecret}"));
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            }

            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Token refresh failed with status {StatusCode}: {Content}", response.StatusCode, content);
                return null;
            }

            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(content);
            _logger.LogInformation("Successfully refreshed tokens");

            return tokenResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing tokens");
            return null;
        }
    }

    /// <summary>
    /// Generates a cryptographically secure random code verifier for PKCE.
    /// </summary>
    private static string GenerateCodeVerifier()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Base64UrlEncode(bytes);
    }

    /// <summary>
    /// Generates the code challenge from the code verifier using SHA256.
    /// </summary>
    private static string GenerateCodeChallenge(string codeVerifier)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.ASCII.GetBytes(codeVerifier);
        var hash = sha256.ComputeHash(bytes);
        return Base64UrlEncode(hash);
    }

    /// <summary>
    /// Generates a cryptographically secure random string.
    /// </summary>
    private static string GenerateRandomString(int length)
    {
        var bytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Base64UrlEncode(bytes);
    }

    /// <summary>
    /// Base64 URL encodes the given bytes.
    /// </summary>
    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}
