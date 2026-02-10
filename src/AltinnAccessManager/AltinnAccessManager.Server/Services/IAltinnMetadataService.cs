using Altinn.Authorization.Api.Contracts.AccessManagement;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service interface for interacting with the Altinn Metadata API.
/// </summary>
public interface IAltinnMetadataService
{
    // Package endpoints
    Task<List<SearchObjectOfPackageDto>?> SearchPackagesAsync(string? term, string[]? resourceProviderCode, bool searchInResources, string? typeName, string? language = null);
    Task<List<AreaGroupDto>?> ExportAccessPackagesAsync(string? language = null);
    Task<List<AreaGroupDto>?> GetAreaGroupsAsync(string? language = null);
    Task<AreaGroupDto?> GetAreaGroupByIdAsync(Guid id, string? language = null);
    Task<List<AreaDto>?> GetAreasByGroupIdAsync(Guid groupId, string? language = null);
    Task<AreaDto?> GetAreaByIdAsync(Guid id, string? language = null);
    Task<List<PackageDto>?> GetPackagesByAreaIdAsync(Guid areaId, string? language = null);
    Task<PackageDto?> GetPackageByIdAsync(Guid id, string? language = null);
    Task<PackageDto?> GetPackageByUrnAsync(string urnValue, string? language = null);
    Task<List<ResourceDto>?> GetResourcesByPackageIdAsync(Guid packageId, string? language = null);

    // Role endpoints
    Task<List<RoleDto>?> GetRolesAsync(string? language = null);
    Task<RoleDto?> GetRoleByIdAsync(Guid id, string? language = null);
    Task<List<PackageDto>?> GetPackagesByRoleAsync(string role, string variant, bool includeResources, string? language = null);
    Task<List<ResourceDto>?> GetResourcesByRoleAsync(string role, string variant, bool includePackageResources, string? language = null);
    Task<List<PackageDto>?> GetPackagesByRoleIdAsync(Guid roleId, string variant, bool includeResources, string? language = null);
    Task<List<ResourceDto>?> GetResourcesByRoleIdAsync(Guid roleId, string variant, bool includePackageResources, string? language = null);

    // Type endpoints
    Task<List<SubTypeDto>?> GetOrganizationSubTypesAsync(string? language = null);
}
