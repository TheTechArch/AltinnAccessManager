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
    /// Format: A;orgnumber;fnumber agent;name agent;package urn;email
    /// A = Active (existing delegation), U = Utgått (delete when uploading)
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

            // For each agent, get their access packages by client
            foreach (var agent in agentsResult.Data)
            {
                if (agent.Agent?.Id == null) continue;

                var agentFnumber = agent.Agent.PersonIdentifier ?? "";
                var agentName = agent.Agent.Name ?? "";

                // Get the agent's access packages grouped by client
                var accessPackagesResult = await _clientAdminService.GetAgentAccessPackagesAsync(party, agent.Agent.Id, altinnToken);
                
                if (accessPackagesResult?.Data != null)
                {
                    foreach (var clientPkg in accessPackagesResult.Data)
                    {
                        var orgNumber = clientPkg.Client?.OrganizationIdentifier ?? "";

                        if (clientPkg.Access != null)
                        {
                            foreach (var roleAccess in clientPkg.Access)
                            {
                                if (roleAccess.Packages != null)
                                {
                                    foreach (var package in roleAccess.Packages)
                                    {
                                        var packageUrn = package.Urn ?? package.Id.ToString();
                                        
                                        // Escape fields if they contain semicolons
                                        var escapedOrgNumber = EscapeCsvField(orgNumber, ';');
                                        var escapedFnumber = EscapeCsvField(agentFnumber, ';');
                                        var escapedName = EscapeCsvField(agentName, ';');
                                        var escapedPackageUrn = EscapeCsvField(packageUrn, ';');
                                        
                                        csvBuilder.AppendLine($"A;{escapedOrgNumber};{escapedFnumber};{escapedName};{escapedPackageUrn};-");
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

    /// <summary>
    /// Uploads and processes a CSV file with delegation changes.
    /// Format: status;orgnumber;fnumber;name;package;email
    /// A = Active (add/keep delegation), U = Utgått (delete delegation)
    /// </summary>
    /// <param name="party">The party UUID.</param>
    /// <param name="file">The CSV file to upload.</param>
    /// <returns>Processing result with success/failure counts.</returns>
    [HttpPost("import/delegations")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportDelegationsCsv([FromQuery] Guid party, IFormFile file)
    {
        _logger.LogInformation("Importing client delegations CSV for party: {Party}", party);

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded or file is empty.");
        }

        try
        {
            // Read CSV content
            string csvContent;
            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                csvContent = await reader.ReadToEndAsync();
            }

            var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            
            // Get all existing agents for the party to check if agent exists
            var agentsResult = await _clientAdminService.GetAgentsAsync(party, pageSize: 1000, altinnToken: altinnToken);
            var existingAgents = agentsResult?.Data ?? [];
            
            // Build a lookup of existing agents by personIdentifier
            var agentLookup = new Dictionary<string, AgentDto>(StringComparer.OrdinalIgnoreCase);
            foreach (var agent in existingAgents)
            {
                if (!string.IsNullOrEmpty(agent.Agent?.PersonIdentifier))
                {
                    agentLookup[agent.Agent.PersonIdentifier] = agent;
                }
            }

            // Get all clients to build org number to client ID mapping
            var clientsResult = await _clientAdminService.GetClientsAsync(party, altinnToken: altinnToken);
            var clientLookup = new Dictionary<string, ClientDto>(StringComparer.OrdinalIgnoreCase);
            if (clientsResult?.Data != null)
            {
                foreach (var client in clientsResult.Data)
                {
                    if (!string.IsNullOrEmpty(client.Client?.OrganizationIdentifier))
                    {
                        clientLookup[client.Client.OrganizationIdentifier] = client;
                    }
                }
            }

            // Build a lookup of existing delegations: agentFnumber -> orgNumber -> set of packageUrns
            var existingDelegations = new Dictionary<string, Dictionary<string, HashSet<string>>>(StringComparer.OrdinalIgnoreCase);
            foreach (var agent in existingAgents)
            {
                if (agent.Agent?.Id == null || string.IsNullOrEmpty(agent.Agent.PersonIdentifier)) continue;

                var agentPackages = await _clientAdminService.GetAgentAccessPackagesAsync(party, agent.Agent.Id, altinnToken);
                if (agentPackages?.Data == null) continue;

                var fnumber = agent.Agent.PersonIdentifier;
                if (!existingDelegations.ContainsKey(fnumber))
                {
                    existingDelegations[fnumber] = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
                }

                foreach (var clientPkg in agentPackages.Data)
                {
                    var orgNumber = clientPkg.Client?.OrganizationIdentifier;
                    if (string.IsNullOrEmpty(orgNumber)) continue;

                    if (!existingDelegations[fnumber].ContainsKey(orgNumber))
                    {
                        existingDelegations[fnumber][orgNumber] = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    }

                    if (clientPkg.Access != null)
                    {
                        foreach (var roleAccess in clientPkg.Access)
                        {
                            if (roleAccess.Packages != null)
                            {
                                foreach (var pkg in roleAccess.Packages)
                                {
                                    if (!string.IsNullOrEmpty(pkg.Urn))
                                    {
                                        existingDelegations[fnumber][orgNumber].Add(pkg.Urn);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var results = new ImportResult();
            var processedRows = new List<string>();

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();
                if (string.IsNullOrEmpty(trimmedLine)) continue;

                // Parse CSV line (semicolon separated)
                var fields = ParseCsvLine(trimmedLine, ';');
                if (fields.Length < 5)
                {
                    results.Errors.Add($"Invalid line format: {trimmedLine}");
                    results.FailedCount++;
                    continue;
                }

                var status = fields[0].Trim().ToUpperInvariant();
                var orgNumber = fields[1].Trim();
                var fnumber = fields[2].Trim();
                var name = fields[3].Trim();
                var packageUrn = fields[4].Trim();
                // email field (5) is ignored for now

                try
                {
                    if (status == "A")
                    {
                        // Active - ensure agent exists and delegation is in place
                        await ProcessActiveDelegation(party, orgNumber, fnumber, name, packageUrn, 
                            agentLookup, clientLookup, existingDelegations, altinnToken, results);
                    }
                    else if (status == "U")
                    {
                        // Utgått - remove delegation if exists
                        await ProcessDeleteDelegation(party, orgNumber, fnumber, packageUrn,
                            agentLookup, clientLookup, existingDelegations, altinnToken, results);
                    }
                    else
                    {
                        results.Errors.Add($"Unknown status '{status}' for fnumber {fnumber}");
                        results.FailedCount++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing row: {Line}", trimmedLine);
                    results.Errors.Add($"Error processing {fnumber}/{orgNumber}: {ex.Message}");
                    results.FailedCount++;
                }
            }

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing client delegations CSV for party: {Party}", party);
            return StatusCode(500, $"An error occurred while processing the CSV import: {ex.Message}");
        }
    }

    private async Task ProcessActiveDelegation(
        Guid party, 
        string orgNumber, 
        string fnumber, 
        string name, 
        string packageUrn,
        Dictionary<string, AgentDto> agentLookup,
        Dictionary<string, ClientDto> clientLookup,
        Dictionary<string, Dictionary<string, HashSet<string>>> existingDelegations,
        string altinnToken,
        ImportResult results)
    {
        // Check if this delegation already exists
        if (existingDelegations.TryGetValue(fnumber, out var agentDelegations) &&
            agentDelegations.TryGetValue(orgNumber, out var packages) &&
            packages.Contains(packageUrn))
        {
            // Delegation already exists - no change needed
            results.UnchangedCount++;
            return;
        }

        // Check if agent exists
        Guid agentId;
        if (agentLookup.TryGetValue(fnumber, out var existingAgent) && existingAgent.Agent?.Id != null)
        {
            agentId = existingAgent.Agent.Id;
            _logger.LogInformation("Agent {Fnumber} already exists with ID {AgentId}", fnumber, agentId);
        }
        else
        {
            // Add new agent - use name as lastName
            _logger.LogInformation("Adding new agent {Fnumber} with lastName {Name}", fnumber, name);
            var personInput = new PersonInput
            {
                PersonIdentifier = fnumber,
                LastName = name
            };

            var addResult = await _clientAdminService.AddAgentAsync(party, null, personInput, altinnToken);
            if (addResult == null)
            {
                results.Errors.Add($"Failed to add agent {fnumber}");
                results.FailedCount++;
                return;
            }

            agentId = addResult.ToId;
            results.AgentsAdded++;
            
            // Update lookup for future rows
            agentLookup[fnumber] = new AgentDto 
            { 
                Agent = new CompactEntityDto { Id = agentId, PersonIdentifier = fnumber, Name = name } 
            };

            // Initialize delegation tracking for new agent
            existingDelegations[fnumber] = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
        }

        // Check if client exists
        if (!clientLookup.TryGetValue(orgNumber, out var client) || client.Client?.Id == null)
        {
            results.Errors.Add($"Client with org number {orgNumber} not found");
            results.FailedCount++;
            return;
        }

        var clientId = client.Client.Id;

        // Find the role for this package from the client's access
        string? roleUrn = null;
        if (client.Access != null)
        {
            foreach (var roleAccess in client.Access)
            {
                if (roleAccess.Packages?.Any(p => 
                    string.Equals(p.Urn, packageUrn, StringComparison.OrdinalIgnoreCase)) == true)
                {
                    roleUrn = roleAccess.Role?.Urn ?? roleAccess.Role?.Code;
                    break;
                }
            }
        }

        if (string.IsNullOrEmpty(roleUrn))
        {
            // Try to use the package URN directly without a specific role
            roleUrn = "urn:altinn:role:client"; // Default role for client delegations
        }

        // Delegate the access package
        var delegations = new DelegationBatchInputDto
        {
            Values =
            [
                new DelegationBatchInputDto.Permission
                {
                    Role = roleUrn,
                    Packages = [packageUrn]
                }
            ]
        };

        var delegateResult = await _clientAdminService.DelegateAccessPackagesToAgentAsync(party, clientId, agentId, delegations, altinnToken);
        if (delegateResult == null)
        {
            results.Errors.Add($"Failed to delegate {packageUrn} from {orgNumber} to {fnumber}");
            results.FailedCount++;
            return;
        }

        // Update delegation tracking
        if (!existingDelegations[fnumber].ContainsKey(orgNumber))
        {
            existingDelegations[fnumber][orgNumber] = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }
        existingDelegations[fnumber][orgNumber].Add(packageUrn);

        results.DelegationsAdded++;
        results.SuccessCount++;
    }

    private async Task ProcessDeleteDelegation(
        Guid party,
        string orgNumber,
        string fnumber,
        string packageUrn,
        Dictionary<string, AgentDto> agentLookup,
        Dictionary<string, ClientDto> clientLookup,
        Dictionary<string, Dictionary<string, HashSet<string>>> existingDelegations,
        string altinnToken,
        ImportResult results)
    {
        // Check if agent exists
        if (!agentLookup.TryGetValue(fnumber, out var existingAgent) || existingAgent.Agent?.Id == null)
        {
            // Agent doesn't exist, nothing to delete
            results.Skipped++;
            return;
        }

        // Check if the delegation even exists
        if (!existingDelegations.TryGetValue(fnumber, out var agentDelegations) ||
            !agentDelegations.TryGetValue(orgNumber, out var packages) ||
            !packages.Contains(packageUrn))
        {
            // Delegation doesn't exist - nothing to delete
            results.Skipped++;
            return;
        }

        var agentId = existingAgent.Agent.Id;

        // Check if client exists
        if (!clientLookup.TryGetValue(orgNumber, out var client) || client.Client?.Id == null)
        {
            // Client doesn't exist, nothing to delete
            results.Skipped++;
            return;
        }

        var clientId = client.Client.Id;

        // Find the role for this package
        string? roleUrn = null;
        if (client.Access != null)
        {
            foreach (var roleAccess in client.Access)
            {
                if (roleAccess.Packages?.Any(p => 
                    string.Equals(p.Urn, packageUrn, StringComparison.OrdinalIgnoreCase)) == true)
                {
                    roleUrn = roleAccess.Role?.Urn ?? roleAccess.Role?.Code;
                    break;
                }
            }
        }

        if (string.IsNullOrEmpty(roleUrn))
        {
            roleUrn = "urn:altinn:role:client";
        }

        // Revoke the access package
        var delegations = new DelegationBatchInputDto
        {
            Values =
            [
                new DelegationBatchInputDto.Permission
                {
                    Role = roleUrn,
                    Packages = [packageUrn]
                }
            ]
        };

        var revokeResult = await _clientAdminService.RevokeAccessPackagesFromAgentAsync(party, clientId, agentId, delegations, altinnToken);
        if (revokeResult == null)
        {
            // May have already been deleted or doesn't exist - treat as skipped
            results.Skipped++;
            return;
        }

        // Update delegation tracking
        packages.Remove(packageUrn);

        results.DelegationsRemoved++;
        results.SuccessCount++;
    }

    private static string[] ParseCsvLine(string line, char delimiter)
    {
        var fields = new List<string>();
        var currentField = new StringBuilder();
        var inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            var c = line[i];

            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        currentField.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    currentField.Append(c);
                }
            }
            else
            {
                if (c == '"')
                {
                    inQuotes = true;
                }
                else if (c == delimiter)
                {
                    fields.Add(currentField.ToString());
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }
        }

        fields.Add(currentField.ToString());
        return [.. fields];
    }

    private static string EscapeCsvField(string field, char delimiter)
    {
        if (string.IsNullOrEmpty(field)) return field;
        
        if (field.Contains(delimiter) || field.Contains('"') || field.Contains('\n'))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }
        return field;
    }

    #endregion
}

/// <summary>
/// Result of CSV import operation.
/// </summary>
public class ImportResult
{
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public int Skipped { get; set; }
    public int UnchangedCount { get; set; }
    public int AgentsAdded { get; set; }
    public int DelegationsAdded { get; set; }
    public int DelegationsRemoved { get; set; }
    public List<string> Errors { get; set; } = [];
}
