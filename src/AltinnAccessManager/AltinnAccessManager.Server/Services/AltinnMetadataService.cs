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
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AltinnMetadataSettings _settings;
    private readonly ILogger<AltinnMetadataService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public AltinnMetadataService(
        IHttpClientFactory httpClientFactory,
        IOptions<AltinnMetadataSettings> settings,
        ILogger<AltinnMetadataService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
        _logger = logger;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    /// <summary>
    /// Gets the full URL for the specified environment and path.
    /// </summary>
    private string GetFullUrl(string path, string? environment)
    {
        var baseUrl = _settings.GetBaseUrl(environment);
        return $"{baseUrl}{path}";
    }

    /// <summary>
    /// Sends a GET request with the Accept-Language header and deserializes the response.
    /// </summary>
    private async Task<T?> GetWithLanguageAsync<T>(string path, string? language, string? environment) where T : class
    {
        var client = _httpClientFactory.CreateClient();
        var fullUrl = GetFullUrl(path, environment);
        
        var request = new HttpRequestMessage(HttpMethod.Get, fullUrl);
        request.Headers.Add("Accept-Language", language ?? "nb");
        
        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
    }

    // Package endpoints

    public async Task<List<SearchObjectOfPackageDto>?> SearchPackagesAsync(string? term, string[]? resourceProviderCode, bool searchInResources, string? typeName, string? language = null, string? environment = null)
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

            var path = $"{_settings.BasePath}/info/accesspackages/search?{queryParams}";
            _logger.LogInformation("Searching packages with path: {Path}, language: {Language}, environment: {Environment}", path, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<SearchObjectOfPackageDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching packages");
            return null;
        }
    }

    public async Task<List<AreaGroupDto>?> ExportAccessPackagesAsync(string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/export";
            _logger.LogInformation("Exporting access packages from: {Path}, language: {Language}, environment: {Environment}", path, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<AreaGroupDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting access packages");
            return null;
        }
    }

    public async Task<List<AreaGroupDto>?> GetAreaGroupsAsync(string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/group";
            _logger.LogInformation("Getting area groups from: {Path}, language: {Language}, environment: {Environment}", path, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<AreaGroupDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting area groups");
            return null;
        }
    }

    public async Task<AreaGroupDto?> GetAreaGroupByIdAsync(Guid id, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/group/{id}";
            _logger.LogInformation("Getting area group by id: {Id}, language: {Language}, environment: {Environment}", id, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<AreaGroupDto>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting area group by id: {Id}", id);
            return null;
        }
    }

    public async Task<List<AreaDto>?> GetAreasByGroupIdAsync(Guid groupId, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/group/{groupId}/areas";
            _logger.LogInformation("Getting areas by group id: {GroupId}, language: {Language}, environment: {Environment}", groupId, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<AreaDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting areas by group id: {GroupId}", groupId);
            return null;
        }
    }

    public async Task<AreaDto?> GetAreaByIdAsync(Guid id, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/area/{id}";
            _logger.LogInformation("Getting area by id: {Id}, language: {Language}, environment: {Environment}", id, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<AreaDto>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting area by id: {Id}", id);
            return null;
        }
    }

    public async Task<List<PackageDto>?> GetPackagesByAreaIdAsync(Guid areaId, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/area/{areaId}/packages";
            _logger.LogInformation("Getting packages by area id: {AreaId}, language: {Language}, environment: {Environment}", areaId, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<PackageDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages by area id: {AreaId}", areaId);
            return null;
        }
    }

    public async Task<PackageDto?> GetPackageByIdAsync(Guid id, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/package/{id}";
            _logger.LogInformation("Getting package by id: {Id}, language: {Language}, environment: {Environment}", id, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<PackageDto>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting package by id: {Id}", id);
            return null;
        }
    }

    public async Task<PackageDto?> GetPackageByUrnAsync(string urnValue, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/package/urn/{Uri.EscapeDataString(urnValue)}";
            _logger.LogInformation("Getting package by URN: {UrnValue}, language: {Language}, environment: {Environment}", urnValue, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<PackageDto>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting package by URN: {UrnValue}", urnValue);
            return null;
        }
    }

    public async Task<List<ResourceDto>?> GetResourcesByPackageIdAsync(Guid packageId, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/accesspackages/package/{packageId}/resources";
            _logger.LogInformation("Getting resources by package id: {PackageId}, language: {Language}, environment: {Environment}", packageId, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<ResourceDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources by package id: {PackageId}", packageId);
            return null;
        }
    }

    // Role endpoints

    public async Task<List<RoleDto>?> GetRolesAsync(string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/roles";
            _logger.LogInformation("Getting roles from: {Path}, language: {Language}, environment: {Environment}", path, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<RoleDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            return null;
        }
    }

    public async Task<RoleDto?> GetRoleByIdAsync(Guid id, string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/info/roles/{id}";
            _logger.LogInformation("Getting role by id: {Id}, language: {Language}, environment: {Environment}", id, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<RoleDto>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role by id: {Id}", id);
            return null;
        }
    }

    public async Task<List<PackageDto>?> GetPackagesByRoleAsync(string role, string variant, bool includeResources, string? language = null, string? environment = null)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["role"] = role;
            queryParams["variant"] = variant;
            queryParams["includeResources"] = includeResources.ToString().ToLower();

            var path = $"{_settings.BasePath}/info/roles/packages?{queryParams}";
            _logger.LogInformation("Getting packages by role: {Role}, variant: {Variant}, language: {Language}, environment: {Environment}", role, variant, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<PackageDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages by role: {Role}, variant: {Variant}", role, variant);
            return null;
        }
    }

    public async Task<List<ResourceDto>?> GetResourcesByRoleAsync(string role, string variant, bool includePackageResources, string? language = null, string? environment = null)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["role"] = role;
            queryParams["variant"] = variant;
            queryParams["includePackageResources"] = includePackageResources.ToString().ToLower();

            var path = $"{_settings.BasePath}/info/roles/resources?{queryParams}";
            _logger.LogInformation("Getting resources by role: {Role}, variant: {Variant}, language: {Language}, environment: {Environment}", role, variant, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<ResourceDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources by role: {Role}, variant: {Variant}", role, variant);
            return null;
        }
    }

    public async Task<List<PackageDto>?> GetPackagesByRoleIdAsync(Guid roleId, string variant, bool includeResources, string? language = null, string? environment = null)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["variant"] = variant;
            queryParams["includeResources"] = includeResources.ToString().ToLower();

            var path = $"{_settings.BasePath}/info/roles/{roleId}/packages?{queryParams}";
            _logger.LogInformation("Getting packages by role id: {RoleId}, variant: {Variant}, language: {Language}, environment: {Environment}", roleId, variant, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<PackageDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages by role id: {RoleId}, variant: {Variant}", roleId, variant);
            return null;
        }
    }

    public async Task<List<ResourceDto>?> GetResourcesByRoleIdAsync(Guid roleId, string variant, bool includePackageResources, string? language = null, string? environment = null)
    {
        try
        {
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["variant"] = variant;
            queryParams["includePackageResources"] = includePackageResources.ToString().ToLower();

            var path = $"{_settings.BasePath}/info/roles/{roleId}/resources?{queryParams}";
            _logger.LogInformation("Getting resources by role id: {RoleId}, variant: {Variant}, language: {Language}, environment: {Environment}", roleId, variant, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<ResourceDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources by role id: {RoleId}, variant: {Variant}", roleId, variant);
            return null;
        }
    }

    // Type endpoints

    public async Task<List<SubTypeDto>?> GetOrganizationSubTypesAsync(string? language = null, string? environment = null)
    {
        try
        {
            var path = $"{_settings.BasePath}/types/organization/subtypes";
            _logger.LogInformation("Getting organization subtypes from: {Path}, language: {Language}, environment: {Environment}", path, language ?? "nb", environment ?? "tt02");

            return await GetWithLanguageAsync<List<SubTypeDto>>(path, language, environment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting organization subtypes");
            return null;
        }
    }
}
