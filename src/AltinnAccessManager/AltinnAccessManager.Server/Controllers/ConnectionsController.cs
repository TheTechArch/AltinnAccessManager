using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AltinnAccessManager.Server.Controllers;

/// <summary>
/// Controller exposing Connections API endpoints.
/// Allows users to manage direct rights (access packages, roles, resources) given to persons and organizations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ConnectionsController : ControllerBase
{
    private readonly IConnectionsService _connectionsService;
    private readonly ILogger<ConnectionsController> _logger;

    public ConnectionsController(
        IConnectionsService connectionsService,
        ILogger<ConnectionsController> logger)
    {
        _connectionsService = connectionsService;
        _logger = logger;
    }

    private string? GetAltinnToken()
    {
        return Request.Cookies["altinn_token"];
    }

    #region Connections (Base)

    /// <summary>
    /// Gets all connections (parties that have been given rights) for a party.
    /// </summary>
    /// <param name="party">The party UUID or "me" for logged-in user.</param>
    /// <param name="from">Optional from party filter (can be "me", "all", blank, or UUID).</param>
    /// <param name="to">Optional to party filter (can be "me", "all", blank, or UUID).</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <returns>Paginated list of connections.</returns>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ConnectionDto>>> GetConnections(
        [FromQuery] string party,
        [FromQuery] string? from = null,
        [FromQuery] string? to = null,
        [FromQuery] uint? pageSize = null,
        [FromQuery] uint? pageNumber = null)
    {
        _logger.LogInformation("Getting connections for party: {Party}, from: {From}, to: {To}", party, from, to);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.GetConnectionsAsync(party, from, to, pageSize, pageNumber, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve connections from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Adds a new connection (gives rights to a party).
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">Optional from party filter.</param>
    /// <param name="to">Optional to party filter (UUID if known).</param>
    /// <param name="person">Person identifier and last name for lookup (if to is not provided).</param>
    /// <returns>The created assignment.</returns>
    [HttpPost]
    public async Task<ActionResult<AssignmentDto>> AddConnection(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromBody] PersonInput? person)
    {
        _logger.LogInformation("Adding connection for party: {Party}, from: {From}, to: {To}", party, from, to);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.AddConnectionAsync(party, from, to, person, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to add connection via Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Removes a connection (revokes all rights from a party).
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="cascade">Whether to cascade delete all delegations.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete]
    public async Task<IActionResult> DeleteConnection(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] bool cascade = false)
    {
        _logger.LogInformation("Deleting connection for party: {Party}, from: {From}, to: {To}, cascade: {Cascade}", party, from, to, cascade);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var success = await _connectionsService.DeleteConnectionAsync(party, from, to, cascade, altinnToken);
        if (!success)
        {
            return StatusCode(502, "Failed to delete connection via Altinn API");
        }

        return NoContent();
    }

    #endregion

    #region Access Packages

    /// <summary>
    /// Gets access packages for connections.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">Optional from party filter.</param>
    /// <param name="to">Optional to party filter.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <returns>Paginated list of package permissions.</returns>
    [HttpGet("accesspackages")]
    public async Task<ActionResult<PaginatedResult<PackagePermissionDto>>> GetAccessPackages(
        [FromQuery] string party,
        [FromQuery] string? from = null,
        [FromQuery] string? to = null,
        [FromQuery] uint? pageSize = null,
        [FromQuery] uint? pageNumber = null)
    {
        _logger.LogInformation("Getting access packages for party: {Party}, from: {From}, to: {To}", party, from, to);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.GetAccessPackagesAsync(party, from, to, pageSize, pageNumber, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve access packages from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Adds an access package to a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="packageId">The package UUID (optional if package URN is provided).</param>
    /// <param name="package">The package URN (optional if packageId is provided).</param>
    /// <param name="person">Optional person input for lookup.</param>
    /// <returns>The created assignment package.</returns>
    [HttpPost("accesspackages")]
    public async Task<ActionResult<AssignmentPackageDto>> AddAccessPackage(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] Guid? packageId,
        [FromQuery] string? package,
        [FromBody] PersonInput? person)
    {
        _logger.LogInformation("Adding access package for party: {Party}, package: {Package}", party, package ?? packageId?.ToString());

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.AddAccessPackageAsync(party, from, to, packageId, package, person, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to add access package via Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Removes an access package from a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="packageId">The package UUID (optional if package URN is provided).</param>
    /// <param name="package">The package URN (optional if packageId is provided).</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("accesspackages")]
    public async Task<IActionResult> DeleteAccessPackage(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] Guid? packageId,
        [FromQuery] string? package)
    {
        _logger.LogInformation("Deleting access package for party: {Party}, package: {Package}", party, package ?? packageId?.ToString());

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var success = await _connectionsService.DeleteAccessPackageAsync(party, from, to, packageId, package, altinnToken);
        if (!success)
        {
            return StatusCode(502, "Failed to delete access package via Altinn API");
        }

        return NoContent();
    }

    /// <summary>
    /// Performs a delegation check for access packages.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="packageIds">List of package UUIDs to check.</param>
    /// <param name="packages">List of package URNs to check.</param>
    /// <returns>Paginated list of delegation check results.</returns>
    [HttpGet("accesspackages/delegationcheck")]
    public async Task<ActionResult<PaginatedResult<AccessPackageDto.AccessPackageDtoCheck>>> CheckAccessPackageDelegation(
        [FromQuery] Guid party,
        [FromQuery] Guid[]? packageIds,
        [FromQuery] string[]? packages)
    {
        _logger.LogInformation("Checking access package delegation for party: {Party}", party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.CheckAccessPackageDelegationAsync(party, packageIds, packages, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to check access package delegation via Altinn API");
        }

        return Ok(result);
    }

    #endregion

    #region Roles

    /// <summary>
    /// Gets roles for connections.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">Optional from party filter.</param>
    /// <param name="to">Optional to party filter.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <returns>Paginated list of role permissions.</returns>
    [HttpGet("roles")]
    public async Task<ActionResult<PaginatedResult<RolePermissionDto>>> GetRoles(
        [FromQuery] string party,
        [FromQuery] string? from = null,
        [FromQuery] string? to = null,
        [FromQuery] uint? pageSize = null,
        [FromQuery] uint? pageNumber = null)
    {
        _logger.LogInformation("Getting roles for party: {Party}, from: {From}, to: {To}", party, from, to);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.GetRolesAsync(party, from, to, pageSize, pageNumber, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve roles from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Removes a role from a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="roleCode">The role code to remove.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("roles")]
    public async Task<IActionResult> DeleteRole(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] string roleCode)
    {
        _logger.LogInformation("Deleting role for party: {Party}, roleCode: {RoleCode}", party, roleCode);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var success = await _connectionsService.DeleteRoleAsync(party, from, to, roleCode, altinnToken);
        if (!success)
        {
            return StatusCode(502, "Failed to delete role via Altinn API");
        }

        return NoContent();
    }

    #endregion

    #region Resources

    /// <summary>
    /// Gets resources for connections.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">Optional from party filter.</param>
    /// <param name="to">Optional to party filter.</param>
    /// <param name="resource">Optional resource filter.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <returns>Paginated list of resource permissions.</returns>
    [HttpGet("resources")]
    public async Task<ActionResult<PaginatedResult<ResourcePermissionDto>>> GetResources(
        [FromQuery] string party,
        [FromQuery] string? from = null,
        [FromQuery] string? to = null,
        [FromQuery] string? resource = null,
        [FromQuery] uint? pageSize = null,
        [FromQuery] uint? pageNumber = null)
    {
        _logger.LogInformation("Getting resources for party: {Party}, from: {From}, to: {To}", party, from, to);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.GetResourcesAsync(party, from, to, resource, pageSize, pageNumber, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve resources from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Adds resource rights to a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <param name="actions">List of actions to add.</param>
    /// <returns>The created assignment resource.</returns>
    [HttpPost("resources")]
    public async Task<ActionResult<AssignmentResourceDto>> AddResource(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] string resource,
        [FromBody] string[] actions)
    {
        _logger.LogInformation("Adding resource for party: {Party}, resource: {Resource}", party, resource);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.AddResourceAsync(party, from, to, resource, actions, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to add resource via Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Updates resource rights for a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <param name="actions">List of actions to set.</param>
    /// <returns>The updated assignment resource.</returns>
    [HttpPut("resources")]
    public async Task<ActionResult<AssignmentResourceDto>> UpdateResource(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] string resource,
        [FromBody] string[] actions)
    {
        _logger.LogInformation("Updating resource for party: {Party}, resource: {Resource}", party, resource);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.UpdateResourceAsync(party, from, to, resource, actions, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to update resource via Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Removes resource rights from a connection.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The from party filter.</param>
    /// <param name="to">The to party filter.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("resources")]
    public async Task<IActionResult> DeleteResource(
        [FromQuery] string party,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] string resource)
    {
        _logger.LogInformation("Deleting resource for party: {Party}, resource: {Resource}", party, resource);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var success = await _connectionsService.DeleteResourceAsync(party, from, to, resource, altinnToken);
        if (!success)
        {
            return StatusCode(502, "Failed to delete resource via Altinn API");
        }

        return NoContent();
    }

    /// <summary>
    /// Performs a delegation check for resources.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="resource">The resource identifier.</param>
    /// <returns>Resource delegation check result.</returns>
    [HttpGet("resources/delegationcheck")]
    public async Task<ActionResult<ResourceCheckDto>> CheckResourceDelegation(
        [FromQuery] Guid party,
        [FromQuery] string resource)
    {
        _logger.LogInformation("Checking resource delegation for party: {Party}, resource: {Resource}", party, resource);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _connectionsService.CheckResourceDelegationAsync(party, resource, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to check resource delegation via Altinn API");
        }

        return Ok(result);
    }

    #endregion
}
