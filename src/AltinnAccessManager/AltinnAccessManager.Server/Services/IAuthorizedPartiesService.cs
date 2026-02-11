using Altinn.Authorization.Api.Contracts.AccessManagement;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service interface for retrieving authorized parties from Altinn.
/// </summary>
public interface IAuthorizedPartiesService
{
    /// <summary>
    /// Gets the list of parties the authenticated user can represent.
    /// </summary>
    /// <param name="includeAltinn2">Include Altinn 2 authorizations.</param>
    /// <param name="includeAltinn3">Include Altinn 3 authorizations.</param>
    /// <param name="includeRoles">Include role information.</param>
    /// <param name="includeAccessPackages">Include access package information.</param>
    /// <param name="includeResources">Include resource information.</param>
    /// <param name="includeInstances">Include instance information.</param>
    /// <param name="anyOfResourceIds">Filter parties that have access to any of these resource IDs.</param>
    /// <param name="altinnToken">The Altinn authentication token.</param>
    /// <returns>List of authorized parties.</returns>
    Task<List<AuthorizedPartyExternal>?> GetAuthorizedPartiesAsync(
        bool includeAltinn2 = false,
        bool includeAltinn3 = true,
        bool includeRoles = false,
        bool includeAccessPackages = false,
        bool includeResources = false,
        bool includeInstances = false,
        List<string>? anyOfResourceIds = null,
        string? altinnToken = null);
}
