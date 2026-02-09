import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Button, Alert, Tag } from '@digdir/designsystemet-react';
import type { AgentDto, ClientDto, PaginatedResult } from '../types/clientAdmin';
import { getAgentAccessPackages } from '../services/clientAdminApi';

interface AgentDetailsProps {
  partyId: string;
  agent: AgentDto;
  onBack: () => void;
}

export function AgentDetails({ partyId, agent, onBack }: AgentDetailsProps) {
  const [clientPackages, setClientPackages] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading agent details..." />
      </div>
    );
  }

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
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {agent.access?.length || 0} Role Assignments
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Alert data-color="danger" className="mb-4">
          <Heading level={3} data-size="xs">Error</Heading>
          <Paragraph>{error}</Paragraph>
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
