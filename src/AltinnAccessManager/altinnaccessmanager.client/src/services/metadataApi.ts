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

// Package endpoints

export async function searchPackages(
  term?: string,
  resourceProviderCode?: string[],
  searchInResources = false,
  typeName?: string
): Promise<SearchObjectOfPackageDto[]> {
  const params = new URLSearchParams();
  if (term) params.append('term', term);
  if (resourceProviderCode) {
    resourceProviderCode.forEach(code => params.append('resourceProviderCode', code));
  }
  params.append('searchInResources', searchInResources.toString());
  if (typeName) params.append('typeName', typeName);

  const response = await fetch(`${API_BASE}/accesspackages/search?${params}`);
  if (!response.ok) throw new Error('Failed to search packages');
  return response.json();
}

export async function exportAccessPackages(): Promise<AreaGroupDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/export`);
  if (!response.ok) throw new Error('Failed to export access packages');
  return response.json();
}

export async function getAreaGroups(): Promise<AreaGroupDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/group`);
  if (!response.ok) throw new Error('Failed to get area groups');
  return response.json();
}

export async function getAreaGroupById(id: string): Promise<AreaGroupDto> {
  const response = await fetch(`${API_BASE}/accesspackages/group/${id}`);
  if (!response.ok) throw new Error('Failed to get area group');
  return response.json();
}

export async function getAreasByGroupId(groupId: string): Promise<AreaDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/group/${groupId}/areas`);
  if (!response.ok) throw new Error('Failed to get areas');
  return response.json();
}

export async function getAreaById(id: string): Promise<AreaDto> {
  const response = await fetch(`${API_BASE}/accesspackages/area/${id}`);
  if (!response.ok) throw new Error('Failed to get area');
  return response.json();
}

export async function getPackagesByAreaId(areaId: string): Promise<PackageDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/area/${areaId}/packages`);
  if (!response.ok) throw new Error('Failed to get packages');
  return response.json();
}

export async function getPackageById(id: string): Promise<PackageDto> {
  const response = await fetch(`${API_BASE}/accesspackages/package/${id}`);
  if (!response.ok) throw new Error('Failed to get package');
  return response.json();
}

export async function getPackageByUrn(urnValue: string): Promise<PackageDto> {
  const response = await fetch(`${API_BASE}/accesspackages/package/urn/${encodeURIComponent(urnValue)}`);
  if (!response.ok) throw new Error('Failed to get package');
  return response.json();
}

export async function getResourcesByPackageId(packageId: string): Promise<ResourceDto[]> {
  const response = await fetch(`${API_BASE}/accesspackages/package/${packageId}/resources`);
  if (!response.ok) throw new Error('Failed to get resources');
  return response.json();
}

// Role endpoints

export async function getRoles(): Promise<RoleDto[]> {
  const response = await fetch(`${API_BASE}/roles`);
  if (!response.ok) throw new Error('Failed to get roles');
  return response.json();
}

export async function getRoleById(id: string): Promise<RoleDto> {
  const response = await fetch(`${API_BASE}/roles/${id}`);
  if (!response.ok) throw new Error('Failed to get role');
  return response.json();
}

export async function getPackagesByRole(
  role: string,
  variant: string,
  includeResources = false
): Promise<PackageDto[]> {
  const params = new URLSearchParams({
    role,
    variant,
    includeResources: includeResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/packages?${params}`);
  if (!response.ok) throw new Error('Failed to get packages by role');
  return response.json();
}

export async function getResourcesByRole(
  role: string,
  variant: string,
  includePackageResources = false
): Promise<ResourceDto[]> {
  const params = new URLSearchParams({
    role,
    variant,
    includePackageResources: includePackageResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/resources?${params}`);
  if (!response.ok) throw new Error('Failed to get resources by role');
  return response.json();
}

export async function getPackagesByRoleId(
  id: string,
  variant: string,
  includeResources = false
): Promise<PackageDto[]> {
  const params = new URLSearchParams({
    variant,
    includeResources: includeResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/${id}/packages?${params}`);
  if (!response.ok) throw new Error('Failed to get packages by role');
  return response.json();
}

export async function getResourcesByRoleId(
  id: string,
  variant: string,
  includePackageResources = false
): Promise<ResourceDto[]> {
  const params = new URLSearchParams({
    variant,
    includePackageResources: includePackageResources.toString(),
  });
  const response = await fetch(`${API_BASE}/roles/${id}/resources?${params}`);
  if (!response.ok) throw new Error('Failed to get resources by role');
  return response.json();
}

// Type endpoints

export async function getOrganizationSubTypes(): Promise<SubTypeDto[]> {
  const response = await fetch(`${API_BASE}/types/organization/subtypes`);
  if (!response.ok) throw new Error('Failed to get organization subtypes');
  return response.json();
}
