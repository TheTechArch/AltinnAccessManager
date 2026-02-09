namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for the Altinn Metadata API.
/// </summary>
public class AltinnMetadataSettings
{
    /// <summary>
    /// Gets or sets the base URL for the Altinn Metadata API.
    /// </summary>
    public string BaseUrl { get; set; } = "https://platform.tt02.altinn.no";

    /// <summary>
    /// Gets or sets the base path for the metadata API endpoints.
    /// </summary>
    public string BasePath { get; set; } = "/accessmanagement/api/v1/meta";
}
