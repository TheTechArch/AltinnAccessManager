import type {
  AreaGroupDto,
  AreaDto,
  PackageDto,
  ResourceDto,
  RoleDto,
  SubTypeDto,
  SearchObjectOfPackageDto,
} from '../types/metadata';

const API_BASE = '/api/metadata';

// Helper to create fetch options with Accept-Language and X-Altinn-Environment headers
function createFetchOptions(language?: string, environment?: string): RequestInit {
  return {
    headers: {
      'Accept-Language': language || 'nb',
      'X-Altinn-Environment': environment || 'tt02',
    },
  };
}

// Package endpoints

export async function searchPackages(
  term?: string,
  resourceProviderCode?: string[],
  searchInResources = false,
  typeName?: string,
  language?: string,
  environment?: string
): Promise<SearchObjectOfPackageDto[]> {
  const params = new URLSearchParams();
  if (term) params.append('term', term);
  if (resourceProviderCode) {
    resourceProviderCode.forEach(code => params.append('resourceProviderCode', code));
  }
  params.append('searchInResources', searchInResources.toString());
  if (typeName) params.append('typeName', typeName);

  const response = await fetch(`${API_BASE}/accesspackages/search?${params}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to search packages');
  return response.json();
}

export async function exportAccessPackages(language?: string, environment?: string): Promise<AreaGroupDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/export`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to export access packages');
  return response.json();
}

export async function getAreaGroups(language?: string, environment?: string): Promise<AreaGroupDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/group`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get area groups');
  return response.json();
}

export async function getAreaGroupById(id: string, language?: string, environment?: string): Promise<AreaGroupDto> {
  const response = await fetch(`${API_BASE}/accesspackages/group/${id}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get area group');
  return response.json();
}

export async function getAreasByGroupId(groupId: string, language?: string, environment?: string): Promise<AreaDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/group/${groupId}/areas`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get areas');
  return response.json();
}

export async function getAreaById(id: string, language?: string, environment?: string): Promise<AreaDto> {
  const response = await fetch(`${API_BASE}/accesspackages/area/${id}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get area');
  return response.json();
}

export async function getPackagesByAreaId(areaId: string, language?: string, environment?: string): Promise<PackageDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/area/${areaId}/packages`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get packages');
  return response.json();
}

export async function getPackageById(id: string, language?: string, environment?: string): Promise<PackageDto> {
  const response = await fetch(`${API_BASE}/accesspackages/package/${id}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get package');
  return response.json();
}

export async function getPackageByUrn(urnValue: string, language?: string, environment?: string): Promise<PackageDto> {
  const response = await fetch(`${API_BASE}/accesspackages/package/urn/${encodeURIComponent(urnValue)}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get package');
  return response.json();
}

export async function getResourcesByPackageId(packageId: string, language?: string, environment?: string): Promise<ResourceDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/package/${packageId}/resources`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get resources');
  return response.json();
}

// Role endpoints

export async function getRoles(language?: string, environment?: string): Promise<RoleDto[]> {
  const response = await fetch(`${API_BASE}/roles`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get roles');
  return response.json();
}

export async function getRoleById(id: string, language?: string, environment?: string): Promise<RoleDto> {
  const response = await fetch(`${API_BASE}/roles/${id}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get role');
  return response.json();
}

export async function getPackagesByRole(
  role: string,
  variant: string,
  includeResources = false,
  language?: string,
  environment?: string
): Promise<PackageDto[]> {
  const params = new URLSearchParams({
    role,
    variant,
    includeResources: includeResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/packages?${params}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get packages by role');
  return response.json();
}

export async function getResourcesByRole(
  role: string,
  variant: string,
  includePackageResources = false,
  language?: string,
  environment?: string
): Promise<ResourceDto[]> {
  const params = new URLSearchParams({
    role,
    variant,
    includePackageResources: includePackageResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/resources?${params}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get resources by role');
  return response.json();
}

export async function getPackagesByRoleId(
  id: string,
  variant: string,
  includeResources = false,
  language?: string,
  environment?: string
): Promise<PackageDto[]> {
  const params = new URLSearchParams({
    variant,
    includeResources: includeResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/${id}/packages?${params}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get packages by role');
  return response.json();
}

export async function getResourcesByRoleId(
  id: string,
  variant: string,
  includePackageResources = false,
  language?: string,
  environment?: string
): Promise<ResourceDto[]> {
  const params = new URLSearchParams({
    variant,
    includePackageResources: includePackageResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/${id}/resources?${params}`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get resources by role');
  return response.json();
}

// Type endpoints

export async function getOrganizationSubTypes(language?: string, environment?: string): Promise<SubTypeDto[]> {
  const response = await fetch(`${API_BASE}/types/organization/subtypes`, createFetchOptions(language, environment));
  if (!response.ok) throw new Error('Failed to get organization subtypes');
  return response.json();
}
