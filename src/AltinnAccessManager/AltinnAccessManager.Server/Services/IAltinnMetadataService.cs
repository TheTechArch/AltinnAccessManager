using Altinn.Authorization.Api.Contracts.AccessManagement;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service interface for interacting with the Altinn Metadata API.
/// </summary>
public interface IAltinnMetadataService
{
    // Package endpoints
    Task<List<SearchObjectOfPackageDto>?> SearchPackagesAsync(string? term, string[]? resourceProviderCode, bool searchInResources, string? typeName);
    Task<List<AreaGroupDto>?> ExportAccessPackagesAsync();
    Task<List<AreaGroupDto>?> GetAreaGroupsAsync();
    Task<AreaGroupDto?> GetAreaGroupByIdAsync(Guid id);
    Task<List<AreaDto>?> GetAreasByGroupIdAsync(Guid groupId);
    Task<AreaDto?> GetAreaByIdAsync(Guid id);
    Task<List<PackageDto>?> GetPackagesByAreaIdAsync(Guid areaId);
    Task<PackageDto?> GetPackageByIdAsync(Guid id);
    Task<PackageDto?> GetPackageByUrnAsync(string urnValue);
    Task<List<ResourceDto>?> GetResourcesByPackageIdAsync(Guid packageId);

    // Role endpoints
    Task<List<RoleDto>?> GetRolesAsync();
    Task<RoleDto?> GetRoleByIdAsync(Guid id);
    Task<List<PackageDto>?> GetPackagesByRoleAsync(string role, string variant, bool includeResources);
    Task<List<ResourceDto>?> GetResourcesByRoleAsync(string role, string variant, bool includePackageResources);
    Task<List<PackageDto>?> GetPackagesByRoleIdAsync(Guid roleId, string variant, bool includeResources);
    Task<List<ResourceDto>?> GetResourcesByRoleIdAsync(Guid roleId, string variant, bool includePackageResources);

    // Type endpoints
    Task<List<SubTypeDto>?> GetOrganizationSubTypesAsync();
}
