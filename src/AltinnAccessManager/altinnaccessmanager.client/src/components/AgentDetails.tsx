import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Button, Alert, Tag, Checkbox } from '@digdir/designsystemet-react';
import type { AgentDto, ClientDto, PaginatedResult, DelegationBatchInputDto, RoleAccessPackages } from '../types/clientAdmin';
import { getAgentAccessPackages, getClients, delegateAccessPackages } from '../services/clientAdminApi';

interface AgentDetailsProps {
  partyId: string;
  agent: AgentDto;
  onBack: () => void;
}

type ViewMode = 'details' | 'select-client' | 'select-packages';

export function AgentDetails({ partyId, agent, onBack }: AgentDetailsProps) {
  const [clientPackages, setClientPackages] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Add client delegation state
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [availableClients, setAvailableClients] = useState<ClientDto[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<Map<string, Set<string>>>(new Map()); // roleUrn -> Set of packageUrns
  const [delegating, setDelegating] = useState(false);

  useEffect(() => {
    if (agent.agent?.id) {
      loadAgentAccessPackages();
    }
  }, [agent.agent?.id]);

  const loadAgentAccessPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: PaginatedResult<ClientDto> = await getAgentAccessPackages(partyId, agent.agent!.id);
      setClientPackages(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableClients = async () => {
    try {
      setLoadingClients(true);
      setError(null);
      const result: PaginatedResult<ClientDto> = await getClients(partyId);
      // Filter out clients that already have delegations to this agent
      const existingClientIds = new Set(clientPackages.map(cp => cp.client?.id).filter(Boolean));
      const filtered = result.data.filter(c => !existingClientIds.has(c.client?.id));
      setAvailableClients(filtered);
      setViewMode('select-client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load available clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSelectClient = (client: ClientDto) => {
    setSelectedClient(client);
    setSelectedPackages(new Map());
    setViewMode('select-packages');
  };

  const togglePackage = (roleUrn: string, packageUrn: string) => {
    const newSelected = new Map(selectedPackages);
    const rolePackages = newSelected.get(roleUrn) || new Set<string>();
    
    if (rolePackages.has(packageUrn)) {
      rolePackages.delete(packageUrn);
    } else {
      rolePackages.add(packageUrn);
    }
    
    if (rolePackages.size === 0) {
      newSelected.delete(roleUrn);
    } else {
      newSelected.set(roleUrn, rolePackages);
    }
    
    setSelectedPackages(newSelected);
  };

  const handleDelegatePackages = async () => {
    if (!selectedClient?.client?.id || selectedPackages.size === 0) return;
    
    try {
      setDelegating(true);
      setError(null);
      
      // Build the delegation batch
      const values: { role: string; packages: string[] }[] = [];
      selectedPackages.forEach((packages, roleUrn) => {
        values.push({
          role: roleUrn,
          packages: Array.from(packages),
        });
      });
      
      const delegations: DelegationBatchInputDto = { values };
      
      await delegateAccessPackages(partyId, selectedClient.client.id, agent.agent!.id, delegations);
      
      setSuccessMessage(`Successfully delegated packages from ${selectedClient.client.name}`);
      setViewMode('details');
      setSelectedClient(null);
      setSelectedPackages(new Map());
      
      // Reload agent access packages
      await loadAgentAccessPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delegate packages');
    } finally {
      setDelegating(false);
    }
  };

  const cancelAddClient = () => {
    setViewMode('details');
    setSelectedClient(null);
    setSelectedPackages(new Map());
    setAvailableClients([]);
  };

  const getTotalSelectedCount = (): number => {
    let count = 0;
    selectedPackages.forEach(packages => {
      count += packages.size;
    });
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading agent details..." />
      </div>
    );
  }

  // Client selection view
  if (viewMode === 'select-client') {
    return (
      <div className="p-6">
        <Button onClick={cancelAddClient} variant="secondary" data-size="sm" className="mb-4">
          ? Cancel
        </Button>

        <Heading level={2} data-size="lg" className="mb-4">
          Select Client to Delegate From
        </Heading>
        <Paragraph className="text-gray-600 mb-6">
          Choose a client organization whose access packages you want to delegate to {agent.agent?.name || 'this agent'}.
        </Paragraph>

        {loadingClients ? (
          <div className="flex items-center justify-center p-8">
            <Spinner aria-label="Loading clients..." />
          </div>
        ) : availableClients.length === 0 ? (
          <Card data-color="neutral" className="p-6">
            <Paragraph className="text-gray-500 text-center">
              No available clients to delegate from. All clients with access packages have already been delegated to this agent.
            </Paragraph>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableClients.map((client, index) => (
              <Card 
                key={client.client?.id || index} 
                data-color="neutral" 
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectClient(client)}
              >
                <Heading level={3} data-size="sm" className="mb-1">
                  {client.client?.name || 'Unknown'}
                </Heading>
                {client.client?.organizationIdentifier && (
                  <Paragraph data-size="sm" className="text-gray-500 mb-2">
                    Org: {client.client.organizationIdentifier}
                  </Paragraph>
                )}
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded inline-block">
                  {client.access?.reduce((acc, a) => acc + (a.packages?.length || 0), 0) || 0} packages available
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Package selection view
  if (viewMode === 'select-packages' && selectedClient) {
    return (
      <div className="p-6">
        <Button onClick={() => setViewMode('select-client')} variant="secondary" data-size="sm" className="mb-4">
          ? Back to Client Selection
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level={2} data-size="lg" className="mb-2">
              Select Packages to Delegate
            </Heading>
            <Paragraph className="text-gray-600">
              From: <strong>{selectedClient.client?.name}</strong> ? To: <strong>{agent.agent?.name}</strong>
            </Paragraph>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              {getTotalSelectedCount()} selected
            </div>
            <Button 
              onClick={handleDelegatePackages} 
              disabled={delegating || getTotalSelectedCount() === 0}
            >
              {delegating ? 'Delegating...' : 'Delegate Selected'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert data-color="danger" className="mb-4">
            <Heading level={3} data-size="xs">Error</Heading>
            <Paragraph>{error}</Paragraph>
          </Alert>
        )}

        {selectedClient.access && selectedClient.access.length > 0 ? (
          <div className="space-y-4">
            {selectedClient.access.map((access: RoleAccessPackages, accessIdx: number) => (
              <Card key={accessIdx} data-color="neutral" className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag data-color="info" data-size="sm">
                    {access.role?.code || 'Role'}
                  </Tag>
                  {access.role?.urn && (
                    <Paragraph data-size="xs" className="text-gray-500">
                      {access.role.urn}
                    </Paragraph>
                  )}
                </div>
                
                {access.packages && access.packages.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {access.packages.map((pkg, pkgIdx) => {
                      const roleUrn = access.role?.urn || access.role?.code || '';
                      const packageUrn = pkg.urn || pkg.id;
                      const isSelected = selectedPackages.get(roleUrn)?.has(packageUrn) || false;
                      
                      return (
                        <div 
                          key={pkgIdx}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}
                          onClick={() => togglePackage(roleUrn, packageUrn)}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => togglePackage(roleUrn, packageUrn)}
                              aria-label={`Select ${pkg.urn?.split(':').pop() || pkg.id}`}
                            />
                            <div className="flex-1 min-w-0">
                              <Paragraph data-size="sm" className="font-medium truncate">
                                {pkg.urn?.split(':').pop() || pkg.id.substring(0, 8)}
                              </Paragraph>
                              {pkg.urn && (
                                <Paragraph data-size="xs" className="text-gray-500 truncate" title={pkg.urn}>
                                  {pkg.urn}
                                </Paragraph>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Paragraph data-size="sm" className="text-gray-500">
                    No packages available for this role.
                  </Paragraph>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card data-color="neutral" className="p-6">
            <Paragraph className="text-gray-500 text-center">
              This client has no access packages available to delegate.
            </Paragraph>
          </Card>
        )}
      </div>
    );
  }

  // Main details view
  return (
    <div className="p-6">
      <Button onClick={onBack} variant="secondary" data-size="sm" className="mb-4">
        ? Back to Agents
      </Button>

      {/* Agent Header */}
      <Card data-color="neutral" className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Tag data-color="success" data-size="sm" className="mb-2">Agent</Tag>
            <Heading level={2} data-size="lg" className="mb-2">
              {agent.agent?.name || 'Unknown Agent'}
            </Heading>
            {agent.agent?.personIdentifier && (
              <Paragraph className="text-gray-600 mb-1">
                Personal ID: {agent.agent.personIdentifier.substring(0, 6)}******
              </Paragraph>
            )}
            <Paragraph className="text-gray-500">
              Type: {agent.agent?.type || 'Person'}
            </Paragraph>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              {agent.access?.length || 0} Role Assignments
            </div>
            <Button 
              onClick={loadAvailableClients}
              disabled={loadingClients}
            >
              {loadingClients ? 'Loading...' : '+ Add Client Access'}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Alert data-color="danger" className="mb-4">
          <Heading level={3} data-size="xs">Error</Heading>
          <Paragraph>{error}</Paragraph>
        </Alert>
      )}

      {successMessage && (
        <Alert data-color="success" className="mb-4">
          <Heading level={3} data-size="xs">Success</Heading>
          <Paragraph>{successMessage}</Paragraph>
        </Alert>
      )}

      {/* Direct Role Assignments */}
      {agent.access && agent.access.length > 0 && (
        <div className="mb-6">
          <Heading level={3} data-size="md" className="mb-3">Direct Role Assignments</Heading>
          <div className="grid gap-4 md:grid-cols-2">
            {agent.access.map((access, idx) => (
              <Card key={idx} data-color="neutral" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Heading level={4} data-size="sm">
                    {access.role?.code || access.role?.urn || 'Unknown Role'}
                  </Heading>
                  <Tag data-color="info" data-size="sm">
                    {access.packages?.length || 0} packages
                  </Tag>
                </div>
                {access.role?.urn && (
                  <Paragraph data-size="xs" className="text-gray-500 mb-2">
                    URN: {access.role.urn}
                  </Paragraph>
                )}
                {access.packages && access.packages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {access.packages.map((pkg, pkgIdx) => (
                      <span key={pkgIdx} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded">
                        {pkg.urn?.split(':').pop() || pkg.id}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Access Packages by Client */}
      <div>
        <Heading level={3} data-size="md" className="mb-3">Access Packages by Client</Heading>
        <Paragraph className="text-gray-600 mb-4">
          Shows all access packages this agent has been delegated, organized by the client organization.
        </Paragraph>
        
        {clientPackages.length === 0 ? (
          <Card data-color="neutral" className="p-6">
            <Paragraph className="text-gray-500 text-center">
              No access packages have been delegated to this agent.
            </Paragraph>
          </Card>
        ) : (
          <div className="space-y-4">
            {clientPackages.map((clientPkg, index) => (
              <Card key={clientPkg.client?.id || index} data-color="neutral" className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Heading level={4} data-size="sm" className="mb-1">
                      {clientPkg.client?.name || 'Unknown Client'}
                    </Heading>
                    {clientPkg.client?.organizationIdentifier && (
                      <Paragraph data-size="sm" className="text-gray-500">
                        Org: {clientPkg.client.organizationIdentifier}
                      </Paragraph>
                    )}
                  </div>
                  <Tag data-color="neutral" data-size="sm">
                    Client
                  </Tag>
                </div>
                
                {clientPkg.access && clientPkg.access.length > 0 ? (
                  <div className="space-y-3">
                    {clientPkg.access.map((access, accessIdx) => (
                      <div key={accessIdx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">
                            {access.role?.code || 'Role'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {access.packages?.length || 0} packages
                          </span>
                        </div>
                        {access.packages && access.packages.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {access.packages.map((pkg, pkgIdx) => (
                              <span 
                                key={pkgIdx} 
                                className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                                title={pkg.urn || pkg.id}
                              >
                                {pkg.urn?.split(':').pop() || pkg.id.substring(0, 8)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Paragraph data-size="sm" className="text-gray-500">
                    No specific packages delegated from this client.
                  </Paragraph>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
