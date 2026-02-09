using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Configuration;
using Microsoft.Extensions.Options;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service implementation for interacting with the Altinn Client Delegation Admin API.
/// </summary>
public class ClientAdminService : IClientAdminService
{
    private readonly HttpClient _httpClient;
    private readonly AltinnClientAdminSettings _settings;
    private readonly ILogger<ClientAdminService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public ClientAdminService(
        HttpClient httpClient,
        IOptions<AltinnClientAdminSettings> settings,
        ILogger<ClientAdminService> logger)
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

    // Client endpoints

    public async Task<PaginatedResult<ClientDto>?> GetClientsAsync(Guid party, string[]? roles = null, uint? pageSize = null, uint? pageNumber = null, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var queryParams = new List<string> { $"party={party}" };
            if (roles?.Length > 0)
            {
                foreach (var role in roles)
                {
                    queryParams.Add($"roles={Uri.EscapeDataString(role)}");
                }
            }

            var url = $"{_settings.BasePath}/clients?{string.Join("&", queryParams)}";
            _logger.LogInformation("Getting clients with URL: {Url}", url);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddPaginationHeaders(request, pageSize, pageNumber);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<ClientDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting clients for party: {Party}", party);
            return null;
        }
    }

    public async Task<PaginatedResult<AgentDto>?> GetClientAccessPackagesAsync(Guid party, Guid from, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/clients/accesspackages?party={party}&from={from}";
            _logger.LogInformation("Getting client access packages with URL: {Url}", url);

            return await _httpClient.GetFromJsonAsync<PaginatedResult<AgentDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting client access packages for party: {Party}, from: {From}", party, from);
            return null;
        }
    }

    // Agent endpoints

    public async Task<PaginatedResult<AgentDto>?> GetAgentsAsync(Guid party, uint? pageSize = null, uint? pageNumber = null, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/agents?party={party}";
            _logger.LogInformation("Getting agents with URL: {Url}", url);

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            AddPaginationHeaders(request, pageSize, pageNumber);

            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error response from Altinn API: {StatusCode} - {Content}", response.StatusCode, errorContent);
            }
            
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<PaginatedResult<AgentDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting agents for party: {Party}", party);
            return null;
        }
    }

    public async Task<AssignmentDto?> AddAgentAsync(Guid party, Guid? to, PersonInput? person, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/agents?party={party}";
            if (to.HasValue)
            {
                url += $"&to={to.Value}";
            }

            _logger.LogInformation("Adding agent with URL: {Url}", url);

            var response = await _httpClient.PostAsJsonAsync(url, person, _jsonOptions);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<AssignmentDto>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding agent for party: {Party}", party);
            return null;
        }
    }

    public async Task<bool> DeleteAgentAsync(Guid party, Guid to, bool cascade = false, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/agents?party={party}&to={to}&cascade={cascade.ToString().ToLower()}";
            _logger.LogInformation("Deleting agent with URL: {Url}", url);

            var response = await _httpClient.DeleteAsync(url);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting agent for party: {Party}, to: {To}", party, to);
            return false;
        }
    }

    public async Task<PaginatedResult<ClientDto>?> GetAgentAccessPackagesAsync(Guid party, Guid to, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/agents/accesspackages?party={party}&to={to}";
            _logger.LogInformation("Getting agent access packages with URL: {Url}", url);

            return await _httpClient.GetFromJsonAsync<PaginatedResult<ClientDto>>(url, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting agent access packages for party: {Party}, to: {To}", party, to);
            return null;
        }
    }

    public async Task<List<DelegationDto>?> DelegateAccessPackagesToAgentAsync(Guid party, Guid from, Guid to, DelegationBatchInputDto delegations, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/agents/accesspackages?party={party}&from={from}&to={to}";
            _logger.LogInformation("Delegating access packages with URL: {Url}", url);

            var response = await _httpClient.PostAsJsonAsync(url, delegations, _jsonOptions);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<DelegationDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error delegating access packages for party: {Party}", party);
            return null;
        }
    }

    public async Task<List<DelegationDto>?> RevokeAccessPackagesFromAgentAsync(Guid party, Guid from, Guid to, DelegationBatchInputDto delegations, string? altinnToken = null)
    {
        try
        {
            AddAuthorizationHeader(altinnToken);

            var url = $"{_settings.BasePath}/agents/accesspackages?party={party}&from={from}&to={to}";
            _logger.LogInformation("Revoking access packages with URL: {Url}", url);

            var request = new HttpRequestMessage(HttpMethod.Delete, url)
            {
                Content = JsonContent.Create(delegations, options: _jsonOptions)
            };

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<List<DelegationDto>>(_jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking access packages for party: {Party}", party);
            return null;
        }
    }
}
