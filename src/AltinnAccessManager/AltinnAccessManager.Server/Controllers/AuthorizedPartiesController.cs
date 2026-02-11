using Altinn.Authorization.Api.Contracts.AccessManagement;
using AltinnAccessManager.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AltinnAccessManager.Server.Controllers;

/// <summary>
/// Controller for retrieving authorized parties the user can represent.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthorizedPartiesController : ControllerBase
{
    private readonly IAuthorizedPartiesService _authorizedPartiesService;
    private readonly ILogger<AuthorizedPartiesController> _logger;

    public AuthorizedPartiesController(
        IAuthorizedPartiesService authorizedPartiesService,
        ILogger<AuthorizedPartiesController> logger)
    {
        _authorizedPartiesService = authorizedPartiesService;
        _logger = logger;
    }

    private string? GetAltinnToken()
    {
        return Request.Cookies["altinn_token"];
    }

    /// <summary>
    /// Gets the list of parties the authenticated user can represent.
    /// </summary>
    /// <param name="includeAltinn2">Include Altinn 2 authorizations (default: false).</param>
    /// <param name="includeAltinn3">Include Altinn 3 authorizations (default: true).</param>
    /// <param name="includeRoles">Include role information (default: false).</param>
    /// <param name="includeAccessPackages">Include access package information (default: false).</param>
    /// <param name="includeResources">Include resource information (default: false).</param>
    /// <param name="includeInstances">Include instance information (default: false).</param>
    /// <param name="anyOfResourceIds">Filter parties that have access to any of these resource IDs.</param>
    /// <returns>List of authorized parties.</returns>
    [HttpGet]
    public async Task<ActionResult<List<AuthorizedPartyExternal>>> GetAuthorizedParties(
        [FromQuery] bool includeAltinn2 = false,
        [FromQuery] bool includeAltinn3 = true,
        [FromQuery] bool includeRoles = false,
        [FromQuery] bool includeAccessPackages = false,
        [FromQuery] bool includeResources = false,
        [FromQuery] bool includeInstances = false,
        [FromQuery] List<string>? anyOfResourceIds = null)
    {
        _logger.LogInformation("Getting authorized parties for authenticated user");

        var altinnToken = GetAltinnToken();
        if (string.IsNullOrEmpty(altinnToken))
        {
            return Unauthorized("Altinn token is required. Please log in first.");
        }

        var result = await _authorizedPartiesService.GetAuthorizedPartiesAsync(
            includeAltinn2,
            includeAltinn3,
            includeRoles,
            includeAccessPackages,
            includeResources,
            includeInstances,
            anyOfResourceIds,
            altinnToken);

        if (result == null)
        {
            return StatusCode(502, "Failed to retrieve authorized parties from Altinn API");
        }

        return Ok(result);
    }
}
