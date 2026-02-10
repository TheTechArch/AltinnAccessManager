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

// Helper to add language param
function addLanguageParam(params: URLSearchParams, language?: string) {
  if (language) {
    params.append('language', language);
  }
}

// Package endpoints

export async function searchPackages(
  term?: string,
  resourceProviderCode?: string[],
  searchInResources = false,
  typeName?: string,
  language?: string
): Promise<SearchObjectOfPackageDto[]> {
  const params = new URLSearchParams();
  if (term) params.append('term', term);
  if (resourceProviderCode) {
    resourceProviderCode.forEach(code => params.append('resourceProviderCode', code));
  }
  params.append('searchInResources', searchInResources.toString());
  if (typeName) params.append('typeName', typeName);
  addLanguageParam(params, language);

  const response = await fetch(`${API_BASE}/accesspackages/search?${params}`);
  if (!response.ok) throw new Error('Failed to search packages');
  return response.json();
}

export async function exportAccessPackages(language?: string): Promise<AreaGroupDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/export?${params}`);
  if (!response.ok) throw new Error('Failed to export access packages');
  return response.json();
}

export async function getAreaGroups(language?: string): Promise<AreaGroupDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/group?${params}`);
  if (!response.ok) throw new Error('Failed to get area groups');
  return response.json();
}

export async function getAreaGroupById(id: string, language?: string): Promise<AreaGroupDto> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/group/${id}?${params}`);
  if (!response.ok) throw new Error('Failed to get area group');
  return response.json();
}

export async function getAreasByGroupId(groupId: string, language?: string): Promise<AreaDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/group/${groupId}/areas?${params}`);
  if (!response.ok) throw new Error('Failed to get areas');
  return response.json();
}

export async function getAreaById(id: string, language?: string): Promise<AreaDto> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/area/${id}?${params}`);
  if (!response.ok) throw new Error('Failed to get area');
  return response.json();
}

export async function getPackagesByAreaId(areaId: string, language?: string): Promise<PackageDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/area/${areaId}/packages?${params}`);
  if (!response.ok) throw new Error('Failed to get packages');
  return response.json();
}

export async function getPackageById(id: string, language?: string): Promise<PackageDto> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/package/${id}?${params}`);
  if (!response.ok) throw new Error('Failed to get package');
  return response.json();
}

export async function getPackageByUrn(urnValue: string, language?: string): Promise<PackageDto> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/package/urn/${encodeURIComponent(urnValue)}?${params}`);
  if (!response.ok) throw new Error('Failed to get package');
  return response.json();
}

export async function getResourcesByPackageId(packageId: string, language?: string): Promise<ResourceDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/accesspackages/package/${packageId}/resources?${params}`);
  if (!response.ok) throw new Error('Failed to get resources');
  return response.json();
}

// Role endpoints

export async function getRoles(language?: string): Promise<RoleDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/roles?${params}`);
  if (!response.ok) throw new Error('Failed to get roles');
  return response.json();
}

export async function getRoleById(id: string, language?: string): Promise<RoleDto> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/roles/${id}?${params}`);
  if (!response.ok) throw new Error('Failed to get role');
  return response.json();
}

export async function getPackagesByRole(
  role: string,
  variant: string,
  includeResources = false,
  language?: string
): Promise<PackageDto[]> {
  const params = new URLSearchParams({
    role,
    variant,
    includeResources: includeResources.toString(),
  });
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/roles/packages?${params}`);
  if (!response.ok) throw new Error('Failed to get packages by role');
  return response.json();
}

export async function getResourcesByRole(
  role: string,
  variant: string,
  includePackageResources = false,
  language?: string
): Promise<ResourceDto[]> {
  const params = new URLSearchParams({
    role,
    variant,
    includePackageResources: includePackageResources.toString(),
  });
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/roles/resources?${params}`);
  if (!response.ok) throw new Error('Failed to get resources by role');
  return response.json();
}

export async function getPackagesByRoleId(
  id: string,
  variant: string,
  includeResources = false,
  language?: string
): Promise<PackageDto[]> {
  const params = new URLSearchParams({
    variant,
    includeResources: includeResources.toString(),
  });
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/roles/${id}/packages?${params}`);
  if (!response.ok) throw new Error('Failed to get packages by role');
  return response.json();
}

export async function getResourcesByRoleId(
  id: string,
  variant: string,
  includePackageResources = false,
  language?: string
): Promise<ResourceDto[]> {
  const params = new URLSearchParams({
    variant,
    includePackageResources: includePackageResources.toString(),
  });
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/roles/${id}/resources?${params}`);
  if (!response.ok) throw new Error('Failed to get resources by role');
  return response.json();
}

// Type endpoints

export async function getOrganizationSubTypes(language?: string): Promise<SubTypeDto[]> {
  const params = new URLSearchParams();
  addLanguageParam(params, language);
  const response = await fetch(`${API_BASE}/types/organization/subtypes?${params}`);
  if (!response.ok) throw new Error('Failed to get organization subtypes');
  return response.json();
}
