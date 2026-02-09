using System.Net.Http.Json;
using System.Text.Json;
using System.Web;
using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Configuration;
using Microsoft.Extensions.Options;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service implementation for interacting with the Altinn Metadata API.
/// </summary>
public class AltinnMetadataService : IAltinnMetadataService
{
    private readonly HttpClient _httpClient;
    private readonly AltinnMetadataSettings _settings;
    private readonly ILogger<AltinnMetadataService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public AltinnMetadataService(
        HttpClient httpClient,
        IOptions<AltinnMetadataSettings> settings,
        ILogger<AltinnMetadataService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    // Package endpoints

    public async Task<List<SearchObjectOfPackageDto>?> SearchPackagesAsync(string? term, string[]? resourceProviderCode, bool searchInResources, string? typeName)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            if (!string.IsNullOrEmpty(term))
                queryParams["term"] = term;
            if (resourceProviderCode?.Length > 0)
            {
                foreach (var code in resourceProviderCode)
                {
                    queryParams.Add("resourceProviderCode", code);
                }
            }
            queryParams["searchInResources"] = searchInResources.ToString().ToLower();
            if (!string.IsNullOrEmpty(typeName))
                queryParams["typeName"] = typeName;

            var url = $"{_settings.BasePath}/info/accesspackages/search?{queryParams}";
            _logger.LogInformation("Searching packages with URL: {Url}", url);

            return await _httpClient.GetFromJsonAsync<List<SearchObjectOfPackageDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching packages");
            return null;
        }
    }

    public async Task<List<AreaGroupDto>?> ExportAccessPackagesAsync()
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/export";
            _logger.LogInformation("Exporting access packages from: {Url}", url);

            return await _httpClient.GetFromJsonAsync<List<AreaGroupDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting access packages");
            return null;
        }
    }

    public async Task<List<AreaGroupDto>?> GetAreaGroupsAsync()
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/group";
            _logger.LogInformation("Getting area groups from: {Url}", url);

            return await _httpClient.GetFromJsonAsync<List<AreaGroupDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting area groups");
            return null;
        }
    }

    public async Task<AreaGroupDto?> GetAreaGroupByIdAsync(Guid id)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/group/{id}";
            _logger.LogInformation("Getting area group by id: {Id}", id);

            return await _httpClient.GetFromJsonAsync<AreaGroupDto>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting area group by id: {Id}", id);
            return null;
        }
    }

    public async Task<List<AreaDto>?> GetAreasByGroupIdAsync(Guid groupId)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/group/{groupId}/areas";
            _logger.LogInformation("Getting areas by group id: {GroupId}", groupId);

            return await _httpClient.GetFromJsonAsync<List<AreaDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting areas by group id: {GroupId}", groupId);
            return null;
        }
    }

    public async Task<AreaDto?> GetAreaByIdAsync(Guid id)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/area/{id}";
            _logger.LogInformation("Getting area by id: {Id}", id);

            return await _httpClient.GetFromJsonAsync<AreaDto>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting area by id: {Id}", id);
            return null;
        }
    }

    public async Task<List<PackageDto>?> GetPackagesByAreaIdAsync(Guid areaId)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/area/{areaId}/packages";
            _logger.LogInformation("Getting packages by area id: {AreaId}", areaId);

            return await _httpClient.GetFromJsonAsync<List<PackageDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages by area id: {AreaId}", areaId);
            return null;
        }
    }

    public async Task<PackageDto?> GetPackageByIdAsync(Guid id)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/package/{id}";
            _logger.LogInformation("Getting package by id: {Id}", id);

            return await _httpClient.GetFromJsonAsync<PackageDto>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting package by id: {Id}", id);
            return null;
        }
    }

    public async Task<PackageDto?> GetPackageByUrnAsync(string urnValue)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/package/urn/{Uri.EscapeDataString(urnValue)}";
            _logger.LogInformation("Getting package by URN: {UrnValue}", urnValue);

            return await _httpClient.GetFromJsonAsync<PackageDto>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting package by URN: {UrnValue}", urnValue);
            return null;
        }
    }

    public async Task<List<ResourceDto>?> GetResourcesByPackageIdAsync(Guid packageId)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/accesspackages/package/{packageId}/resources";
            _logger.LogInformation("Getting resources by package id: {PackageId}", packageId);

            return await _httpClient.GetFromJsonAsync<List<ResourceDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources by package id: {PackageId}", packageId);
            return null;
        }
    }

    // Role endpoints

    public async Task<List<RoleDto>?> GetRolesAsync()
    {
        try
        {
            var url = $"{_settings.BasePath}/info/roles";
            _logger.LogInformation("Getting roles from: {Url}", url);

            return await _httpClient.GetFromJsonAsync<List<RoleDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            return null;
        }
    }

    public async Task<RoleDto?> GetRoleByIdAsync(Guid id)
    {
        try
        {
            var url = $"{_settings.BasePath}/info/roles/{id}";
            _logger.LogInformation("Getting role by id: {Id}", id);

            return await _httpClient.GetFromJsonAsync<RoleDto>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by id: {Id}", id);
            return null;
        }
    }

    public async Task<List<PackageDto>?> GetPackagesByRoleAsync(string role, string variant, bool includeResources)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["role"] = role;
            queryParams["variant"] = variant;
            queryParams["includeResources"] = includeResources.ToString().ToLower();

            var url = $"{_settings.BasePath}/info/roles/packages?{queryParams}";
            _logger.LogInformation("Getting packages by role: {Role}, variant: {Variant}", role, variant);

            return await _httpClient.GetFromJsonAsync<List<PackageDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages by role: {Role}, variant: {Variant}", role, variant);
            return null;
        }
    }

    public async Task<List<ResourceDto>?> GetResourcesByRoleAsync(string role, string variant, bool includePackageResources)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["role"] = role;
            queryParams["variant"] = variant;
            queryParams["includePackageResources"] = includePackageResources.ToString().ToLower();

            var url = $"{_settings.BasePath}/info/roles/resources?{queryParams}";
            _logger.LogInformation("Getting resources by role: {Role}, variant: {Variant}", role, variant);

            return await _httpClient.GetFromJsonAsync<List<ResourceDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources by role: {Role}, variant: {Variant}", role, variant);
            return null;
        }
    }

    public async Task<List<PackageDto>?> GetPackagesByRoleIdAsync(Guid roleId, string variant, bool includeResources)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["variant"] = variant;
            queryParams["includeResources"] = includeResources.ToString().ToLower();

            var url = $"{_settings.BasePath}/info/roles/{roleId}/packages?{queryParams}";
            _logger.LogInformation("Getting packages by role id: {RoleId}, variant: {Variant}", roleId, variant);

            return await _httpClient.GetFromJsonAsync<List<PackageDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages by role id: {RoleId}, variant: {Variant}", roleId, variant);
            return null;
        }
    }

    public async Task<List<ResourceDto>?> GetResourcesByRoleIdAsync(Guid roleId, string variant, bool includePackageResources)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["variant"] = variant;
            queryParams["includePackageResources"] = includePackageResources.ToString().ToLower();

            var url = $"{_settings.BasePath}/info/roles/{roleId}/resources?{queryParams}";
            _logger.LogInformation("Getting resources by role id: {RoleId}, variant: {Variant}", roleId, variant);

            return await _httpClient.GetFromJsonAsync<List<ResourceDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources by role id: {RoleId}, variant: {Variant}", roleId, variant);
            return null;
        }
    }

    // Type endpoints

    public async Task<List<SubTypeDto>?> GetOrganizationSubTypesAsync()
    {
        try
        {
            var url = $"{_settings.BasePath}/types/organization/subtypes";
            _logger.LogInformation("Getting organization subtypes from: {Url}", url);

            return await _httpClient.GetFromJsonAsync<List<SubTypeDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting organization subtypes");
            return null;
        }
    }
}
