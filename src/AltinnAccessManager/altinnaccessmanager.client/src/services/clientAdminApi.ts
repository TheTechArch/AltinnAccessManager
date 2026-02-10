import type {
  PaginatedResult,
  ClientDto,
  AgentDto,
  AssignmentDto,
  DelegationDto,
  DelegationBatchInputDto,
  PersonInput,
} from '../types/clientAdmin';

const API_BASE = '/api/clientadmin';

// Client endpoints

export async function getClients(
  party: string,
  roles?: string[],
  pageSize?: number,
  pageNumber?: number
): Promise<PaginatedResult<ClientDto>> {
  const params = new URLSearchParams({ party });
  if (roles) {
    roles.forEach(role => params.append('roles', role));
  }
  if (pageSize) params.append('pageSize', pageSize.toString());
  if (pageNumber) params.append('pageNumber', pageNumber.toString());

  const response = await fetch(`${API_BASE}/clients?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    throw new Error('Failed to get clients');
  }
  return response.json();
}

export async function getClientAccessPackages(
  party: string,
  from: string
): Promise<PaginatedResult<AgentDto>> {
  const params = new URLSearchParams({ party });
  const response = await fetch(`${API_BASE}/clients/${from}/accesspackages?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    throw new Error('Failed to get client access packages');
  }
  return response.json();
}

// Agent endpoints

export async function getAgents(
  party: string,
  pageSize?: number,
  pageNumber?: number
): Promise<PaginatedResult<AgentDto>> {
  const params = new URLSearchParams({ party });
  if (pageSize) params.append('pageSize', pageSize.toString());
  if (pageNumber) params.append('pageNumber', pageNumber.toString());

  const response = await fetch(`${API_BASE}/agents?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to get agents: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export async function addAgent(
  party: string,
  to?: string,
  person?: PersonInput
): Promise<AssignmentDto> {
  const params = new URLSearchParams({ party });
  if (to) params.append('to', to);

  const response = await fetch(`${API_BASE}/agents?${params}`, {
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
    throw new Error('Failed to add agent');
  }
  return response.json();
}

export async function deleteAgent(
  party: string,
  to: string,
  cascade = false
): Promise<void> {
  const params = new URLSearchParams({ party, cascade: cascade.toString() });

  const response = await fetch(`${API_BASE}/agents/${to}?${params}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    throw new Error('Failed to delete agent');
  }
}

export async function getAgentAccessPackages(
  party: string,
  to: string
): Promise<PaginatedResult<ClientDto>> {
  const params = new URLSearchParams({ party });
  const response = await fetch(`${API_BASE}/agents/${to}/accesspackages?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    throw new Error('Failed to get agent access packages');
  }
  return response.json();
}

export async function delegateAccessPackages(
  party: string,
  from: string,
  to: string,
  delegations: DelegationBatchInputDto
): Promise<DelegationDto[]> {
  const params = new URLSearchParams({ party, from });

  const response = await fetch(`${API_BASE}/agents/${to}/accesspackages?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(delegations),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    throw new Error('Failed to delegate access packages');
  }
  return response.json();
}

export async function revokeAccessPackages(
  party: string,
  from: string,
  to: string,
  delegations: DelegationBatchInputDto
): Promise<DelegationDto[]> {
  const params = new URLSearchParams({ party, from });

  const response = await fetch(`${API_BASE}/agents/${to}/accesspackages?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(delegations),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    throw new Error('Failed to revoke access packages');
  }
  return response.json();
}

// CSV Export

export async function downloadDelegationsCsv(party: string): Promise<void> {
  const params = new URLSearchParams({ party });
  
  const response = await fetch(`${API_BASE}/export/delegations?${params}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to export delegations: ${response.status} - ${errorText}`);
  }
  
  // Get the filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `client-delegations-${party}.csv`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '');
    }
  }
  
  // Download the file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// CSV Import

export interface ImportResult {
  successCount: number;
  failedCount: number;
  skipped: number;
  unchangedCount: number;
  agentsAdded: number;
  delegationsAdded: number;
  delegationsRemoved: number;
  errors: string[];
}

export async function uploadDelegationsCsv(party: string, file: File): Promise<ImportResult> {
  const params = new URLSearchParams({ party });
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/import/delegations?${params}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated. Please log in first.');
    }
    const errorText = await response.text();
    throw new Error(`Failed to import delegations: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}
