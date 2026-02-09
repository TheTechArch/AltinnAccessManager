import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Button, Alert, Tag } from '@digdir/designsystemet-react';
import type { ClientDto, AgentDto, PaginatedResult } from '../types/clientAdmin';
import { getClientAccessPackages } from '../services/clientAdminApi';

interface ClientDetailsProps {
  partyId: string;
  client: ClientDto;
  onBack: () => void;
}

export function ClientDetails({ partyId, client, onBack }: ClientDetailsProps) {
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client.client?.id) {
      loadClientAccessPackages();
    }
  }, [client.client?.id]);

  const loadClientAccessPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: PaginatedResult<AgentDto> = await getClientAccessPackages(partyId, client.client!.id);
      setAgents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading client details..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button onClick={onBack} variant="secondary" data-size="sm" className="mb-4">
        ? Back to Clients
      </Button>

      {/* Client Header */}
      <Card data-color="neutral" className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Tag data-color="info" data-size="sm" className="mb-2">Client</Tag>
            <Heading level={2} data-size="lg" className="mb-2">
              {client.client?.name || 'Unknown Client'}
            </Heading>
            {client.client?.organizationIdentifier && (
              <Paragraph className="text-gray-600 mb-1">
                Organization Number: {client.client.organizationIdentifier}
              </Paragraph>
            )}
            <Paragraph className="text-gray-500">
              Type: {client.client?.type || 'N/A'} {client.client?.variant && `(${client.client.variant})`}
            </Paragraph>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {client.access?.length || 0} Role Assignments
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

      {/* Access Roles Overview */}
      {client.access && client.access.length > 0 && (
        <div className="mb-6">
          <Heading level={3} data-size="md" className="mb-3">Delegated Roles</Heading>
          <div className="grid gap-4 md:grid-cols-2">
            {client.access.map((access, idx) => (
              <Card key={idx} data-color="neutral" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Heading level={4} data-size="sm">
                    {access.role?.code || access.role?.urn || 'Unknown Role'}
                  </Heading>
                  <Tag data-color="success" data-size="sm">
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
                        {pkg.urn || pkg.id}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Agents with Access */}
      <div>
        <Heading level={3} data-size="md" className="mb-3">Agents with Access to This Client</Heading>
        {agents.length === 0 ? (
          <Card data-color="neutral" className="p-6">
            <Paragraph className="text-gray-500 text-center">
              No agents have been delegated access to this client's resources.
            </Paragraph>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => (
              <Card key={agent.agent?.id || index} data-color="neutral" className="p-4">
                <Heading level={4} data-size="sm" className="mb-1">
                  {agent.agent?.name || 'Unknown Agent'}
                </Heading>
                {agent.agent?.personIdentifier && (
                  <Paragraph data-size="sm" className="text-gray-500 mb-2">
                    ID: {agent.agent.personIdentifier.substring(0, 6)}******
                  </Paragraph>
                )}
                {agent.access && agent.access.length > 0 && (
                  <div className="mt-2">
                    <Paragraph data-size="xs" className="text-gray-500 mb-1">Delegated packages:</Paragraph>
                    <div className="flex flex-wrap gap-1">
                      {agent.access.flatMap(a => a.packages || []).slice(0, 5).map((pkg, pkgIdx) => (
                        <span key={pkgIdx} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">
                          {pkg.urn?.split(':').pop() || pkg.id.substring(0, 8)}
                        </span>
                      ))}
                      {agent.access.flatMap(a => a.packages || []).length > 5 && (
                        <span className="text-gray-500 text-xs">
                          +{agent.access.flatMap(a => a.packages || []).length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
