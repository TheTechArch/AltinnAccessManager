namespace AltinnAccessManager.Server.Configuration;

/// <summary>
/// Configuration settings for the Altinn Client Delegation Admin API.
/// </summary>
public class AltinnClientAdminSettings
{
    /// <summary>
    /// Gets or sets the base URL for the Altinn Enduser API.
    /// </summary>
    public string BaseUrl { get; set; } = "https://platform.tt02.altinn.no";

    /// <summary>
    /// Gets or sets the base path for the client delegation endpoints.
    /// </summary>
    public string BasePath { get; set; } = "/accessmanagement/api/v1/enduser/clientdelegations";
}
