using Altinn.Authorization.Api.Contracts.AccessManagement;

namespace AltinnAccessManager.Server.Services;

/// <summary>
/// Interface for interacting with the Altinn Client Delegation Admin API.
/// </summary>
public interface IClientAdminService
{
    // Client endpoints

    /// <summary>
    /// Gets all clients for a party.
    /// </summary>
    Task<PaginatedResult<ClientDto>?> GetClientsAsync(Guid party, string[]? roles = null, uint? pageSize = null, uint? pageNumber = null, string? altinnToken = null);

    /// <summary>
    /// Gets access packages for a specific client.
    /// </summary>
    Task<PaginatedResult<AgentDto>?> GetClientAccessPackagesAsync(Guid party, Guid from, string? altinnToken = null);

    // Agent endpoints

    /// <summary>
    /// Gets all agents for a party.
    /// </summary>
    Task<PaginatedResult<ClientDto>?> GetAgentsAsync(Guid party, uint? pageSize = null, uint? pageNumber = null, string? altinnToken = null);

    /// <summary>
    /// Adds a new agent to a party.
    /// </summary>
    Task<AssignmentDto?> AddAgentAsync(Guid party, Guid? to, PersonInput? person, string? altinnToken = null);

    /// <summary>
    /// Removes an agent from a party.
    /// </summary>
    Task<bool> DeleteAgentAsync(Guid party, Guid to, bool cascade = false, string? altinnToken = null);

    /// <summary>
    /// Gets access packages for a specific agent.
    /// </summary>
    Task<PaginatedResult<ClientDto>?> GetAgentAccessPackagesAsync(Guid party, Guid to, string? altinnToken = null);

    /// <summary>
    /// Delegates access packages to an agent.
    /// </summary>
    Task<List<DelegationDto>?> DelegateAccessPackagesToAgentAsync(Guid party, Guid from, Guid to, DelegationBatchInputDto delegations, string? altinnToken = null);

    /// <summary>
    /// Revokes access packages from an agent.
    /// </summary>
    Task<List<DelegationDto>?> RevokeAccessPackagesFromAgentAsync(Guid party, Guid from, Guid to, DelegationBatchInputDto delegations, string? altinnToken = null);
}
