import { useState, useRef, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Alert, Spinner, Tag } from '@digdir/designsystemet-react';
import type { ConnectionDto, PersonInput } from '../types/connections';
import type { AuthorizedPartyExternal } from '../types/authorizedParties';
import { getAuthorizedParties, flattenAuthorizedParties } from '../services/authorizedPartiesApi';
import { addConnection, addAccessPackage } from '../services/connectionsApi';
import { ConnectionsView } from './ConnectionsView';
import { ConnectionDetails } from './ConnectionDetails';

type DashboardView = 'home' | 'connections' | 'connection-details';

interface ConnectionsDashboardProps {
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function ConnectionsDashboard({ isAuthenticated, onLogin }: ConnectionsDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [partyId, setPartyId] = useState<string>('');
  const [selectedConnection, setSelectedConnection] = useState<ConnectionDto | null>(null);
  
  // Authorized parties state
  const [authorizedParties, setAuthorizedParties] = useState<AuthorizedPartyExternal[]>([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [partiesError, setPartiesError] = useState<string | null>(null);
  
  // Search state for party dropdown
  const [partySearchTerm, setPartySearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add connection modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'connection' | 'package'>('connection');
  const [newPersonId, setNewPersonId] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newToPartyId, setNewToPartyId] = useState('');
  const [newPackageUrn, setNewPackageUrn] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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
        anyOfResourceIds: ['altinn_access_management']
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

  const handleSelectConnection = (connection: ConnectionDto) => {
    setSelectedConnection(connection);
    setCurrentView('connection-details');
  };

  const handleAddConnection = async () => {
    try {
      setAdding(true);
      setAddError(null);

      if (addType === 'connection') {
        const person: PersonInput | undefined = newPersonId ? {
          personIdentifier: newPersonId,
          lastName: newLastName || null
        } : undefined;

        await addConnection(partyId, undefined, newToPartyId || undefined, person);
      } else {
        // Add package directly to a party
        const person: PersonInput | undefined = newPersonId ? {
          personIdentifier: newPersonId,
          lastName: newLastName || null
        } : undefined;

        await addAccessPackage(partyId, undefined, newToPartyId || undefined, undefined, newPackageUrn, person);
      }

      setShowAddModal(false);
      resetAddForm();
      // Refresh the view
      setCurrentView('home');
      setTimeout(() => setCurrentView('connections'), 100);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const resetAddForm = () => {
    setNewPersonId('');
    setNewLastName('');
    setNewToPartyId('');
    setNewPackageUrn('');
    setAddType('connection');
    setAddError(null);
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
            You need to log in with ID-porten to access the Connections dashboard. 
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
          <Heading level={2} data-size="lg" className="mb-4">Direct Rights Management</Heading>
          <Paragraph className="text-gray-600 mb-6">
            Select an organization or person you can represent to manage direct access rights (access packages, roles, resources) given to other parties.
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
    case 'connections':
      return (
        <ConnectionsView 
          partyId={partyId} 
          onSelectConnection={handleSelectConnection}
          onBack={() => setCurrentView('home')} 
        />
      );
    
    case 'connection-details':
      return selectedConnection ? (
        <ConnectionDetails 
          partyId={partyId} 
          connection={selectedConnection}
          onBack={() => setCurrentView('connections')}
          onConnectionDeleted={() => setCurrentView('connections')}
        />
      ) : null;
    
    default:
      return (
        <div className="p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Heading level={2} data-size="lg">Direct Rights Management</Heading>
                <Paragraph className="text-gray-600">
                  Manage direct access rights given to persons and organizations
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

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
              onClick={() => setCurrentView('connections')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="md" className="mb-2">View Connections</Heading>
                  <Paragraph className="text-gray-600">
                    See all persons and organizations that have been given direct access rights from this party.
                  </Paragraph>
                </div>
              </div>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
              onClick={() => {
                setAddType('package');
                setShowAddModal(true);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="md" className="mb-2">Add Access Package</Heading>
                  <Paragraph className="text-gray-600">
                    Grant a new access package to a person or organization.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </div>

          {/* Info Section */}
          <Card data-color="neutral" className="p-6">
            <Heading level={3} data-size="md" className="mb-4">About Direct Rights</Heading>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <Heading level={4} data-size="sm" className="mb-2">Access Packages</Heading>
                <Paragraph data-size="sm" className="text-gray-600">
                  Pre-defined bundles of permissions for specific use cases, like tax reporting or employee management.
                </Paragraph>
              </div>
              <div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <Heading level={4} data-size="sm" className="mb-2">Roles</Heading>
                <Paragraph data-size="sm" className="text-gray-600">
                  Organizational roles that grant specific permissions, often inherited from the national registry.
                </Paragraph>
              </div>
              <div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <Heading level={4} data-size="sm" className="mb-2">Resources</Heading>
                <Paragraph data-size="sm" className="text-gray-600">
                  Direct access to specific services or APIs, with granular action-level permissions.
                </Paragraph>
              </div>
            </div>
          </Card>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card data-color="neutral" className="p-6 max-w-lg w-full mx-4">
                <Heading level={3} data-size="md" className="mb-4">
                  {addType === 'connection' ? 'Add New Connection' : 'Add Access Package'}
                </Heading>
                
                <div className="space-y-4">
                  {/* Type selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="addType"
                          value="connection"
                          checked={addType === 'connection'}
                          onChange={() => setAddType('connection')}
                          className="mr-2"
                        />
                        Connection only
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="addType"
                          value="package"
                          checked={addType === 'package'}
                          onChange={() => setAddType('package')}
                          className="mr-2"
                        />
                        With Access Package
                      </label>
                    </div>
                  </div>

                  {/* Target selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Party UUID (if known)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Party UUID..."
                      value={newToPartyId}
                      onChange={(e) => setNewToPartyId(e.target.value)}
                    />
                  </div>

                  <div className="text-center text-gray-500 text-sm">— OR lookup by person —</div>

                  {/* Person lookup */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Person Identifier (fødselsnummer)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="11-digit national ID..."
                      value={newPersonId}
                      onChange={(e) => setNewPersonId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name (for verification)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name..."
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                    />
                  </div>

                  {/* Package URN for package type */}
                  {addType === 'package' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package URN *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., urn:altinn:accesspackage:skatteetaten/mva"
                        value={newPackageUrn}
                        onChange={(e) => setNewPackageUrn(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {addError && (
                  <Alert data-color="danger" className="mt-4">
                    <Paragraph>{addError}</Paragraph>
                  </Alert>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setShowAddModal(false);
                      resetAddForm();
                    }}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddConnection}
                    disabled={adding || (!newToPartyId && !newPersonId) || (addType === 'package' && !newPackageUrn)}
                  >
                    {adding ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      );
  }
}
