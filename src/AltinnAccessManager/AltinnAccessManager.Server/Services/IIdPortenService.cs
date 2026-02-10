using AltinnAccessManager.Server.Models;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Interface for ID-porten authentication service.
/// </summary>
public interface IIdPortenService
{
    /// <summary>
    /// Generates the authorization URL to redirect the user to ID-porten.
    /// </summary>
    /// <param name="returnUrl">Optional URL to redirect to after successful authentication.</param>
    /// <returns>The authorization URL and the state to store.</returns>
    (string AuthorizationUrl, AuthorizationState State) GenerateAuthorizationUrl(string? returnUrl = null);

    /// <summary>
    /// Exchanges the authorization code for tokens.
    /// </summary>
    /// <param name="code">The authorization code received from ID-porten.</param>
    /// <param name="state">The authorization state containing the code verifier.</param>
    /// <returns>The token response from ID-porten.</returns>
    Task<TokenResponse?> ExchangeCodeForTokensAsync(string code, AuthorizationState state);

    /// <summary>
    /// Refreshes the access token using a refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token.</param>
    /// <returns>The new token response from ID-porten.</returns>
    Task<TokenResponse?> RefreshTokenAsync(string refreshToken);
}
