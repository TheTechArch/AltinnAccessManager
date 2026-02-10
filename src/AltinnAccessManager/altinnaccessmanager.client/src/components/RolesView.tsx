import { useState, useEffect, useCallback } from 'react';
import { Card, Heading, Paragraph, Spinner, Tag, Textfield, Button } from '@digdir/designsystemet-react';
import type { RoleDto } from '../types/metadata';
import { getRoles } from '../services/metadataApi';

interface RolesViewProps {
  language?: string;
  environment?: string;
}

export function RolesView({ language, environment }: RolesViewProps) {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKeyRoles, setFilterKeyRoles] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedRole(null);
      const data = await getRoles(language, environment);
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [language, environment]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKeyRoleFilter = !filterKeyRoles || role.isKeyRole;
    return matchesSearch && matchesKeyRoleFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading roles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card data-color="danger" className="p-4">
          <Paragraph>Error: {error}</Paragraph>
          <Button onClick={loadRoles} className="mt-4">Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Heading level={2} data-size="lg" className="mb-4">Roles</Heading>
        <Paragraph className="text-gray-600 mb-4">
          Browse available roles in the Altinn authorization system.
        </Paragraph>
        <div className="flex flex-wrap gap-4 items-end">
          <Textfield
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="max-w-md"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterKeyRoles}
              onChange={(e) => setFilterKeyRoles(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Show only key roles</span>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <div>
          <Heading level={3} data-size="sm" className="mb-3">
            Roles ({filteredRoles.length})
          </Heading>
          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {filteredRoles.map(role => (
              <Card
                key={role.id}
                data-color={selectedRole?.id === role.id ? 'accent' : 'neutral'}
                className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-center justify-between">
                  <Heading level={4} data-size="xs">{role.name || 'Unnamed Role'}</Heading>
                  {role.isKeyRole && (
                    <Tag data-size="sm" data-color="warning">Key Role</Tag>
                  )}
                </div>
                {role.code && (
                  <code className="text-sm text-gray-600">{role.code}</code>
                )}
                {role.description && (
                  <Paragraph data-size="sm" className="text-gray-600 mt-1 line-clamp-2">
                    {role.description}
                  </Paragraph>
                )}
              </Card>
            ))}
            {filteredRoles.length === 0 && (
              <Paragraph className="text-gray-500 italic">No roles match your search</Paragraph>
            )}
          </div>
        </div>

        {/* Role Details */}
        <div>
          <Heading level={3} data-size="sm" className="mb-3">Role Details</Heading>
          {selectedRole ? (
            <Card data-color="neutral" className="p-4">
              <Heading level={4} data-size="md" className="mb-2">
                {selectedRole.name || 'Unnamed Role'}
              </Heading>

              <div className="space-y-4">
                {selectedRole.code && (
                  <div>
                    <Paragraph data-size="sm" className="font-semibold">Code</Paragraph>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedRole.code}</code>
                  </div>
                )}

                {selectedRole.description && (
                  <div>
                    <Paragraph data-size="sm" className="font-semibold">Description</Paragraph>
                    <Paragraph>{selectedRole.description}</Paragraph>
                  </div>
                )}

                {selectedRole.urn && (
                  <div>
                    <Paragraph data-size="sm" className="font-semibold">URN</Paragraph>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all block">
                      {selectedRole.urn}
                    </code>
                  </div>
                )}

                {selectedRole.legacyRoleCode && (
                  <div>
                    <Paragraph data-size="sm" className="font-semibold">Legacy Role Code</Paragraph>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedRole.legacyRoleCode}
                    </code>
                  </div>
                )}

                {selectedRole.legacyUrn && (
                  <div>
                    <Paragraph data-size="sm" className="font-semibold">Legacy URN</Paragraph>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all block">
                      {selectedRole.legacyUrn}
                    </code>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedRole.isKeyRole && (
                    <Tag data-color="warning">Key Role</Tag>
                  )}
                  {selectedRole.isResourcePolicyAvailable && (
                    <Tag data-color="success">Resource Policy Available</Tag>
                  )}
                </div>

                {selectedRole.provider && (
                  <div>
                    <Paragraph data-size="sm" className="font-semibold">Provider</Paragraph>
                    <Card data-color="info" className="p-2 mt-1">
                      <Paragraph data-size="sm">
                        <strong>{selectedRole.provider.name}</strong>
                        {selectedRole.provider.code && (
                          <span className="text-gray-600"> ({selectedRole.provider.code})</span>
                        )}
                      </Paragraph>
                      {selectedRole.provider.type && (
                        <Tag data-size="sm" data-color="neutral" className="mt-1">
                          {selectedRole.provider.type.name}
                        </Tag>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Paragraph className="text-gray-500 italic">Select a role to view details</Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}
