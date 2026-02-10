using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AltinnAccessManager.Server.Controllers;

/// <summary>
/// Controller exposing Altinn Metadata API endpoints for access packages, roles, and types.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MetadataController : ControllerBase
{
    private readonly IAltinnMetadataService _metadataService;
    private readonly ILogger<MetadataController> _logger;

    public MetadataController(
        IAltinnMetadataService metadataService,
        ILogger<MetadataController> logger)
    {
        _metadataService = metadataService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the Accept-Language header value, defaulting to 'nb' if not present.
    /// </summary>
    private string GetLanguage()
    {
        var acceptLanguage = Request.Headers.AcceptLanguage.FirstOrDefault();
        // Parse the first language from the header (e.g., "en-US,en;q=0.9" -> "en")
        if (!string.IsNullOrEmpty(acceptLanguage))
        {
            var firstLang = acceptLanguage.Split(',')[0].Split(';')[0].Trim();
            if (firstLang.StartsWith("en", StringComparison.OrdinalIgnoreCase))
                return "en";
            if (firstLang.StartsWith("nb", StringComparison.OrdinalIgnoreCase) || 
                firstLang.StartsWith("no", StringComparison.OrdinalIgnoreCase) ||
                firstLang.StartsWith("nn", StringComparison.OrdinalIgnoreCase))
                return "nb";
            // Return the first two characters as language code
            return firstLang.Length >= 2 ? firstLang[..2].ToLower() : "nb";
        }
        return "nb"; // Default to Norwegian
    }

    /// <summary>
    /// Gets the X-Altinn-Environment header value, defaulting to 'tt02' if not present.
    /// </summary>
    private string GetEnvironment()
    {
        var environment = Request.Headers["X-Altinn-Environment"].FirstOrDefault();
        if (!string.IsNullOrEmpty(environment) && 
            string.Equals(environment, "prod", StringComparison.OrdinalIgnoreCase))
        {
            return "prod";
        }
        return "tt02"; // Default to TT02
    }

    #region Package Endpoints

    /// <summary>
    /// Searches for access packages.
    /// </summary>
    /// <param name="term">Search term.</param>
    /// <param name="resourceProviderCode">Resource provider codes to filter by.</param>
    /// <param name="searchInResources">Whether to search in resources.</param>
    /// <param name="typeName">Type name to filter by.</param>
    /// <returns>List of matching packages with search metadata.</returns>
    [HttpGet("accesspackages/search")]
    public async Task<ActionResult<List<SearchObjectOfPackageDto>>> SearchPackages(
        [FromQuery] string? term,
        [FromQuery] string[]? resourceProviderCode,
        [FromQuery] bool searchInResources = false,
        [FromQuery] string? typeName = null)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Searching packages with term: {Term}, language: {Language}, environment: {Environment}", term, language, environment);

        var result = await _metadataService.SearchPackagesAsync(term, resourceProviderCode, searchInResources, typeName, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Exports all access packages grouped by area groups.
    /// </summary>
    /// <returns>List of area groups with all nested data.</returns>
    [HttpGet("accesspackages/export")]
    public async Task<ActionResult<List<AreaGroupDto>>> ExportAccessPackages()
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Exporting access packages, language: {Language}, environment: {Environment}", language, environment);

        var result = await _metadataService.ExportAccessPackagesAsync(language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets all area groups.
    /// </summary>
    /// <returns>List of area groups.</returns>
    [HttpGet("accesspackages/group")]
    public async Task<ActionResult<List<AreaGroupDto>>> GetAreaGroups()
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting area groups, language: {Language}, environment: {Environment}", language, environment);

        var result = await _metadataService.GetAreaGroupsAsync(language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets an area group by ID.
    /// </summary>
    /// <param name="id">The area group ID.</param>
    /// <returns>The area group.</returns>
    [HttpGet("accesspackages/group/{id:guid}")]
    public async Task<ActionResult<AreaGroupDto>> GetAreaGroupById(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting area group by id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetAreaGroupByIdAsync(id, language, environment);
        if (result == null)
        {
            return NotFound($"Area group with id {id} not found");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets areas for a specific area group.
    /// </summary>
    /// <param name="id">The area group ID.</param>
    /// <returns>List of areas in the group.</returns>
    [HttpGet("accesspackages/group/{id:guid}/areas")]
    public async Task<ActionResult<List<AreaDto>>> GetAreasByGroupId(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting areas by group id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetAreasByGroupIdAsync(id, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets an area by ID.
    /// </summary>
    /// <param name="id">The area ID.</param>
    /// <returns>The area.</returns>
    [HttpGet("accesspackages/area/{id:guid}")]
    public async Task<ActionResult<AreaDto>> GetAreaById(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting area by id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetAreaByIdAsync(id, language, environment);
        if (result == null)
        {
            return NotFound($"Area with id {id} not found");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets packages for a specific area.
    /// </summary>
    /// <param name="id">The area ID.</param>
    /// <returns>List of packages in the area.</returns>
    [HttpGet("accesspackages/area/{id:guid}/packages")]
    public async Task<ActionResult<List<PackageDto>>> GetPackagesByAreaId(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting packages by area id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetPackagesByAreaIdAsync(id, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets a package by ID.
    /// </summary>
    /// <param name="id">The package ID.</param>
    /// <returns>The package.</returns>
    [HttpGet("accesspackages/package/{id:guid}")]
    public async Task<ActionResult<PackageDto>> GetPackageById(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting package by id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetPackageByIdAsync(id, language, environment);
        if (result == null)
        {
            return NotFound($"Package with id {id} not found");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets a package by URN.
    /// </summary>
    /// <param name="urnValue">The package URN.</param>
    /// <returns>The package.</returns>
    [HttpGet("accesspackages/package/urn/{urnValue}")]
    public async Task<ActionResult<PackageDto>> GetPackageByUrn(string urnValue)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting package by URN: {UrnValue}, language: {Language}, environment: {Environment}", urnValue, language, environment);

        var result = await _metadataService.GetPackageByUrnAsync(urnValue, language, environment);
        if (result == null)
        {
            return NotFound($"Package with URN {urnValue} not found");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets resources for a specific package.
    /// </summary>
    /// <param name="id">The package ID.</param>
    /// <returns>List of resources in the package.</returns>
    [HttpGet("accesspackages/package/{id:guid}/resources")]
    public async Task<ActionResult<List<ResourceDto>>> GetResourcesByPackageId(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting resources by package id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetResourcesByPackageIdAsync(id, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    #endregion

    #region Role Endpoints

    /// <summary>
    /// Gets all roles.
    /// </summary>
    /// <returns>List of roles.</returns>
    [HttpGet("roles")]
    public async Task<ActionResult<List<RoleDto>>> GetRoles()
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting all roles, language: {Language}, environment: {Environment}", language, environment);

        var result = await _metadataService.GetRolesAsync(language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets a role by ID.
    /// </summary>
    /// <param name="id">The role ID.</param>
    /// <returns>The role.</returns>
    [HttpGet("roles/{id:guid}")]
    public async Task<ActionResult<RoleDto>> GetRoleById(Guid id)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting role by id: {Id}, language: {Language}, environment: {Environment}", id, language, environment);

        var result = await _metadataService.GetRoleByIdAsync(id, language, environment);
        if (result == null)
        {
            return NotFound($"Role with id {id} not found");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets packages for a role by role code.
    /// </summary>
    /// <param name="role">The role code.</param>
    /// <param name="variant">The role variant.</param>
    /// <param name="includeResources">Whether to include resources.</param>
    /// <returns>List of packages for the role.</returns>
    [HttpGet("roles/packages")]
    public async Task<ActionResult<List<PackageDto>>> GetPackagesByRole(
        [FromQuery] string role,
        [FromQuery] string variant,
        [FromQuery] bool includeResources = false)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting packages by role: {Role}, variant: {Variant}, language: {Language}, environment: {Environment}", role, variant, language, environment);

        var result = await _metadataService.GetPackagesByRoleAsync(role, variant, includeResources, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets resources for a role by role code.
    /// </summary>
    /// <param name="role">The role code.</param>
    /// <param name="variant">The role variant.</param>
    /// <param name="includePackageResources">Whether to include package resources.</param>
    /// <returns>List of resources for the role.</returns>
    [HttpGet("roles/resources")]
    public async Task<ActionResult<List<ResourceDto>>> GetResourcesByRole(
        [FromQuery] string role,
        [FromQuery] string variant,
        [FromQuery] bool includePackageResources = false)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting resources by role: {Role}, variant: {Variant}, language: {Language}, environment: {Environment}", role, variant, language, environment);

        var result = await _metadataService.GetResourcesByRoleAsync(role, variant, includePackageResources, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets packages for a role by role ID.
    /// </summary>
    /// <param name="id">The role ID.</param>
    /// <param name="variant">The role variant.</param>
    /// <param name="includeResources">Whether to include resources.</param>
    /// <returns>List of packages for the role.</returns>
    [HttpGet("roles/{id:guid}/packages")]
    public async Task<ActionResult<List<PackageDto>>> GetPackagesByRoleId(
        Guid id,
        [FromQuery] string variant,
        [FromQuery] bool includeResources = false)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting packages by role id: {Id}, variant: {Variant}, language: {Language}, environment: {Environment}", id, variant, language, environment);

        var result = await _metadataService.GetPackagesByRoleIdAsync(id, variant, includeResources, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets resources for a role by role ID.
    /// </summary>
    /// <param name="id">The role ID.</param>
    /// <param name="variant">The role variant.</param>
    /// <param name="includePackageResources">Whether to include package resources.</param>
    /// <returns>List of resources for the role.</returns>
    [HttpGet("roles/{id:guid}/resources")]
    public async Task<ActionResult<List<ResourceDto>>> GetResourcesByRoleId(
        Guid id,
        [FromQuery] string variant,
        [FromQuery] bool includePackageResources = false)
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting resources by role id: {Id}, variant: {Variant}, language: {Language}, environment: {Environment}", id, variant, language, environment);

        var result = await _metadataService.GetResourcesByRoleIdAsync(id, variant, includePackageResources, language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    #endregion

    #region Type Endpoints

    /// <summary>
    /// Gets all organization subtypes.
    /// </summary>
    /// <returns>List of organization subtypes.</returns>
    [HttpGet("types/organization/subtypes")]
    public async Task<ActionResult<List<SubTypeDto>>> GetOrganizationSubTypes()
    {
        var language = GetLanguage();
        var environment = GetEnvironment();
        _logger.LogInformation("Getting organization subtypes, language: {Language}, environment: {Environment}", language, environment);

        var result = await _metadataService.GetOrganizationSubTypesAsync(language, environment);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve data from Altinn Metadata API");
        }

        return Ok(result);
    }

    #endregion
}
