import type {
  PaginatedResult,
  ConnectionDto,
  PackagePermissionDto,
  RolePermissionDto,
  ResourcePermissionDto,
  AssignmentDto,
  AssignmentPackageDto,
  AssignmentResourceDto,
  ResourceCheckDto,
  AccessPackageDtoCheck,
  PersonInput,
} from '../types/connections';

const API_BASE = '/api/connections';

// Connection endpoints (base)

export async function getConnections(
  party: string,
  from?: string,
  to?: string,
  pageSize?: number,
  pageNumber?: number
): Promise<PaginatedResult<ConnectionDto>> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (pageSize) params.append('pageSize', pageSize.toString());
  if (pageNumber) params.append('pageNumber', pageNumber.toString());

  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to get connections: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function addConnection(
  party: string,
  from?: string,
  to?: string,
  person?: PersonInput
): Promise<AssignmentDto> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(person),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to add connection: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function deleteConnection(
  party: string,
  from?: string,
  to?: string,
  cascade = false
): Promise<void> {
  const params = new URLSearchParams({ party, cascade: cascade.toString() });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}?${params}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to delete connection: ${response.status} - ${errorText}`);
  }
}

// Access Packages endpoints

export async function getAccessPackages(
  party: string,
  from?: string,
  to?: string,
  pageSize?: number,
  pageNumber?: number
): Promise<PaginatedResult<PackagePermissionDto>> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (pageSize) params.append('pageSize', pageSize.toString());
  if (pageNumber) params.append('pageNumber', pageNumber.toString());

  const response = await fetch(`${API_BASE}/accesspackages?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to get access packages: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function addAccessPackage(
  party: string,
  from?: string,
  to?: string,
  packageId?: string,
  packageUrn?: string,
  person?: PersonInput
): Promise<AssignmentPackageDto> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (packageId) params.append('packageId', packageId);
  if (packageUrn) params.append('package', packageUrn);

  const response = await fetch(`${API_BASE}/accesspackages?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(person),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to add access package: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function deleteAccessPackage(
  party: string,
  from?: string,
  to?: string,
  packageId?: string,
  packageUrn?: string
): Promise<void> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (packageId) params.append('packageId', packageId);
  if (packageUrn) params.append('package', packageUrn);

  const response = await fetch(`${API_BASE}/accesspackages?${params}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to delete access package: ${response.status} - ${errorText}`);
  }
}

export async function checkAccessPackageDelegation(
  party: string,
  packageIds?: string[],
  packages?: string[]
): Promise<PaginatedResult<AccessPackageDtoCheck>> {
  const params = new URLSearchParams({ party });
  if (packageIds) {
    packageIds.forEach(id => params.append('packageIds', id));
  }
  if (packages) {
    packages.forEach(pkg => params.append('packages', pkg));
  }

  const response = await fetch(`${API_BASE}/accesspackages/delegationcheck?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to check access package delegation: ${response.status} - ${errorText}`);
  }
  return response.json();
}

// Roles endpoints

export async function getRoles(
  party: string,
  from?: string,
  to?: string,
  pageSize?: number,
  pageNumber?: number
): Promise<PaginatedResult<RolePermissionDto>> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (pageSize) params.append('pageSize', pageSize.toString());
  if (pageNumber) params.append('pageNumber', pageNumber.toString());

  const response = await fetch(`${API_BASE}/roles?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to get roles: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function deleteRole(
  party: string,
  roleCode: string,
  from?: string,
  to?: string
): Promise<void> {
  const params = new URLSearchParams({ party, roleCode });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}/roles?${params}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to delete role: ${response.status} - ${errorText}`);
  }
}

// Resources endpoints

export async function getResources(
  party: string,
  from?: string,
  to?: string,
  resource?: string,
  pageSize?: number,
  pageNumber?: number
): Promise<PaginatedResult<ResourcePermissionDto>> {
  const params = new URLSearchParams({ party });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (resource) params.append('resource', resource);
  if (pageSize) params.append('pageSize', pageSize.toString());
  if (pageNumber) params.append('pageNumber', pageNumber.toString());

  const response = await fetch(`${API_BASE}/resources?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to get resources: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function addResource(
  party: string,
  resource: string,
  actions: string[],
  from?: string,
  to?: string
): Promise<AssignmentResourceDto> {
  const params = new URLSearchParams({ party, resource });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}/resources?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actions),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to add resource: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function updateResource(
  party: string,
  resource: string,
  actions: string[],
  from?: string,
  to?: string
): Promise<AssignmentResourceDto> {
  const params = new URLSearchParams({ party, resource });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}/resources?${params}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actions),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to update resource: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function deleteResource(
  party: string,
  resource: string,
  from?: string,
  to?: string
): Promise<void> {
  const params = new URLSearchParams({ party, resource });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}/resources?${params}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to delete resource: ${response.status} - ${errorText}`);
  }
}

export async function checkResourceDelegation(
  party: string,
  resource: string
): Promise<ResourceCheckDto> {
  const params = new URLSearchParams({ party, resource });

  const response = await fetch(`${API_BASE}/resources/delegationcheck?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to check resource delegation: ${response.status} - ${errorText}`);
  }
  return response.json();
}
