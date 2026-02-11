import { useState, useRef, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Alert, Spinner } from '@digdir/designsystemet-react';
import type { ClientDto, AgentDto } from '../types/clientAdmin';
import type { AuthorizedPartyExternal } from '../types/authorizedParties';
import { downloadDelegationsCsv, uploadDelegationsCsv, type ImportResult } from '../services/clientAdminApi';
import { getAuthorizedParties, flattenAuthorizedParties } from '../services/authorizedPartiesApi';
import { ClientsView } from './ClientsView';
import { AgentsView } from './AgentsView';
import { ClientDetails } from './ClientDetails';
import { AgentDetails } from './AgentDetails';

type DashboardView = 'home' | 'clients' | 'agents' | 'client-details' | 'agent-details';

interface ClientAdminDashboardProps {
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function ClientAdminDashboard({ isAuthenticated, onLogin }: ClientAdminDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [partyId, setPartyId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentDto | null>(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Authorized parties state
  const [authorizedParties, setAuthorizedParties] = useState<AuthorizedPartyExternal[]>([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [partiesError, setPartiesError] = useState<string | null>(null);
  
  // Search state for party dropdown
  const [partySearchTerm, setPartySearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load authorized parties when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAuthorizedParties();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAuthorizedParties = async () => {
    try {
      setLoadingParties(true);
      setPartiesError(null);
      const parties = await getAuthorizedParties({
        anyOfResourceIds: ['altinn_client_administration']
      });
      // Flatten to include subunits
      const flattened = flattenAuthorizedParties(parties);
      // Filter out parties that are only hierarchy elements
      const filtered = flattened.filter(p => !p.onlyHierarchyElementWithNoAccess && !p.isDeleted);
      setAuthorizedParties(filtered);
    } catch (err) {
      setPartiesError(err instanceof Error ? err.message : 'Failed to load authorized parties');
    } finally {
      setLoadingParties(false);
    }
  };

  const handleSelectParty = (partyUuid: string) => {
    setPartyId(partyUuid);
    setIsDropdownOpen(false);
    setPartySearchTerm('');
  };

  // Filter parties based on search term
  const filteredParties = authorizedParties.filter(party => {
    if (!partySearchTerm) return true;
    const searchLower = partySearchTerm.toLowerCase();
    const name = party.name?.toLowerCase() || '';
    const orgNumber = party.organizationNumber?.toLowerCase() || '';
    const personId = party.personId?.toLowerCase() || '';
    const partyUuid = party.partyUuid?.toLowerCase() || '';
    return name.includes(searchLower) || 
           orgNumber.includes(searchLower) || 
           personId.includes(searchLower) ||
           partyUuid.includes(searchLower);
  });

  const handleSelectClient = (client: ClientDto) => {
    setSelectedClient(client);
    setCurrentView('client-details');
  };

  const handleSelectAgent = (agent: AgentDto) => {
    setSelectedAgent(agent);
    setCurrentView('agent-details');
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      setDownloadError(null);
      await downloadDelegationsCsv(partyId);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to download CSV');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCsv(true);
      setUploadError(null);
      setUploadResult(null);
      const result = await uploadDelegationsCsv(partyId, file);
      setUploadResult(result);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload CSV');
    } finally {
      setUploadingCsv(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <Heading level={2} data-size="lg" className="mb-4">Authentication Required</Heading>
          <Paragraph className="text-gray-600 mb-6">
            You need to log in with ID-porten to access the Client Admin dashboard. 
            This requires authentication to interact with the Altinn API on your behalf.
          </Paragraph>
          <Button onClick={onLogin} data-size="lg">
            Logg inn med ID-porten
          </Button>
        </div>
      </div>
    );
  }

  // No party selected view
  if (!partyId) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Heading level={2} data-size="lg" className="mb-4">Client Delegation Admin</Heading>
          <Paragraph className="text-gray-600 mb-6">
            Select an organization you can represent to manage client delegations and agents.
          </Paragraph>
          
          {/* Authorized Parties Searchable Dropdown */}
          <Card data-color="neutral" className="p-6" style={{ overflow: 'visible' }}>
            <Heading level={3} data-size="md" className="mb-4">Select Party</Heading>
            
            
            {loadingParties ? (
              <div className="flex items-center gap-3 py-4">
                <Spinner aria-label="Loading authorized parties..." />
                <Paragraph>Loading parties you can represent...</Paragraph>
              </div>
            ) : partiesError ? (
              <Alert data-color="warning" className="mb-4">
                <Paragraph>{partiesError}</Paragraph>
                <Button variant="tertiary" data-size="sm" onClick={loadAuthorizedParties} className="mt-2">
                  Try Again
                </Button>
              </Alert>
            ) : authorizedParties.length > 0 ? (
              <div ref={dropdownRef} className="relative" style={{ zIndex: 100 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and select organization ({authorizedParties.length} available)
                </label>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type to search by name, org number, or UUID..."
                    value={partySearchTerm}
                    onChange={(e) => {
                      setPartySearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Results */}
                {isDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto" style={{ zIndex: 9999 }}>
                    {filteredParties.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No parties match your search
                      </div>
                    ) : (
                      filteredParties.map((party) => (
                        <button
                          key={party.partyUuid}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleSelectParty(party.partyUuid)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {party.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {party.organizationNumber && (
                                  <span>Org: {party.organizationNumber}</span>
                                )}
                                {party.personId && (
                                  <span>Person: {party.personId.substring(0, 6)}***</span>
                                )}
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                party.type === 'Organization' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : party.type === 'Person'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {party.type}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <Paragraph data-size="sm" className="text-gray-500 mt-3">
                  {filteredParties.length === authorizedParties.length 
                    ? `Showing all ${authorizedParties.length} parties`
                    : `Showing ${filteredParties.length} of ${authorizedParties.length} parties`
                  }
                </Paragraph>
              </div>
            ) : (
              <Alert data-color="info">
                <Paragraph>No authorized parties found. Please contact your administrator.</Paragraph>
              </Alert>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Render based on current view
  switch (currentView) {
    case 'clients':
      return (
        <ClientsView 
          partyId={partyId} 
          onSelectClient={handleSelectClient}
          onBack={() => setCurrentView('home')} 
        />
      );
    
    case 'agents':
      return (
        <AgentsView 
          partyId={partyId} 
          onSelectAgent={handleSelectAgent}
          onBack={() => setCurrentView('home')} 
        />
      );
    
    case 'client-details':
      return selectedClient ? (
        <ClientDetails 
          partyId={partyId} 
          client={selectedClient}
          onBack={() => setCurrentView('clients')} 
        />
      ) : null;
    
    case 'agent-details':
      return selectedAgent ? (
        <AgentDetails 
          partyId={partyId} 
          agent={selectedAgent}
          onBack={() => setCurrentView('agents')} 
        />
      ) : null;
    
    default:
      return (
        <div className="p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Heading level={2} data-size="lg">Client Delegation Admin</Heading>
                <Paragraph className="text-gray-600">
                  Manage your organization's clients and agents
                </Paragraph>
              </div>
              <Button variant="secondary" data-size="sm" onClick={() => setPartyId('')}>
                Change Party
              </Button>
            </div>
            <Alert data-color="info">
              <Paragraph data-size="sm">
                <strong>Current Party:</strong> {partyId}
              </Paragraph>
            </Alert>
          </div>

          {downloadError && (
            <Alert data-color="danger" className="mb-4">
              <Heading level={3} data-size="xs">Download Error</Heading>
              <Paragraph>{downloadError}</Paragraph>
            </Alert>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
              onClick={() => setCurrentView('clients')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="md" className="mb-2">Clients</Heading>
                  <Paragraph className="text-gray-600">
                    View all organizations that have delegated access to you. See which agents have access to each client's resources.
                  </Paragraph>
                </div>
              </div>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
              onClick={() => setCurrentView('agents')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="md" className="mb-2">Agents (Employees)</Heading>
                  <Paragraph className="text-gray-600">
                    Manage people who work for your organization. Add, remove, and view what access each agent has to client resources.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </div>

          {/* Bulk Operations */}
          <Card data-color="neutral" className="p-6 mb-8">
            <Heading level={3} data-size="md" className="mb-4">Bulk Operations</Heading>
            <Paragraph className="text-gray-600 mb-4">
              For organizations managing large numbers of clients and agents, you can export and import delegations in CSV format.
            </Paragraph>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <Button 
                onClick={handleDownloadCsv}
                disabled={downloadingCsv}
                variant="secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {downloadingCsv ? 'Downloading...' : 'Download Delegations (CSV)'}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <Button 
                onClick={handleUploadClick}
                disabled={uploadingCsv}
                variant="secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploadingCsv ? 'Uploading...' : 'Upload Delegations (CSV)'}
              </Button>
            </div>

            {uploadError && (
              <Alert data-color="danger" className="mb-4">
                <Heading level={4} data-size="xs">Upload Error</Heading>
                <Paragraph>{uploadError}</Paragraph>
              </Alert>
            )}

            {uploadResult && (
              <Alert data-color={uploadResult.failedCount > 0 ? "warning" : "success"} className="mb-4">
                <Heading level={4} data-size="xs">Import Complete</Heading>
                <div className="mt-2 space-y-1">
                  <Paragraph data-size="sm">
                    <strong>Changed:</strong> {uploadResult.successCount} | 
                    <strong className="ml-2">Unchanged:</strong> {uploadResult.unchangedCount} | 
                    <strong className="ml-2">Failed:</strong> {uploadResult.failedCount} | 
                    <strong className="ml-2">Skipped:</strong> {uploadResult.skipped}
                  </Paragraph>
                  <Paragraph data-size="sm">
                    <strong>Agents added:</strong> {uploadResult.agentsAdded} | 
                    <strong className="ml-2">Delegations added:</strong> {uploadResult.delegationsAdded} | 
                    <strong className="ml-2">Delegations removed:</strong> {uploadResult.delegationsRemoved}
                  </Paragraph>
                  {uploadResult.packageNamesMigrated > 0 && (
                    <Paragraph data-size="sm" className="text-blue-600">
                      <strong>Package names migrated:</strong> {uploadResult.packageNamesMigrated} (old format converted to URN)
                    </Paragraph>
                  )}
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <Paragraph data-size="xs" className="font-semibold">Errors:</Paragraph>
                      <ul className="list-disc list-inside text-xs text-gray-600 max-h-32 overflow-y-auto">
                        {uploadResult.errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 10 && (
                          <li>...and {uploadResult.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </Alert>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <Paragraph data-size="sm" className="text-gray-600">
                <strong>CSV Format:</strong> status;orgnumber;fnumber;name;package;email
              </Paragraph>
              <Paragraph data-size="xs" className="text-gray-500 mt-1">
                - <strong>status</strong>: A = Active, U = Utgatt (delete when uploading)<br/>
                - <strong>orgnumber</strong>: Organization number of the client<br/>
                - <strong>fnumber</strong>: Person identifier (fodselsnummer) of the agent<br/>
                - <strong>name</strong>: Name of the agent (used as lastName when adding new agent)<br/>
                - <strong>package</strong>: URN of the access package<br/>
                - <strong>email</strong>: Email address (- if not available)
              </Paragraph>
            </div>
          </Card>

          {/* Info Section */}
          <Card data-color="neutral" className="p-6">
            <Heading level={3} data-size="md" className="mb-4">How Client Delegation Works</Heading>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-purple-700 font-bold">1</span>
                </div>
                <Heading level={4} data-size="sm" className="mb-2">Clients Delegate Access</Heading>
                <Paragraph data-size="sm" className="text-gray-600">
                  Organizations (clients) delegate access to your organization through roles and access packages.
                </Paragraph>
              </div>
              <div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-purple-700 font-bold">2</span>
                </div>
                <Heading level={4} data-size="sm" className="mb-2">You Manage Agents</Heading>
                <Paragraph data-size="sm" className="text-gray-600">
                  Add employees as agents who can act on behalf of your organization when accessing client resources.
                </Paragraph>
              </div>
              <div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-purple-700 font-bold">3</span>
                </div>
                <Heading level={4} data-size="sm" className="mb-2">Delegate to Agents</Heading>
                <Paragraph data-size="sm" className="text-gray-600">
                  Assign specific access packages from clients to your agents so they can perform their work.
                </Paragraph>
              </div>
            </div>
          </Card>
        </div>
      );
  }
}
