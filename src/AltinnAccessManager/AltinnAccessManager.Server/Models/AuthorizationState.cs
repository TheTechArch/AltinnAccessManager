namespace AltinnAccessManager.Server.Models;

/// <summary>
/// Represents the authorization state for OIDC flow.
/// </summary>
public class AuthorizationState
{
    /// <summary>
    /// The state parameter used to prevent CSRF attacks.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// The PKCE code verifier.
    /// </summary>
    public required string CodeVerifier { get; set; }

    /// <summary>
    /// The nonce used to prevent replay attacks.
    /// </summary>
    public required string Nonce { get; set; }

    /// <summary>
    /// The URL to redirect to after successful authentication.
    /// </summary>
    public string? ReturnUrl { get; set; }

    /// <summary>
    /// The timestamp when this state was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
