using AltinnAccessManager.Server.Models;
using AltinnAccessManager.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AltinnAccessManager.Server.Controllers;

/// <summary>
/// Controller handling front-channel authentication flows with ID-porten.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    private readonly IIdPortenService _idPortenService;
    private readonly IAltinnAuthenticationService _altinnAuthenticationService;
    private readonly ILogger<AuthenticationController> _logger;

    // Cookie expiration time (72 hours)
    private static readonly TimeSpan CookieExpiration = TimeSpan.FromHours(72);

    // In-memory state store - in production, use distributed cache (Redis) or database
    private static readonly Dictionary<string, AuthorizationState> _stateStore = new();
    private static readonly object _stateLock = new();

    public AuthenticationController(
        IIdPortenService idPortenService,
        IAltinnAuthenticationService altinnAuthenticationService,
        ILogger<AuthenticationController> logger)
    {
        _idPortenService = idPortenService;
        _altinnAuthenticationService = altinnAuthenticationService;
        _logger = logger;
    }

    /// <summary>
    /// Initiates the login flow by redirecting to ID-porten.
    /// </summary>
    /// <param name="returnUrl">Optional URL to redirect to after successful authentication.</param>
    /// <returns>Redirect to ID-porten authorization endpoint.</returns>
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl = null)
    {
        _logger.LogInformation("Initiating ID-porten login flow");

        var (authorizationUrl, state) = _idPortenService.GenerateAuthorizationUrl(returnUrl);

        // Store state for validation during callback
        lock (_stateLock)
        {
            // Clean up expired states (older than 10 minutes)
            var expiredStates = _stateStore
                .Where(kvp => kvp.Value.CreatedAt < DateTimeOffset.UtcNow.AddMinutes(-10))
                .Select(kvp => kvp.Key)
                .ToList();
            
            foreach (var expiredState in expiredStates)
            {
                _stateStore.Remove(expiredState);
            }

            _stateStore[state.State] = state;
        }

        return Redirect(authorizationUrl);
    }

    /// <summary>
    /// Callback endpoint for ID-porten after authentication.
    /// </summary>
    /// <param name="code">The authorization code from ID-porten.</param>
    /// <param name="state">The state parameter for CSRF validation.</param>
    /// <param name="error">Error code if authentication failed.</param>
    /// <param name="errorDescription">Error description if authentication failed.</param>
    /// <returns>Redirect to the application with authentication result.</returns>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        [FromQuery(Name = "error_description")] string? errorDescription)
    {
        _logger.LogInformation("Received callback from ID-porten");

        // Handle error response from ID-porten
        if (!string.IsNullOrEmpty(error))
        {
            _logger.LogWarning("ID-porten returned error: {Error} - {Description}", error, errorDescription);
            return Redirect($"/?error={Uri.EscapeDataString(error)}&error_description={Uri.EscapeDataString(errorDescription ?? "")}");
        }

        // Validate required parameters
        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            _logger.LogWarning("Missing code or state parameter in callback");
            return Redirect("/?error=invalid_callback&error_description=Missing+required+parameters");
        }

        // Validate and retrieve stored state
        AuthorizationState? storedState;
        lock (_stateLock)
        {
            if (!_stateStore.TryGetValue(state, out storedState))
            {
                _logger.LogWarning("Invalid or expired state parameter");
                return Redirect("/?error=invalid_state&error_description=State+parameter+is+invalid+or+expired");
            }

            // Remove used state
            _stateStore.Remove(state);
        }

        // Exchange code for tokens
        TokenResponse? tokenResponse = await _idPortenService.ExchangeCodeForTokensAsync(code, storedState);

        if (tokenResponse == null)
        {
            _logger.LogError("Failed to exchange authorization code for tokens");
            return Redirect("/?error=token_exchange_failed&error_description=Failed+to+exchange+authorization+code");
        }

        _logger.LogInformation("Successfully authenticated user via ID-porten");

        // Exchange ID-porten access token for Altinn token
        string? altinnToken = null;
        if (!string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            altinnToken = await _altinnAuthenticationService.ExchangeTokenAsync(tokenResponse.AccessToken);
            if (altinnToken == null)
            {
                _logger.LogWarning("Failed to exchange ID-porten token for Altinn token, continuing without Altinn token");
            }
            else
            {
                _logger.LogInformation("Successfully exchanged ID-porten token for Altinn token");
            }
        }

        // Store tokens in HTTP-only cookie for security
        // Use 72 hours expiration for longer session duration
        CookieOptions cookieOptions = new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(CookieExpiration)
        };

        Response.Cookies.Append("access_token", tokenResponse.AccessToken ?? "", cookieOptions);
        
        if (!string.IsNullOrEmpty(tokenResponse.IdToken))
        {
            Response.Cookies.Append("id_token", tokenResponse.IdToken, cookieOptions);
        }

        // Store Altinn token in HTTP-only cookie
        if (!string.IsNullOrEmpty(altinnToken))
        {
            Response.Cookies.Append("altinn_token", altinnToken, cookieOptions);
        }

        if (!string.IsNullOrEmpty(tokenResponse.RefreshToken))
        {
            // Refresh token gets same expiration as other cookies
            Response.Cookies.Append("refresh_token", tokenResponse.RefreshToken, cookieOptions);
        }

        // Store token expiration time for refresh logic
        Response.Cookies.Append("token_expires_at", 
            DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn).ToUnixTimeSeconds().ToString(), 
            new CookieOptions
            {
                HttpOnly = false, // Allow JavaScript to read this for refresh timing
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.Add(CookieExpiration)
            });

        // Redirect to the original return URL or home page
        string redirectUrl = storedState.ReturnUrl ?? "/";
        return Redirect($"{redirectUrl}?login=success");
    }

    /// <summary>
    /// Logs out the user by clearing authentication cookies.
    /// </summary>
    /// <returns>Redirect to home page.</returns>
    [HttpGet("logout")]
    public IActionResult Logout()
    {
        _logger.LogInformation("User logging out");

        Response.Cookies.Delete("access_token");
        Response.Cookies.Delete("id_token");
        Response.Cookies.Delete("refresh_token");
        Response.Cookies.Delete("altinn_token");

        return Redirect("/?logout=success");
    }

    /// <summary>
    /// Returns the current authentication status.
    /// </summary>
    /// <returns>Authentication status information.</returns>
    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var hasAccessToken = Request.Cookies.ContainsKey("access_token") && 
                            !string.IsNullOrEmpty(Request.Cookies["access_token"]);

        var hasAltinnToken = Request.Cookies.ContainsKey("altinn_token") && 
                            !string.IsNullOrEmpty(Request.Cookies["altinn_token"]);

        var hasRefreshToken = Request.Cookies.ContainsKey("refresh_token") &&
                             !string.IsNullOrEmpty(Request.Cookies["refresh_token"]);

        // Check if token is expired or about to expire (within 5 minutes)
        var needsRefresh = false;
        if (Request.Cookies.TryGetValue("token_expires_at", out var expiresAtStr) && 
            long.TryParse(expiresAtStr, out var expiresAt))
        {
            var expirationTime = DateTimeOffset.FromUnixTimeSeconds(expiresAt);
            needsRefresh = expirationTime <= DateTimeOffset.UtcNow.AddMinutes(5);
        }

        return Ok(new
        {
            IsAuthenticated = hasAccessToken,
            HasAltinnToken = hasAltinnToken,
            HasRefreshToken = hasRefreshToken,
            NeedsRefresh = needsRefresh && hasRefreshToken,
            Message = hasAccessToken ? "User is authenticated" : "User is not authenticated"
        });
    }

    /// <summary>
    /// Refreshes the access token using the refresh token.
    /// </summary>
    /// <returns>Result of the refresh operation.</returns>
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        _logger.LogInformation("Attempting to refresh tokens");

        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            _logger.LogWarning("No refresh token available");
            return Unauthorized(new { Message = "No refresh token available" });
        }

        var tokenResponse = await _idPortenService.RefreshTokenAsync(refreshToken);
        if (tokenResponse == null)
        {
            _logger.LogError("Failed to refresh tokens");
            // Clear cookies since refresh failed
            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("id_token");
            Response.Cookies.Delete("refresh_token");
            Response.Cookies.Delete("altinn_token");
            Response.Cookies.Delete("token_expires_at");
            return Unauthorized(new { Message = "Failed to refresh tokens. Please log in again." });
        }

        _logger.LogInformation("Successfully refreshed tokens from ID-porten");

        // Exchange new ID-porten access token for Altinn token
        string? altinnToken = null;
        if (!string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            altinnToken = await _altinnAuthenticationService.ExchangeTokenAsync(tokenResponse.AccessToken);
            if (altinnToken == null)
            {
                _logger.LogWarning("Failed to exchange refreshed ID-porten token for Altinn token");
            }
            else
            {
                _logger.LogInformation("Successfully exchanged refreshed token for Altinn token");
            }
        }

        // Update cookies with new tokens
        CookieOptions cookieOptions = new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(CookieExpiration)
        };

        Response.Cookies.Append("access_token", tokenResponse.AccessToken ?? "", cookieOptions);
        
        if (!string.IsNullOrEmpty(tokenResponse.IdToken))
        {
            Response.Cookies.Append("id_token", tokenResponse.IdToken, cookieOptions);
        }

        if (!string.IsNullOrEmpty(altinnToken))
        {
            Response.Cookies.Append("altinn_token", altinnToken, cookieOptions);
        }

        // Update refresh token if a new one was provided
        if (!string.IsNullOrEmpty(tokenResponse.RefreshToken))
        {
            Response.Cookies.Append("refresh_token", tokenResponse.RefreshToken, cookieOptions);
        }

        // Update token expiration time
        Response.Cookies.Append("token_expires_at", 
            DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn).ToUnixTimeSeconds().ToString(), 
            new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.Add(CookieExpiration)
            });

        return Ok(new 
        { 
            Message = "Tokens refreshed successfully",
            ExpiresIn = tokenResponse.ExpiresIn
        });
    }
}
