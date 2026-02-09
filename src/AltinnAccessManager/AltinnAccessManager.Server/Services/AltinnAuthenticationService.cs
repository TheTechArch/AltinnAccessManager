using System.Net.Http.Headers;
using AltinnAccessManager.Server.Configuration;
using Microsoft.Extensions.Options;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Service for exchanging ID-porten tokens for Altinn tokens.
/// </summary>
public class AltinnAuthenticationService : IAltinnAuthenticationService
{
    private readonly HttpClient _httpClient;
    private readonly AltinnAuthenticationSettings _settings;
    private readonly ILogger<AltinnAuthenticationService> _logger;

    public AltinnAuthenticationService(
        HttpClient httpClient,
        IOptions<AltinnAuthenticationSettings> settings,
        ILogger<AltinnAuthenticationService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
    }

    /// <inheritdoc />
    public async Task<string?> ExchangeTokenAsync(string idPortenAccessToken)
    {
        try
        {
            _logger.LogInformation("Exchanging ID-porten token for Altinn token");

            var request = new HttpRequestMessage(HttpMethod.Get, _settings.ExchangeEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", idPortenAccessToken);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "Failed to exchange token with Altinn Authentication. Status: {StatusCode}, Error: {Error}",
                    response.StatusCode,
                    errorContent);
                return null;
            }

            var altinnToken = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Successfully exchanged ID-porten token for Altinn token");

            return altinnToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while exchanging token with Altinn Authentication");
            return null;
        }
    }
}
