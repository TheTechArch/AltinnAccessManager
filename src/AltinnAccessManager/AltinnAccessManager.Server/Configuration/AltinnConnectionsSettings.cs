namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for the Altinn Connections API.
/// </summary>
public class AltinnConnectionsSettings
{
    /// <summary>
    /// Gets or sets the base URL for the Altinn Enduser API.
    /// </summary>
    public string BaseUrl { get; set; } = "https://platform.tt02.altinn.no";

    /// <summary>
    /// Gets or sets the base path for the connections endpoints.
    /// </summary>
    public string BasePath { get; set; } = "/accessmanagement/api/v1/enduser/connections";
}
