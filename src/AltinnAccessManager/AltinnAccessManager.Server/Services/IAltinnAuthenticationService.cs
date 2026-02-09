namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Interface for Altinn Authentication service to exchange ID-porten tokens for Altinn tokens.
/// </summary>
public interface IAltinnAuthenticationService
{
    /// <summary>
    /// Exchanges an ID-porten access token for an Altinn token.
    /// </summary>
    /// <param name="idPortenAccessToken">The access token from ID-porten.</param>
    /// <returns>The Altinn token if successful, null otherwise.</returns>
    Task<string?> ExchangeTokenAsync(string idPortenAccessToken);
}
