import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Button, Textfield, Alert } from '@digdir/designsystemet-react';
import type { ClientDto, PaginatedResult } from '../types/clientAdmin';
import { getClients } from '../services/clientAdminApi';

interface ClientsViewProps {
  partyId: string;
  onSelectClient: (client: ClientDto) => void;
  onBack: () => void;
}

export function ClientsView({ partyId, onSelectClient, onBack }: ClientsViewProps) {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClients();
  }, [partyId]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: PaginatedResult<ClientDto> = await getClients(partyId);
      setClients(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client?.organizationIdentifier?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading clients..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert data-color="danger" className="mb-4">
          <Heading level={3} data-size="xs">Error</Heading>
          <Paragraph>{error}</Paragraph>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={onBack} variant="secondary">Back</Button>
          <Button onClick={loadClients}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button onClick={onBack} variant="secondary" data-size="sm" className="mb-4">
          ? Back to Dashboard
        </Button>
        <Heading level={2} data-size="lg" className="mb-2">Clients</Heading>
        <Paragraph className="text-gray-600 mb-4">
          Organizations that have delegated access to your organization. Click on a client to see which agents have access to their resources.
        </Paragraph>
        <Textfield
          label="Search clients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or org number..."
          className="max-w-md"
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card data-color="neutral" className="p-6">
          <Paragraph className="text-gray-500 text-center">
            {searchTerm ? 'No clients match your search.' : 'No clients found.'}
          </Paragraph>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client, index) => (
            <Card 
              key={client.client?.id || index} 
              data-color="neutral" 
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectClient(client)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <Heading level={3} data-size="sm" className="mb-1">
                    {client.client?.name || 'Unknown'}
                  </Heading>
                  {client.client?.organizationIdentifier && (
                    <Paragraph data-size="sm" className="text-gray-500 mb-2">
                      Org: {client.client.organizationIdentifier}
                    </Paragraph>
                  )}
                  <Paragraph data-size="sm" className="text-gray-600">
                    Type: {client.client?.type || 'N/A'} {client.client?.variant && `(${client.client.variant})`}
                  </Paragraph>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {client.access?.length || 0} access
                </div>
              </div>
              {client.access && client.access.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Paragraph data-size="xs" className="text-gray-500 mb-1">Roles:</Paragraph>
                  <div className="flex flex-wrap gap-1">
                    {client.access.slice(0, 3).map((access, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                        {access.role?.code || access.role?.urn || 'Unknown'}
                      </span>
                    ))}
                    {client.access.length > 3 && (
                      <span className="text-gray-500 text-xs">+{client.access.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
