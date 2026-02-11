import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Alert, Spinner, Tag } from '@digdir/designsystemet-react';
import type { ConnectionDto, PackagePermissionDto, RolePermissionDto, ResourcePermissionDto } from '../types/connections';
import { getAccessPackages, getRoles, getResources, deleteAccessPackage, deleteRole, deleteResource, deleteConnection, addAccessPackage } from '../services/connectionsApi';

interface ConnectionDetailsProps {
  partyId: string;
  connection: ConnectionDto;
  onBack: () => void;
  onConnectionDeleted?: () => void;
}

type DetailsTab = 'packages' | 'roles' | 'resources';

export function ConnectionDetails({ partyId, connection, onBack, onConnectionDeleted }: ConnectionDetailsProps) {
  const [activeTab, setActiveTab] = useState<DetailsTab>('packages');
  const [packages, setPackages] = useState<PackagePermissionDto[]>([]);
  const [roles, setRoles] = useState<RolePermissionDto[]>([]);
  const [resources, setResources] = useState<ResourcePermissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'package' | 'role' | 'resource' | 'connection'; item?: unknown } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add package state
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [newPackageUrn, setNewPackageUrn] = useState('');
  const [addingPackage, setAddingPackage] = useState(false);
  const [addPackageError, setAddPackageError] = useState<string | null>(null);

  const toPartyId = connection.party?.id;

  useEffect(() => {
    loadDetails();
  }, [partyId, connection, activeTab]);

  const loadDetails = async () => {
    if (!toPartyId) return;
    
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case 'packages': {
          const result = await getAccessPackages(partyId, undefined, toPartyId);
          setPackages(result.data || []);
          break;
        }
        case 'roles': {
          const result = await getRoles(partyId, undefined, toPartyId);
          setRoles(result.data || []);
          break;
        }
        case 'resources': {
          const result = await getResources(partyId, undefined, toPartyId);
          setResources(result.data || []);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !toPartyId) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      switch (deleteTarget.type) {
        case 'package': {
          const pkg = deleteTarget.item as PackagePermissionDto;
          await deleteAccessPackage(partyId, undefined, toPartyId, pkg.package.id);
          break;
        }
        case 'role': {
          const role = deleteTarget.item as RolePermissionDto;
          if (role.role.code) {
            await deleteRole(partyId, role.role.code, undefined, toPartyId);
          }
          break;
        }
        case 'resource': {
          const resource = deleteTarget.item as ResourcePermissionDto;
          if (resource.resource.value) {
            await deleteResource(partyId, resource.resource.value, undefined, toPartyId);
          }
          break;
        }
        case 'connection': {
          await deleteConnection(partyId, undefined, toPartyId, true);
          setShowDeleteModal(false);
          onConnectionDeleted?.();
          return;
        }
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadDetails();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddPackage = async () => {
    if (!newPackageUrn.trim() || !toPartyId) return;

    try {
      setAddingPackage(true);
      setAddPackageError(null);
      
      await addAccessPackage(partyId, undefined, toPartyId, undefined, newPackageUrn.trim());
      
      setShowAddPackageModal(false);
      setNewPackageUrn('');
      loadDetails();
    } catch (err) {
      setAddPackageError(err instanceof Error ? err.message : 'Failed to add package');
    } finally {
      setAddingPackage(false);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="tertiary" data-size="sm" onClick={onBack} className="mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Connections
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heading level={2} data-size="lg">
                {connection.party?.name || 'Unknown Party'}
              </Heading>
              {getEntityTypeTag(connection.party?.type)}
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              {connection.party?.organizationIdentifier && (
                <div><span className="font-medium">Org:</span> {connection.party.organizationIdentifier}</div>
              )}
              {connection.party?.personIdentifier && (
                <div><span className="font-medium">Person:</span> {connection.party.personIdentifier.substring(0, 6)}***</div>
              )}
              <div><span className="font-medium">Party ID:</span> {toPartyId}</div>
            </div>
          </div>

          <Button 
            variant="secondary" 
            data-size="sm" 
            data-color="danger"
            onClick={() => {
              setDeleteTarget({ type: 'connection' });
              setShowDeleteModal(true);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove All Access
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          {(['packages', 'roles', 'resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'packages' && 'Access Packages'}
              {tab === 'roles' && 'Roles'}
              {tab === 'resources' && 'Resources'}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <Alert data-color="danger" className="mb-6">
          <Paragraph>{error}</Paragraph>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner aria-label="Loading..." />
        </div>
      ) : (
        <>
          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Paragraph className="text-gray-500">
                  {packages.length} access package(s) assigned
                </Paragraph>
                <Button variant="secondary" data-size="sm" onClick={() => setShowAddPackageModal(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Package
                </Button>
              </div>

              {packages.length === 0 ? (
                <Card data-color="neutral" className="p-6 text-center">
                  <Paragraph className="text-gray-500">No access packages assigned</Paragraph>
                </Card>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg, idx) => (
                    <Card key={pkg.package.id || idx} data-color="neutral" className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{pkg.package.urn || pkg.package.id}</div>
                          <div className="text-sm text-gray-500">
                            {pkg.permissions?.length || 0} permission(s)
                          </div>
                        </div>
                        <Button 
                          variant="tertiary" 
                          data-size="sm" 
                          data-color="danger"
                          onClick={() => {
                            setDeleteTarget({ type: 'package', item: pkg });
                            setShowDeleteModal(true);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div>
              <Paragraph className="text-gray-500 mb-4">
                {roles.length} role(s) assigned
              </Paragraph>

              {roles.length === 0 ? (
                <Card data-color="neutral" className="p-6 text-center">
                  <Paragraph className="text-gray-500">No roles assigned</Paragraph>
                </Card>
              ) : (
                <div className="space-y-3">
                  {roles.map((role, idx) => (
                    <Card key={role.role.id || idx} data-color="neutral" className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{role.role.name || role.role.code}</div>
                          <div className="text-sm text-gray-500">
                            {role.role.urn && <span className="mr-2">{role.role.urn}</span>}
                            {role.permissions?.length || 0} permission(s)
                          </div>
                          {role.role.description && (
                            <div className="text-sm text-gray-400 mt-1">{role.role.description}</div>
                          )}
                        </div>
                        <Button 
                          variant="tertiary" 
                          data-size="sm" 
                          data-color="danger"
                          onClick={() => {
                            setDeleteTarget({ type: 'role', item: role });
                            setShowDeleteModal(true);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              <Paragraph className="text-gray-500 mb-4">
                {resources.length} resource(s) with direct access
              </Paragraph>

              {resources.length === 0 ? (
                <Card data-color="neutral" className="p-6 text-center">
                  <Paragraph className="text-gray-500">No direct resource access</Paragraph>
                </Card>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource, idx) => (
                    <Card key={resource.resource.id || idx} data-color="neutral" className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{resource.resource.value || resource.resource.id}</div>
                          <div className="text-sm text-gray-500">
                            {resource.permissions?.length || 0} permission(s)
                          </div>
                        </div>
                        <Button 
                          variant="tertiary" 
                          data-size="sm" 
                          data-color="danger"
                          onClick={() => {
                            setDeleteTarget({ type: 'resource', item: resource });
                            setShowDeleteModal(true);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card data-color="neutral" className="p-6 max-w-md w-full mx-4">
            <Heading level={3} data-size="md" className="mb-4">Confirm Deletion</Heading>
            
            <Paragraph className="mb-4">
              {deleteTarget?.type === 'connection' 
                ? `Are you sure you want to remove ALL access for "${connection.party?.name}"? This will revoke all packages, roles, and resources.`
                : `Are you sure you want to remove this ${deleteTarget?.type}?`
              }
            </Paragraph>

            {deleteError && (
              <Alert data-color="danger" className="mb-4">
                <Paragraph>{deleteError}</Paragraph>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                data-color="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card data-color="neutral" className="p-6 max-w-md w-full mx-4">
            <Heading level={3} data-size="md" className="mb-4">Add Access Package</Heading>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package URN
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., urn:altinn:accesspackage:skatteetaten/mva"
                value={newPackageUrn}
                onChange={(e) => setNewPackageUrn(e.target.value)}
              />
              <Paragraph data-size="sm" className="text-gray-500 mt-1">
                Enter the full URN of the access package to assign
              </Paragraph>
            </div>

            {addPackageError && (
              <Alert data-color="danger" className="mb-4">
                <Paragraph>{addPackageError}</Paragraph>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowAddPackageModal(false);
                  setNewPackageUrn('');
                  setAddPackageError(null);
                }}
                disabled={addingPackage}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddPackage}
                disabled={addingPackage || !newPackageUrn.trim()}
              >
                {addingPackage ? 'Adding...' : 'Add Package'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
