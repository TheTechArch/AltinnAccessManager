import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Button, Textfield, Alert } from '@digdir/designsystemet-react';
import type { ClientDto, PaginatedResult, PersonInput } from '../types/clientAdmin';
import { getAgents, addAgent, deleteAgent } from '../services/clientAdminApi';

interface AgentsViewProps {
  partyId: string;
  onSelectAgent: (agent: ClientDto) => void;
  onBack: () => void;
}

export function AgentsView({ partyId, onSelectAgent, onBack }: AgentsViewProps) {
  const [agents, setAgents] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingAgent, setAddingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState<PersonInput>({ personIdentifier: '', lastName: '' });
  const [deletingAgent, setDeletingAgent] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, [partyId]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: PaginatedResult<ClientDto> = await getAgents(partyId);
      setAgents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    if (!newAgent.personIdentifier || !newAgent.lastName) {
      return;
    }
    
    try {
      setAddingAgent(true);
      await addAgent(partyId, undefined, newAgent);
      setShowAddForm(false);
      setNewAgent({ personIdentifier: '', lastName: '' });
      loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add agent');
    } finally {
      setAddingAgent(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to remove this agent? This will cascade delete all their delegations.')) {
      return;
    }
    
    try {
      setDeletingAgent(agentId);
      await deleteAgent(partyId, agentId, true);
      loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
    } finally {
      setDeletingAgent(null);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.client?.personIdentifier?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading agents..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <Alert data-color="danger" className="mb-4">
          <Heading level={3} data-size="xs">Error</Heading>
          <Paragraph>{error}</Paragraph>
        </Alert>
      )}

      <div className="mb-6">
        <Button onClick={onBack} variant="secondary" data-size="sm" className="mb-4">
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between mb-2">
          <Heading level={2} data-size="lg">Agents (Employees)</Heading>
          <Button onClick={() => setShowAddForm(!showAddForm)} data-size="sm">
            {showAddForm ? 'Cancel' : '+ Add Agent'}
          </Button>
        </div>
        <Paragraph className="text-gray-600 mb-4">
          People who work for your organization and can access client resources on your behalf.
        </Paragraph>

        {showAddForm && (
          <Card data-color="neutral" className="p-4 mb-4 border-2 border-green-200">
            <Heading level={3} data-size="sm" className="mb-3">Add New Agent</Heading>
            <Paragraph data-size="sm" className="text-gray-600 mb-4">
              Enter the personal information of the person you want to add as an agent.
            </Paragraph>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Textfield
                label="National Identity Number"
                value={newAgent.personIdentifier || ''}
                onChange={(e) => setNewAgent({ ...newAgent, personIdentifier: e.target.value })}
                placeholder="11 digits"
              />
              <Textfield
                label="Last Name (for verification)"
                value={newAgent.lastName || ''}
                onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddAgent} 
                disabled={addingAgent || !newAgent.personIdentifier || !newAgent.lastName}
              >
                {addingAgent ? 'Adding...' : 'Add Agent'}
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowAddForm(false);
                setNewAgent({ personIdentifier: '', lastName: '' });
              }}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Textfield
          label="Search agents"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or personal ID..."
          className="max-w-md"
        />
      </div>

      {filteredAgents.length === 0 ? (
        <Card data-color="neutral" className="p-6">
          <Paragraph className="text-gray-500 text-center">
            {searchTerm ? 'No agents match your search.' : 'No agents found. Add an agent to get started.'}
          </Paragraph>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent, index) => (
            <Card 
              key={agent.client?.id || index} 
              data-color="neutral" 
              className="p-4"
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectAgent(agent)}
                >
                  <Heading level={3} data-size="sm" className="mb-1">
                    {agent.client?.name || 'Unknown'}
                  </Heading>
                  {agent.client?.personIdentifier && (
                    <Paragraph data-size="sm" className="text-gray-500 mb-2">
                      ID: {agent.client.personIdentifier.substring(0, 6)}******
                    </Paragraph>
                  )}
                  <Paragraph data-size="sm" className="text-gray-600">
                    Type: {agent.client?.type || 'Person'}
                  </Paragraph>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {agent.access?.length || 0} roles
                  </div>
                  <Button 
                    variant="tertiary" 
                    data-size="sm" 
                    data-color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (agent.client?.id) handleDeleteAgent(agent.client.id);
                    }}
                    disabled={deletingAgent === agent.client?.id}
                  >
                    {deletingAgent === agent.client?.id ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              </div>
              {agent.access && agent.access.length > 0 && (
                <div 
                  className="mt-3 pt-3 border-t border-gray-200 cursor-pointer"
                  onClick={() => onSelectAgent(agent)}
                >
                  <Paragraph data-size="xs" className="text-gray-500 mb-1">Access packages:</Paragraph>
                  <div className="flex flex-wrap gap-1">
                    {agent.access.slice(0, 2).map((access, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                        {access.packages?.length || 0} packages via {access.role?.code || 'role'}
                      </span>
                    ))}
                    {agent.access.length > 2 && (
                      <span className="text-gray-500 text-xs">+{agent.access.length - 2} more</span>
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
