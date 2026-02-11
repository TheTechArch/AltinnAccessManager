using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Configuration;
using Microsoft.Extensions.Options;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service implementation for interacting with the Altinn Connections API.
/// </summary>
public class ConnectionsService : IConnectionsService
{
    private readonly HttpClient _httpClient;
    private readonly AltinnConnectionsSettings _settings;
    private readonly ILogger<ConnectionsService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public ConnectionsService(
        HttpClient httpClient,
        IOptions<AltinnConnectionsSettings> settings,
        ILogger<ConnectionsService> logger)
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

    private void AddAuthorizationHeader(string? altinnToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = null;
        if (!string.IsNullOrEmpty(altinnToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", altinnToken);
        }
    }

    private void AddPaginationHeaders(HttpRequestMessage request, uint? pageSize, uint? pageNumber)
    {
        if (pageSize.HasValue)
        {
            request.Headers.Add("X-Page-Size", pageSize.Value.ToString());
        }
        if (pageNumber.HasValue)
        {
            request.Headers.Add("X-Page-Number", pageNumber.Value.ToString());
        }
    }

    private string BuildQueryString(params (string key, string? value)[] parameters)
    {
        var queryParams = parameters
            .Where(p => !string.IsNullOrEmpty(p.value))
            .Select(p => $"{p.key}={Uri.EscapeDataString(p.value!)}");
        return string.Join("&", queryParams);
    }

    #region Connections (Base)

    public async Task<PaginatedResult<ConnectionDto>?> GetConnectionsAsync(
        string party,
        string? from = null,
        string? to = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to));

            var url = $"{_settings.BasePath}?{queryString}";
            _logger.LogInformation("Getting connections with URL: {Url}", url);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddPaginationHeaders(request, pageSize, pageNumber);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<ConnectionDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting connections for party: {Party}", party);
            return null;
        }
    }

    public async Task<AssignmentDto?> AddConnectionAsync(
        string party,
        string? from,
        string? to,
        PersonInput? person,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to));

            var url = $"{_settings.BasePath}?{queryString}";
            _logger.LogInformation("Adding connection with URL: {Url}", url);

            var response = await _httpClient.PostAsJsonAsync(url, person, _jsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<AssignmentDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding connection for party: {Party}", party);
            return null;
        }
    }

    public async Task<bool> DeleteConnectionAsync(
        string party,
        string? from,
        string? to,
        bool cascade = false,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("cascade", cascade.ToString().ToLower()));

            var url = $"{_settings.BasePath}?{queryString}";
            _logger.LogInformation("Deleting connection with URL: {Url}", url);

            var response = await _httpClient.DeleteAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting connection for party: {Party}", party);
            return false;
        }
    }

    #endregion

    #region Access Packages

    public async Task<PaginatedResult<PackagePermissionDto>?> GetAccessPackagesAsync(
        string party,
        string? from = null,
        string? to = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to));

            var url = $"{_settings.BasePath}/accesspackages?{queryString}";
            _logger.LogInformation("Getting access packages with URL: {Url}", url);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddPaginationHeaders(request, pageSize, pageNumber);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<PackagePermissionDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting access packages for party: {Party}", party);
            return null;
        }
    }

    public async Task<AssignmentPackageDto?> AddAccessPackageAsync(
        string party,
        string? from,
        string? to,
        Guid? packageId,
        string? package,
        PersonInput? person,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("packageId", packageId?.ToString()),
                ("package", package));

            var url = $"{_settings.BasePath}/accesspackages?{queryString}";
            _logger.LogInformation("Adding access package with URL: {Url}", url);

            var response = await _httpClient.PostAsJsonAsync(url, person, _jsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<AssignmentPackageDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding access package for party: {Party}", party);
            return null;
        }
    }

    public async Task<bool> DeleteAccessPackageAsync(
        string party,
        string? from,
        string? to,
        Guid? packageId,
        string? package,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("packageId", packageId?.ToString()),
                ("package", package));

            var url = $"{_settings.BasePath}/accesspackages?{queryString}";
            _logger.LogInformation("Deleting access package with URL: {Url}", url);

            var response = await _httpClient.DeleteAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting access package for party: {Party}", party);
            return false;
        }
    }

    public async Task<PaginatedResult<AccessPackageDto.AccessPackageDtoCheck>?> CheckAccessPackageDelegationAsync(
        Guid party,
        Guid[]? packageIds,
        string[]? packages,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryParams = new List<string> { $"party={party}" };
            
            if (packageIds?.Length > 0)
            {
                foreach (var id in packageIds)
                {
                    queryParams.Add($"packageIds={id}");
                }
            }
            
            if (packages?.Length > 0)
            {
                foreach (var pkg in packages)
                {
                    queryParams.Add($"packages={Uri.EscapeDataString(pkg)}");
                }
            }

            var url = $"{_settings.BasePath}/accesspackages/delegationcheck?{string.Join("&", queryParams)}";
            _logger.LogInformation("Checking access package delegation with URL: {Url}", url);

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<AccessPackageDto.AccessPackageDtoCheck>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking access package delegation for party: {Party}", party);
            return null;
        }
    }

    #endregion

    #region Roles

    public async Task<PaginatedResult<RolePermissionDto>?> GetRolesAsync(
        string party,
        string? from = null,
        string? to = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to));

            var url = $"{_settings.BasePath}/roles?{queryString}";
            _logger.LogInformation("Getting roles with URL: {Url}", url);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddPaginationHeaders(request, pageSize, pageNumber);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<RolePermissionDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles for party: {Party}", party);
            return null;
        }
    }

    public async Task<bool> DeleteRoleAsync(
        string party,
        string? from,
        string? to,
        string roleCode,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("roleCode", roleCode));

            var url = $"{_settings.BasePath}/roles?{queryString}";
            _logger.LogInformation("Deleting role with URL: {Url}", url);

            var response = await _httpClient.DeleteAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role for party: {Party}", party);
            return false;
        }
    }

    #endregion

    #region Resources

    public async Task<PaginatedResult<ResourcePermissionDto>?> GetResourcesAsync(
        string party,
        string? from = null,
        string? to = null,
        string? resource = null,
        uint? pageSize = null,
        uint? pageNumber = null,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("resource", resource));

            var url = $"{_settings.BasePath}/resources?{queryString}";
            _logger.LogInformation("Getting resources with URL: {Url}", url);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddPaginationHeaders(request, pageSize, pageNumber);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<ResourcePermissionDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources for party: {Party}", party);
            return null;
        }
    }

    public async Task<AssignmentResourceDto?> AddResourceAsync(
        string party,
        string? from,
        string? to,
        string resource,
        string[] actions,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("resource", resource));

            var url = $"{_settings.BasePath}/resources?{queryString}";
            _logger.LogInformation("Adding resource with URL: {Url}", url);

            var response = await _httpClient.PostAsJsonAsync(url, actions, _jsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<AssignmentResourceDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding resource for party: {Party}", party);
            return null;
        }
    }

    public async Task<AssignmentResourceDto?> UpdateResourceAsync(
        string party,
        string? from,
        string? to,
        string resource,
        string[] actions,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("resource", resource));

            var url = $"{_settings.BasePath}/resources?{queryString}";
            _logger.LogInformation("Updating resource with URL: {Url}", url);

            var response = await _httpClient.PutAsJsonAsync(url, actions, _jsonOptions);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<AssignmentResourceDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating resource for party: {Party}", party);
            return null;
        }
    }

    public async Task<bool> DeleteResourceAsync(
        string party,
        string? from,
        string? to,
        string resource,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party),
                ("from", from),
                ("to", to),
                ("resource", resource));

            var url = $"{_settings.BasePath}/resources?{queryString}";
            _logger.LogInformation("Deleting resource with URL: {Url}", url);

            var response = await _httpClient.DeleteAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting resource for party: {Party}", party);
            return false;
        }
    }

    public async Task<ResourceCheckDto?> CheckResourceDelegationAsync(
        Guid party,
        string resource,
        string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryString = BuildQueryString(
                ("party", party.ToString()),
                ("resource", resource));

            var url = $"{_settings.BasePath}/resources/delegationcheck?{queryString}";
            _logger.LogInformation("Checking resource delegation with URL: {Url}", url);

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<ResourceCheckDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking resource delegation for party: {Party}", party);
            return null;
        }
    }

    #endregion
}
