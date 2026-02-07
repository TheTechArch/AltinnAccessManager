namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for ID-porten integration.
/// </summary>
public class IdPortenSettings
{
    /// <summary>
    /// The client ID registered with ID-porten.
    /// </summary>
    public required string ClientId { get; set; }

    /// <summary>
    /// The client secret for confidential clients. Optional if using other auth methods.
    /// </summary>
    public string? ClientSecret { get; set; }

    /// <summary>
    /// The scopes to request during authentication.
    /// </summary>
    public required string Scopes { get; set; }

    /// <summary>
    /// The redirect URI for the callback endpoint.
    /// </summary>
    public required string RedirectUri { get; set; }

    /// <summary>
    /// The authorization endpoint URL.
    /// </summary>
    public required string AuthorizationEndpoint { get; set; }

    /// <summary>
    /// The token endpoint URL.
    /// </summary>
    public required string TokenEndpoint { get; set; }

    /// <summary>
    /// The authentication method to use (e.g., "client_secret_post", "client_secret_basic", "private_key_jwt").
    /// </summary>
    public string AuthMethod { get; set; } = "client_secret_post";

    /// <summary>
    /// Indicates whether this is a test environment.
    /// </summary>
    public bool IsTestEnvironment { get; set; } = true;
}
