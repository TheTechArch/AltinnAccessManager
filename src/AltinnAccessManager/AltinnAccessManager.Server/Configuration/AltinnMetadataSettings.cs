namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for the Altinn Metadata API.
/// </summary>
public class AltinnMetadataSettings
{
    /// <summary>
    /// Gets or sets the base URL for the TT02 environment.
    /// </summary>
    public string TT02BaseUrl { get; set; } = "https://platform.tt02.altinn.no";

    /// <summary>
    /// Gets or sets the base URL for the Production environment.
    /// </summary>
    public string ProdBaseUrl { get; set; } = "https://platform.altinn.no";

    /// <summary>
    /// Gets or sets the base path for the metadata API endpoints.
    /// </summary>
    public string BasePath { get; set; } = "/accessmanagement/api/v1/meta";

    /// <summary>
    /// Gets the base URL for the specified environment.
    /// </summary>
    public string GetBaseUrl(string? environment) => 
        string.Equals(environment, "prod", StringComparison.OrdinalIgnoreCase) 
            ? ProdBaseUrl 
            : TT02BaseUrl;
}
