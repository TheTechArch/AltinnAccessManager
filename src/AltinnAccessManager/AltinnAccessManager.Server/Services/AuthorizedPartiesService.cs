using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Configuration;
using Microsoft.Extensions.Options;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service for retrieving authorized parties from Altinn.
/// </summary>
public class AuthorizedPartiesService : IAuthorizedPartiesService
{
    private readonly HttpClient _httpClient;
    private readonly AltinnAuthorizedPartiesSettings _settings;
    private readonly ILogger<AuthorizedPartiesService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public AuthorizedPartiesService(
        HttpClient httpClient,
        IOptions<AltinnAuthorizedPartiesSettings> settings,
        ILogger<AuthorizedPartiesService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    /// <inheritdoc />
    public async Task<List<AuthorizedPartyExternal>?> GetAuthorizedPartiesAsync(
        bool includeAltinn2 = false,
        bool includeAltinn3 = true,
        bool includeRoles = false,
        bool includeAccessPackages = false,
        bool includeResources = false,
        bool includeInstances = false,
        List<string>? anyOfResourceIds = null,
        string? altinnToken = null)
    {
        try
        {
            var queryParams = new List<string>
            {
                $"includeAltinn2={includeAltinn2.ToString().ToLower()}",
                $"includeAltinn3={includeAltinn3.ToString().ToLower()}",
                $"includeRoles={includeRoles.ToString().ToLower()}",
                $"includeAccessPackages={includeAccessPackages.ToString().ToLower()}",
                $"includeResources={includeResources.ToString().ToLower()}",
                $"includeInstances={includeInstances.ToString().ToLower()}"
            };

            // Add anyOfResourceIds as repeated query parameters
            if (anyOfResourceIds != null && anyOfResourceIds.Count > 0)
            {
                foreach (var resourceId in anyOfResourceIds)
                {
                    queryParams.Add($"anyOfResourceIds={Uri.EscapeDataString(resourceId)}");
                }
            }

            var url = $"{_settings.BaseUrl}{_settings.BasePath}?{string.Join("&", queryParams)}";
            
            _logger.LogInformation("Fetching authorized parties from: {Url}", url);

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            
            if (!string.IsNullOrEmpty(altinnToken))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", altinnToken);
            }

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to get authorized parties. Status: {StatusCode}, Error: {Error}", 
                    response.StatusCode, errorContent);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<List<AuthorizedPartyExternal>>(content, _jsonOptions);
            
            _logger.LogInformation("Successfully retrieved {Count} authorized parties", result?.Count ?? 0);
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching authorized parties");
            return null;
        }
    }
}
