import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Spinner, Tag, Textfield, Button } from '@digdir/designsystemet-react';
import type { AreaGroupDto, PackageDto, AreaDto } from '../types/metadata';
import { getAreaGroups, getPackagesByAreaId } from '../services/metadataApi';

export function PackagesView() {
  const [areaGroups, setAreaGroups] = useState<AreaGroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AreaGroupDto | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaDto | null>(null);
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAreaGroups();
  }, []);

  const loadAreaGroups = async () => {
    try {
      setLoading(true);
      const data = await getAreaGroups();
      setAreaGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load area groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = async (area: AreaDto) => {
    setSelectedArea(area);
    setLoadingPackages(true);
    try {
      const data = await getPackagesByAreaId(area.id);
      setPackages(data);
    } catch (err) {
      console.error('Failed to load packages:', err);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
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
          <Button onClick={loadAreaGroups} className="mt-4">Retry</Button>
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
            {filteredGroups.map(group => (
              <Card
                key={group.id}
                data-color={selectedGroup?.id === group.id ? 'accent' : 'neutral'}
                className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedArea(null);
                  setPackages([]);
                }}
              >
                <Heading level={4} data-size="xs">{group.name || 'Unnamed Group'}</Heading>
                <Tag data-size="sm" data-color="info" className="mt-1">
                  {group.areas?.length || 0} areas
                </Tag>
                {group.type && (
                  <Tag data-size="sm" data-color="neutral" className="mt-1 ml-1">
                    {group.type}
                  </Tag>
                )}
              </Card>
            ))}
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
          {loadingPackages ? (
            <div className="flex items-center justify-center p-8">
              <Spinner aria-label="Loading packages..." />
            </div>
          ) : selectedArea ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {packages.map(pkg => (
                <Card key={pkg.id} data-color="neutral" className="p-3">
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
              {packages.length === 0 && (
                <Paragraph className="text-gray-500 italic">No packages in this area</Paragraph>
              )}
            </div>
          ) : (
            <Paragraph className="text-gray-500 italic">Select an area to view packages</Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}
