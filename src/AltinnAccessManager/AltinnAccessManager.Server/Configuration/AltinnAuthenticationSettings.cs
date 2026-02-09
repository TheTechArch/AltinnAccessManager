namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for Altinn Authentication integration.
/// </summary>
public class AltinnAuthenticationSettings
{
    /// <summary>
    /// The base URL for Altinn Authentication API.
    /// </summary>
    public required string BaseUrl { get; set; }

    /// <summary>
    /// The token exchange endpoint path.
    /// </summary>
    public string ExchangeEndpoint { get; set; } = "/authentication/api/v1/exchange/id-porten";

    /// <summary>
    /// Indicates whether this is a test environment.
    /// </summary>
    public bool IsTestEnvironment { get; set; } = true;
}
