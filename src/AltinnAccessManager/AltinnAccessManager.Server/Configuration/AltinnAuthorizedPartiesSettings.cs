namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for the Altinn Authorized Parties API.
/// </summary>
public class AltinnAuthorizedPartiesSettings
{
    /// <summary>
    /// Gets or sets the base URL for the Altinn Access Management API.
    /// </summary>
    public string BaseUrl { get; set; } = "https://platform.tt02.altinn.no";

    /// <summary>
    /// Gets or sets the base path for the authorized parties endpoint.
    /// </summary>
    public string BasePath { get; set; } = "/accessmanagement/api/v1/authorizedparties";
}
