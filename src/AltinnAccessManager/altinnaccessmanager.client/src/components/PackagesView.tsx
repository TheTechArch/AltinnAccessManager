import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Tag, Textfield, Button } from '@digdir/designsystemet-react';
import type { AreaGroupDto, AreaDto, PackageDto } from '../types/metadata';
import { exportAccessPackages, getPackageById } from '../services/metadataApi';

interface PackagesViewProps {
  language?: string;
}

export function PackagesView({ language }: PackagesViewProps) {
const [areaGroups, setAreaGroups] = useState<AreaGroupDto[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedGroup, setSelectedGroup] = useState<AreaGroupDto | null>(null);
const [selectedArea, setSelectedArea] = useState<AreaDto | null>(null);
const [selectedPackage, setSelectedPackage] = useState<PackageDto | null>(null);
const [loadingPackage, setLoadingPackage] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  loadData();
}, [language]);

const loadData = async () => {
  try {
    setLoading(true);
    // Use export endpoint which returns the full hierarchy (groups -> areas -> packages)
    const data = await exportAccessPackages(language);
    setAreaGroups(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load access packages');
  } finally {
    setLoading(false);
  }
};

const handleAreaClick = (area: AreaDto) => {
  setSelectedArea(area);
  setSelectedPackage(null);
};

const handlePackageClick = async (pkg: PackageDto) => {
  // Toggle off if clicking the same package
  if (selectedPackage?.id === pkg.id) {
    setSelectedPackage(null);
    return;
  }

  // Fetch full package details including resources
  setLoadingPackage(true);
  setSelectedPackage(pkg); // Show basic info immediately
  try {
    const fullPackage = await getPackageById(pkg.id, language);
    setSelectedPackage(fullPackage);
  } catch (err) {
    console.error('Failed to load package details:', err);
    // Keep showing basic package info if fetch fails
  } finally {
    setLoadingPackage(false);
  }
};

  const filteredGroups = areaGroups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.areas?.some(area =>
      area.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.packages?.some(pkg => pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label="Loading packages..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card data-color="danger" className="p-4">
          <Paragraph>Error: {error}</Paragraph>
          <Button onClick={loadData} className="mt-4">Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Heading level={2} data-size="lg" className="mb-4">Access Packages</Heading>
        <Paragraph className="text-gray-600 mb-4">
          Browse access packages organized by area groups and areas.
        </Paragraph>
        <Textfield
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search packages, areas, or groups..."
          className="max-w-md"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area Groups Column */}
        <div>
          <Heading level={3} data-size="sm" className="mb-3">Area Groups</Heading>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredGroups.map(group => {
              const totalPackages = group.areas?.reduce((sum, area) => sum + (area.packages?.length || 0), 0) || 0;
              return (
                <Card
                  key={group.id}
                  data-color={selectedGroup?.id === group.id ? 'accent' : 'neutral'}
                  className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setSelectedGroup(group);
                    setSelectedArea(null);
                    setSelectedPackage(null);
                  }}
                >
                  <Heading level={4} data-size="xs">{group.name || 'Unnamed Group'}</Heading>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Tag data-size="sm" data-color="info">
                      {group.areas?.length || 0} areas
                    </Tag>
                    <Tag data-size="sm" data-color="success">
                      {totalPackages} packages
                    </Tag>
                    {group.type && (
                      <Tag data-size="sm" data-color="neutral">
                        {group.type}
                      </Tag>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Areas Column */}
        <div>
          <Heading level={3} data-size="sm" className="mb-3">
            Areas {selectedGroup && `in ${selectedGroup.name}`}
          </Heading>
          {selectedGroup ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedGroup.areas?.map(area => (
                <Card
                  key={area.id}
                  data-color={selectedArea?.id === area.id ? 'accent' : 'neutral'}
                  className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleAreaClick(area)}
                >
                  <div className="flex items-center gap-2">
                    {area.iconUrl && (
                      <img src={area.iconUrl} alt="" className="w-6 h-6" />
                    )}
                    <Heading level={4} data-size="xs">{area.name || 'Unnamed Area'}</Heading>
                  </div>
                  {area.description && (
                    <Paragraph data-size="sm" className="text-gray-600 mt-1 line-clamp-2">
                      {area.description}
                    </Paragraph>
                  )}
                  <Tag data-size="sm" data-color="info" className="mt-2">
                    {area.packages?.length || 0} packages
                  </Tag>
                </Card>
              ))}
              {(!selectedGroup.areas || selectedGroup.areas.length === 0) && (
                <Paragraph className="text-gray-500 italic">No areas in this group</Paragraph>
              )}
            </div>
          ) : (
            <Paragraph className="text-gray-500 italic">Select an area group to view areas</Paragraph>
          )}
        </div>

        {/* Packages Column */}
        <div>
          <Heading level={3} data-size="sm" className="mb-3">
            Packages {selectedArea && `in ${selectedArea.name}`}
          </Heading>
          {selectedArea ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedArea.packages?.map(pkg => (
                <Card 
                  key={pkg.id} 
                  data-color={selectedPackage?.id === pkg.id ? 'accent' : 'neutral'} 
                  className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handlePackageClick(pkg)}
                >
                  <Heading level={4} data-size="xs">{pkg.name || 'Unnamed Package'}</Heading>
                  {pkg.description && (
                    <Paragraph data-size="sm" className="text-gray-600 mt-1 line-clamp-2">
                      {pkg.description}
                    </Paragraph>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.isDelegable && (
                      <Tag data-size="sm" data-color="success">Delegable</Tag>
                    )}
                    {pkg.isAssignable && (
                      <Tag data-size="sm" data-color="info">Assignable</Tag>
                    )}
                    {pkg.resources && pkg.resources.length > 0 && (
                      <Tag data-size="sm" data-color="neutral">
                        {pkg.resources.length} resources
                      </Tag>
                    )}
                  </div>
                  {pkg.urn && (
                    <code className="text-xs text-gray-500 block mt-2 break-all">{pkg.urn}</code>
                  )}
                </Card>
              ))}
              {(!selectedArea.packages || selectedArea.packages.length === 0) && (
                <Paragraph className="text-gray-500 italic">No packages in this area</Paragraph>
              )}
            </div>
          ) : (
            <Paragraph className="text-gray-500 italic">Select an area to view packages</Paragraph>
          )}
        </div>
      </div>

      {/* Package Resources Panel */}
      {selectedPackage && (
        <div className="mt-6">
          <Card data-color="neutral" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} data-size="md">{selectedPackage.name}</Heading>
                {selectedPackage.description && (
                  <Paragraph className="text-gray-600 mt-1">{selectedPackage.description}</Paragraph>
                )}
              </div>
              <Button 
                variant="tertiary" 
                data-size="sm"
                onClick={() => setSelectedPackage(null)}
              >
                ? Close
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPackage.isDelegable && (
                <Tag data-color="success">Delegable</Tag>
              )}
              {selectedPackage.isAssignable && (
                <Tag data-color="info">Assignable</Tag>
              )}
              {selectedPackage.isResourcePolicyAvailable && (
                <Tag data-color="warning">Resource Policy Available</Tag>
              )}
            </div>

            {selectedPackage.urn && (
              <div className="mb-4 p-2 bg-gray-100 rounded">
                <Paragraph data-size="sm" className="font-semibold">URN</Paragraph>
                <code className="text-sm break-all">{selectedPackage.urn}</code>
              </div>
            )}

            <div className="border-t pt-4">
              <Heading level={4} data-size="sm" className="mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Resources {!loadingPackage && `(${selectedPackage.resources?.length || 0})`}
              </Heading>

              {loadingPackage ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner aria-label="Loading resources..." />
                  <span className="ml-2 text-gray-500">Loading resources...</span>
                </div>
              ) : selectedPackage.resources && selectedPackage.resources.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedPackage.resources.map(resource => (
                    <Card key={resource.id} data-color="info" className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-grow min-w-0">
                          <Heading level={5} data-size="xs" className="truncate">
                            {resource.name || 'Unnamed Resource'}
                          </Heading>
                          {resource.description && (
                            <Paragraph data-size="sm" className="text-gray-600 mt-1 line-clamp-2">
                              {resource.description}
                            </Paragraph>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resource.type?.name && (
                              <Tag data-size="sm" data-color="neutral">{resource.type.name}</Tag>
                            )}
                            {resource.provider?.name && (
                              <Tag data-size="sm" data-color="info">{resource.provider.name}</Tag>
                            )}
                          </div>
                          {resource.refId && (
                            <code className="text-xs text-gray-500 block mt-1 truncate" title={resource.refId}>
                              {resource.refId}
                            </code>
                          )}
                          {/* Resource Registry Links */}
                          {resource.refId && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <a
                                href={`https://platform.tt02.altinn.no/resourceregistry/api/v1/Resource/${resource.refId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <Tag data-size="sm" data-color="first" className="cursor-pointer hover:opacity-80">
                                  Definition
                                </Tag>
                              </a>
                              <a
                                href={`https://platform.tt02.altinn.no/resourceregistry/api/v1/Resource/${resource.refId}/policy`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <Tag data-size="sm" data-color="second" className="cursor-pointer hover:opacity-80">
                                  Policy
                                </Tag>
                              </a>
                              <a
                                href={`https://platform.tt02.altinn.no/resourceregistry/api/v1/Resource/${resource.refId}/policy/rules`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <Tag data-size="sm" data-color="third" className="cursor-pointer hover:opacity-80">
                                  Rules
                                </Tag>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <Paragraph className="text-gray-500">No resources in this package</Paragraph>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


