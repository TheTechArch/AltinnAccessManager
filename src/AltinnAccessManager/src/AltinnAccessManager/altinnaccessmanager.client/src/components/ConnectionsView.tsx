import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Alert, Spinner, Tag } from '@digdir/designsystemet-react';
import type { ConnectionDto } from '../types/connections';
import { getConnections } from '../services/connectionsApi';

interface ConnectionsViewProps {
  partyId: string;
  onSelectConnection: (connection: ConnectionDto) => void;
  onBack: () => void;
}

export function ConnectionsView({ partyId, onSelectConnection, onBack }: ConnectionsViewProps) {
  const [connections, setConnections] = useState<ConnectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, [partyId]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get connections where the party is the "from" (i.e., parties that have been given rights by this party)
      const result = await getConnections(partyId);
      setConnections(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const getEntityTypeTag = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'organization':
        return <Tag data-color="info" data-size="sm">Organization</Tag>;
      case 'person':
        return <Tag data-color="success" data-size="sm">Person</Tag>;
      default:
        return <Tag data-color="neutral" data-size="sm">{type || 'Unknown'}</Tag>;
    }
  };

  const getAccessSummary = (connection: ConnectionDto) => {
    const parts: string[] = [];
    if (connection.packages?.length > 0) {
      parts.push(`${connection.packages.length} package(s)`);
    }
    if (connection.roles?.length > 0) {
      parts.push(`${connection.roles.length} role(s)`);
    }
    if (connection.resources?.length > 0) {
      parts.push(`${connection.resources.length} resource(s)`);
    }
    return parts.length > 0 ? parts.join(', ') : 'No direct access';
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Spinner aria-label="Loading connections..." />
          <Paragraph className="mt-4 text-gray-600">Loading connections...</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="tertiary" data-size="sm" onClick={onBack} className="mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <Heading level={2} data-size="lg">Parties with Rights</Heading>
            <Paragraph className="text-gray-600">
              View and manage persons and organizations that have been given direct access (access packages, roles, resources).
            </Paragraph>
          </div>
          <Button onClick={loadConnections} variant="secondary" data-size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert data-color="danger" className="mb-6">
          <Heading level={3} data-size="xs">Error loading connections</Heading>
          <Paragraph>{error}</Paragraph>
          <Button variant="tertiary" data-size="sm" onClick={loadConnections} className="mt-2">
            Try Again
          </Button>
        </Alert>
      )}

      {/* Connections List */}
      {connections.length === 0 ? (
        <Card data-color="neutral" className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <Heading level={3} data-size="md" className="mb-2">No Connections Found</Heading>
          <Paragraph className="text-gray-600">
            No persons or organizations have been given direct access yet.
          </Paragraph>
        </Card>
      ) : (
        <div className="space-y-4">
          <Paragraph className="text-gray-500">
            Found {connections.length} connection(s)
          </Paragraph>
          
          {connections.map((connection, index) => (
            <Card 
              key={connection.party?.id || index}
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectConnection(connection)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Heading level={3} data-size="md" className="truncate">
                      {connection.party?.name || 'Unknown Party'}
                    </Heading>
                    {getEntityTypeTag(connection.party?.type)}
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    {connection.party?.organizationIdentifier && (
                      <div>
                        <span className="font-medium">Org:</span> {connection.party.organizationIdentifier}
                      </div>
                    )}
                    {connection.party?.personIdentifier && (
                      <div>
                        <span className="font-medium">Person:</span> {connection.party.personIdentifier.substring(0, 6)}***
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Access:</span> {getAccessSummary(connection)}
                    </div>
                  </div>

                  {/* Quick summary of packages */}
                  {connection.packages && connection.packages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {connection.packages.slice(0, 3).map((pkg, idx) => (
                        <Tag key={pkg.id || idx} data-color="neutral" data-size="sm" className="bg-blue-50 text-blue-700">
                          {pkg.urn?.split(':').pop() || pkg.urn}
                        </Tag>
                      ))}
                      {connection.packages.length > 3 && (
                        <Tag data-color="neutral" data-size="sm">
                          +{connection.packages.length - 3} more
                        </Tag>
                      )}
                    </div>
                  )}

                  {/* Sub-connections count */}
                  {connection.connections && connection.connections.length > 0 && (
                    <div className="mt-2">
                      <Tag data-color="warning" data-size="sm">
                        {connection.connections.length} sub-unit(s)
                      </Tag>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
