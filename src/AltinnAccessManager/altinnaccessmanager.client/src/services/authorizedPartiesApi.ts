import type { AuthorizedPartyExternal } from '../types/authorizedParties';

const API_BASE = '/api/authorizedparties';

export interface GetAuthorizedPartiesOptions {
  includeAltinn2?: boolean;
  includeAltinn3?: boolean;
  includeRoles?: boolean;
  includeAccessPackages?: boolean;
  includeResources?: boolean;
  includeInstances?: boolean;
  anyOfResourceIds?: string[];
}

export async function getAuthorizedParties(
  options: GetAuthorizedPartiesOptions = {}
): Promise<AuthorizedPartyExternal[]> {
  console.log('getAuthorizedParties called with options:', options);
  
  const params = new URLSearchParams();
  
  if (options.includeAltinn2 !== undefined) {
    params.append('includeAltinn2', options.includeAltinn2.toString());
  }
  if (options.includeAltinn3 !== undefined) {
    params.append('includeAltinn3', options.includeAltinn3.toString());
  }
  if (options.includeRoles !== undefined) {
    params.append('includeRoles', options.includeRoles.toString());
  }
  if (options.includeAccessPackages !== undefined) {
    params.append('includeAccessPackages', options.includeAccessPackages.toString());
  }
  if (options.includeResources !== undefined) {
    params.append('includeResources', options.includeResources.toString());
  }
  if (options.includeInstances !== undefined) {
    params.append('includeInstances', options.includeInstances.toString());
  }
  if (options.anyOfResourceIds && options.anyOfResourceIds.length > 0) {
    for (const resourceId of options.anyOfResourceIds) {
      params.append('anyOfResourceIds', resourceId);
    }
  }

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
  
  console.log('Fetching authorized parties from URL:', url);

  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to get authorized parties: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Helper function to flatten authorized parties including subunits
export function flattenAuthorizedParties(
  parties: AuthorizedPartyExternal[]
): AuthorizedPartyExternal[] {
  const result: AuthorizedPartyExternal[] = [];
  
  function addParty(party: AuthorizedPartyExternal) {
    result.push(party);
    if (party.subunits) {
      for (const subunit of party.subunits) {
        addParty(subunit);
      }
    }
  }
  
  for (const party of parties) {
    addParty(party);
  }
  
  return result;
}

// Helper to get display name for a party
export function getPartyDisplayName(party: AuthorizedPartyExternal): string {
  if (party.name) {
    if (party.organizationNumber) {
      return `${party.name} (${party.organizationNumber})`;
    }
    return party.name;
  }
  return party.partyUuid;
}
