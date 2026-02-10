import { useState, useEffect, useCallback } from 'react';
import { Card, Heading, Paragraph, Spinner, Tag, Textfield, Button } from '@digdir/designsystemet-react';
import type { SubTypeDto } from '../types/metadata';
import { getOrganizationSubTypes } from '../services/metadataApi';

interface OrganizationTypesViewProps {
  language?: string;
  environment?: string;
}

export function OrganizationTypesView({ language, environment }: OrganizationTypesViewProps) {
  const [subTypes, setSubTypes] = useState<SubTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSubTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganizationSubTypes(language, environment);
      setSubTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization subtypes');
    } finally {
      setLoading(false);
    }
  }, [language, environment]);

  useEffect(() => {
    loadSubTypes();
  }, [loadSubTypes]);

  const filteredSubTypes = subTypes.filter(subType =>
    subType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subType.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group subtypes by their parent type
  const groupedByType = filteredSubTypes.reduce((acc, subType) => {
    const typeName = subType.type?.name || 'Unknown Type';
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(subType);
    return acc;
  }, {} as Record<string, SubTypeDto[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading organization types..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card data-color="danger" className="p-4">
          <Paragraph>Error: {error}</Paragraph>
          <Button onClick={loadSubTypes} className="mt-4">Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Heading level={2} data-size="lg" className="mb-4">Organization Types</Heading>
        <Paragraph className="text-gray-600 mb-4">
          Browse organization subtypes used in the Altinn authorization system.
        </Paragraph>
        <Textfield
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search organization types..."
          className="max-w-md"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByType).map(([typeName, types]) => (
          <div key={typeName}>
            <Heading level={3} data-size="sm" className="mb-3 flex items-center gap-2">
              {typeName}
              <Tag data-size="sm" data-color="info">{types.length} subtypes</Tag>
            </Heading>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {types.map(subType => (
                <Card key={subType.id} data-color="neutral" className="p-4">
                  <Heading level={4} data-size="xs">{subType.name || 'Unnamed Subtype'}</Heading>
                  {subType.description && (
                    <Paragraph data-size="sm" className="text-gray-600 mt-2">
                      {subType.description}
                    </Paragraph>
                  )}
                  {subType.type?.provider && (
                    <div className="mt-2">
                      <Tag data-size="sm" data-color="neutral">
                        Provider: {subType.type.provider.name}
                      </Tag>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedByType).length === 0 && (
          <Paragraph className="text-gray-500 italic">No organization types found</Paragraph>
        )}
      </div>
    </div>
  );
}
