using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace AltinnAccessManager.Server.Controllers;

/// <summary>
/// Controller exposing Client Delegation Admin API endpoints.
/// Allows administrators to manage clients, agents, and their access packages.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ClientAdminController : ControllerBase
{
    private readonly IClientAdminService _clientAdminService;
    private readonly ILogger<ClientAdminController> _logger;

    public ClientAdminController(
        IClientAdminService clientAdminService,
        ILogger<ClientAdminController> logger)
    {
        _clientAdminService = clientAdminService;
        _logger = logger;
    }

    private string? GetAltinnToken()
    {
        return Request.Cookies["altinn_token"];
    }

    #region Client Endpoints

    /// <summary>
    /// Gets all clients for a party.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="roles">Optional role filters.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <returns>Paginated list of clients.</returns>
    [HttpGet("clients")]
    public async Task<ActionResult<PaginatedResult<ClientDto>>> GetClients(
        [FromQuery] Guid party,
        [FromQuery] string[]? roles = null,
        [FromQuery] uint? pageSize = null,
        [FromQuery] uint? pageNumber = null)
    {
        _logger.LogInformation("Getting clients for party: {Party}", party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.GetClientsAsync(party, roles, pageSize, pageNumber, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve clients from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets access packages delegated from a specific client.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The client (from) UUID.</param>
    /// <returns>Paginated list of agents with their access packages from this client.</returns>
    [HttpGet("clients/{from}/accesspackages")]
    public async Task<ActionResult<PaginatedResult<AgentDto>>> GetClientAccessPackages(
        [FromQuery] Guid party,
        [FromRoute] Guid from)
    {
        _logger.LogInformation("Getting access packages for client: {From}, party: {Party}", from, party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.GetClientAccessPackagesAsync(party, from, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve client access packages from Altinn API");
        }

        return Ok(result);
    }

    #endregion

    #region Agent Endpoints

    /// <summary>
    /// Gets all agents for a party.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="pageSize">Optional page size.</param>
    /// <param name="pageNumber">Optional page number.</param>
    /// <returns>Paginated list of agents.</returns>
    [HttpGet("agents")]
    public async Task<ActionResult<PaginatedResult<AgentDto>>> GetAgents(
        [FromQuery] Guid party,
        [FromQuery] uint? pageSize = null,
        [FromQuery] uint? pageNumber = null)
    {
        _logger.LogInformation("Getting agents for party: {Party}", party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.GetAgentsAsync(party, pageSize, pageNumber, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve agents from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Adds a new agent to a party.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="to">Optional target party UUID if already known.</param>
    /// <param name="person">Person identifier and last name for lookup.</param>
    /// <returns>The created assignment.</returns>
    [HttpPost("agents")]
    public async Task<ActionResult<AssignmentDto>> AddAgent(
        [FromQuery] Guid party,
        [FromQuery] Guid? to,
        [FromBody] PersonInput? person)
    {
        _logger.LogInformation("Adding agent for party: {Party}", party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.AddAgentAsync(party, to, person, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to add agent via Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Removes an agent from a party.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="to">The agent party UUID.</param>
    /// <param name="cascade">Whether to cascade delete all delegations.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("agents/{to}")]
    public async Task<IActionResult> DeleteAgent(
        [FromQuery] Guid party,
        [FromRoute] Guid to,
        [FromQuery] bool cascade = false)
    {
        _logger.LogInformation("Deleting agent: {To} for party: {Party}, cascade: {Cascade}", to, party, cascade);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var success = await _clientAdminService.DeleteAgentAsync(party, to, cascade, altinnToken);
        if (!success)
        {
            return StatusCode(502, "Failed to delete agent via Altinn API");
        }

        return NoContent();
    }

    /// <summary>
    /// Gets access packages delegated to a specific agent.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="to">The agent party UUID.</param>
    /// <returns>Paginated list of clients with their access packages for this agent.</returns>
    [HttpGet("agents/{to}/accesspackages")]
    public async Task<ActionResult<PaginatedResult<ClientDto>>> GetAgentAccessPackages(
        [FromQuery] Guid party,
        [FromRoute] Guid to)
    {
        _logger.LogInformation("Getting access packages for agent: {To}, party: {Party}", to, party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.GetAgentAccessPackagesAsync(party, to, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve agent access packages from Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Delegates access packages to an agent from a client.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The client (from) UUID.</param>
    /// <param name="to">The agent (to) UUID.</param>
    /// <param name="delegations">The delegation batch input.</param>
    /// <returns>List of delegation results.</returns>
    [HttpPost("agents/{to}/accesspackages")]
    public async Task<ActionResult<List<DelegationDto>>> DelegateAccessPackages(
        [FromQuery] Guid party,
        [FromQuery] Guid from,
        [FromRoute] Guid to,
        [FromBody] DelegationBatchInputDto delegations)
    {
        _logger.LogInformation("Delegating access packages from: {From} to agent: {To}, party: {Party}", from, to, party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.DelegateAccessPackagesToAgentAsync(party, from, to, delegations, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to delegate access packages via Altinn API");
        }

        return Ok(result);
    }

    /// <summary>
    /// Revokes access packages from an agent.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="from">The client (from) UUID.</param>
    /// <param name="to">The agent (to) UUID.</param>
    /// <param name="delegations">The delegation batch input for revocation.</param>
    /// <returns>List of revocation results.</returns>
    [HttpDelete("agents/{to}/accesspackages")]
    public async Task<ActionResult<List<DelegationDto>>> RevokeAccessPackages(
        [FromQuery] Guid party,
        [FromQuery] Guid from,
        [FromRoute] Guid to,
        [FromBody] DelegationBatchInputDto delegations)
    {
        _logger.LogInformation("Revoking access packages from agent: {To}, from: {From}, party: {Party}", to, from, party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _clientAdminService.RevokeAccessPackagesFromAgentAsync(party, from, to, delegations, altinnToken);
        if (result == null)
        {
            return StatusCode(502, "Failed to revoke access packages via Altinn API");
        }

        return Ok(result);
    }

    #endregion

    #region CSV Export

    /// <summary>
    /// Downloads all client delegations in CSV format.
    /// Format: agentId (personIdentifier), accesspackage urn, client (organizationIdentifier), status
    /// Status is 'n' for all rows (new/existing). When uploading, 'u' indicates deletion.
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <returns>CSV file with client delegations.</returns>
    [HttpGet("export/delegations")]
    [Produces("text/csv")]
    public async Task<IActionResult> ExportDelegationsCsv([FromQuery] Guid party)
    {
        _logger.LogInformation("Exporting client delegations CSV for party: {Party}", party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        try
        {
            // Get all agents for the party
            var agentsResult = await _clientAdminService.GetAgentsAsync(party, pageSize: 1000, altinnToken: altinnToken);
            if (agentsResult == null)
            {
                return StatusCode(502, "Failed to retrieve agents from Altinn API");
            }

            var csvBuilder = new StringBuilder();
            
            // Header row
            csvBuilder.AppendLine("agentId,accesspackage,client,status");

            // For each agent, get their access packages by client
            foreach (var agent in agentsResult.Data)
            {
                if (agent.Agent?.Id == null) continue;

                var agentId = agent.Agent.PersonIdentifier ?? agent.Agent.Id.ToString();

                // Get the agent's access packages grouped by client
                var accessPackagesResult = await _clientAdminService.GetAgentAccessPackagesAsync(party, agent.Agent.Id, altinnToken);
                
                if (accessPackagesResult?.Data != null)
                {
                    foreach (var clientPkg in accessPackagesResult.Data)
                    {
                        var clientId = clientPkg.Client?.OrganizationIdentifier ?? clientPkg.Client?.Id.ToString() ?? "unknown";

                        if (clientPkg.Access != null)
                        {
                            foreach (var roleAccess in clientPkg.Access)
                            {
                                if (roleAccess.Packages != null)
                                {
                                    foreach (var package in roleAccess.Packages)
                                    {
                                        var packageUrn = package.Urn ?? package.Id.ToString();
                                        
                                        // Escape CSV fields if they contain commas or quotes
                                        var escapedAgentId = EscapeCsvField(agentId);
                                        var escapedPackageUrn = EscapeCsvField(packageUrn);
                                        var escapedClientId = EscapeCsvField(clientId);
                                        
                                        csvBuilder.AppendLine($"{escapedAgentId},{escapedPackageUrn},{escapedClientId},n");
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var csvContent = csvBuilder.ToString();
            var bytes = Encoding.UTF8.GetBytes(csvContent);
            var fileName = $"client-delegations-{party}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";

            return File(bytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting client delegations CSV for party: {Party}", party);
            return StatusCode(500, "An error occurred while generating the CSV export");
        }
    }

    private static string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field)) return field;
        
        if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }
        return field;
    }

    #endregion
}
