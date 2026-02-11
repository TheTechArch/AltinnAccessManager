using Altinn.Authorization.Api.Contracts.AccessManagement;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Interface for interacting with the Altinn Connections API.
/// Provides methods to manage direct rights (access packages, roles, resources) given to persons and organizations.
/// </summary>
public interface IConnectionsService
{
    #region Connections (Base)

    /// <summary>
    /// Gets all connections (parties that have been given rights) for a party.
    /// </summary>
    /// <param name="party">The party UUID (can be "me" for logged-in user).</param>
    /// <param name="from">The from party filter (can be "me", "all", blank, or UUID).</param>
    /// <param name="to">The to party filter (can be "me", "all", blank, or UUID).</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>Paginated list of connections.</returns>
    Task<PaginatedResult<ConnectionDto>?> GetConnectionsAsync(
        string party,
        string? from = null,
        string? to = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null);

    /// <summary>
    /// Adds a new connection (gives rights to a party).
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="person">Optional person input for lookup.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>The created assignment.</returns>
    Task<AssignmentDto?> AddConnectionAsync(
        string party,
        string? from,
        string? to,
        PersonInput? person,
        string? altinnToken = null);

    /// <summary>
    /// Removes a connection (revokes all rights from a party).
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="cascade">Whether to cascade delete all delegations.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>True if successful.</returns>
    Task<bool> DeleteConnectionAsync(
        string party,
        string? from,
        string? to,
        bool cascade = false,
        string? altinnToken = null);

    #endregion

    #region Access Packages

    /// <summary>
    /// Gets access packages for connections.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>Paginated list of package permissions.</returns>
    Task<PaginatedResult<PackagePermissionDto>?> GetAccessPackagesAsync(
        string party,
        string? from = null,
        string? to = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null);

    /// <summary>
    /// Adds an access package to a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="packageId">The package UUID (optional if package URN is provided).</param>
    /// <param name="package">The package URN (optional if packageId is provided).</param>
    /// <param name="person">Optional person input for lookup.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>The created assignment package.</returns>
    Task<AssignmentPackageDto?> AddAccessPackageAsync(
        string party,
        string? from,
        string? to,
        Guid? packageId,
        string? package,
        PersonInput? person,
        string? altinnToken = null);

    /// <summary>
    /// Removes an access package from a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="packageId">The package UUID (optional if package URN is provided).</param>
    /// <param name="package">The package URN (optional if packageId is provided).</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>True if successful.</returns>
    Task<bool> DeleteAccessPackageAsync(
        string party,
        string? from,
        string? to,
        Guid? packageId,
        string? package,
        string? altinnToken = null);

    /// <summary>
    /// Performs a delegation check for access packages.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="packageIds">List of package UUIDs to check.</param>
    /// <param name="packages">List of package URNs to check.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>Paginated list of delegation check results.</returns>
    Task<PaginatedResult<AccessPackageDto.AccessPackageDtoCheck>?> CheckAccessPackageDelegationAsync(
        Guid party,
        Guid[]? packageIds,
        string[]? packages,
        string? altinnToken = null);

    #endregion

    #region Roles

    /// <summary>
    /// Gets roles for connections.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>Paginated list of role permissions.</returns>
    Task<PaginatedResult<RolePermissionDto>?> GetRolesAsync(
        string party,
        string? from = null,
        string? to = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null);

    /// <summary>
    /// Removes a role from a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="roleCode">The role code to remove.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>True if successful.</returns>
    Task<bool> DeleteRoleAsync(
        string party,
        string? from,
        string? to,
        string roleCode,
        string? altinnToken = null);

    #endregion

    #region Resources

    /// <summary>
    /// Gets resources for connections.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">Optional resource filter.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>Paginated list of resource permissions.</returns>
    Task<PaginatedResult<ResourcePermissionDto>?> GetResourcesAsync(
        string party,
        string? from = null,
        string? to = null,
        string? resource = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null);

    /// <summary>
    /// Adds resource rights to a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <param name="actions">List of actions to add.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>The created assignment resource.</returns>
    Task<AssignmentResourceDto?> AddResourceAsync(
        string party,
        string? from,
        string? to,
        string resource,
        string[] actions,
        string? altinnToken = null);

    /// <summary>
    /// Updates resource rights for a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <param name="actions">List of actions to set.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>The updated assignment resource.</returns>
    Task<AssignmentResourceDto?> UpdateResourceAsync(
        string party,
        string? from,
        string? to,
        string resource,
        string[] actions,
        string? altinnToken = null);

    /// <summary>
    /// Removes resource rights from a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>True if successful.</returns>
    Task<bool> DeleteResourceAsync(
        string party,
        string? from,
        string? to,
        string resource,
        string? altinnToken = null);

    /// <summary>
    /// Performs a delegation check for resources.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <param name="altinnToken">The Altinn token for authorization.</param>
    /// <returns>Resource delegation check result.</returns>
    Task<ResourceCheckDto?> CheckResourceDelegationAsync(
        Guid party,
        string resource,
        string? altinnToken = null);

    #endregion
}
