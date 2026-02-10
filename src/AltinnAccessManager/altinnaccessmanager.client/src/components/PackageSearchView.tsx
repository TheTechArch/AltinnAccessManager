import { useState } from 'react';
import { Card, Heading, Paragraph, Spinner, Tag, Textfield, Button } from '@digdir/designsystemet-react';
import type { SearchObjectOfPackageDto, PackageDto } from '../types/metadata';
import { searchPackages, getPackageById } from '../services/metadataApi';

interface PackageSearchViewProps {
  language?: string;
  environment?: string;
}

export function PackageSearchView({ language, environment }: PackageSearchViewProps) {
  const [results, setResults] = useState<SearchObjectOfPackageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInResources, setSearchInResources] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDto | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      setSelectedPackage(null);
      const data = await searchPackages(searchTerm, undefined, searchInResources, undefined, language, environment);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageClick = async (packageId: string) => {
    // Toggle off if clicking the same package
    if (selectedPackage?.id === packageId) {
      setSelectedPackage(null);
      return;
    }

    // Fetch full package details including resources
    setLoadingPackage(true);
    try {
      const fullPackage = await getPackageById(packageId, language, environment);
      setSelectedPackage(fullPackage);
    } catch (err) {
      console.error('Failed to load package details:', err);
      setSelectedPackage(null);
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Highlight matching words in text
  const highlightMatches = (text: string | null, searchFields: typeof results[0]['fields']) => {
    if (!text || !searchFields) return text;

    const words = searchFields.flatMap(f => f.words || []).filter(w => w.isMatch);
    if (words.length === 0) return text;

    let result = text;
    words.forEach(word => {
      if (word.content) {
        const regex = new RegExp(`(${word.content})`, 'gi');
        result = result.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
      }
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Heading level={2} data-size="lg" className="mb-4">Search Packages</Heading>
        <Paragraph className="text-gray-600 mb-4">
          Search for access packages by name, description, or content.
        </Paragraph>

        <div className="flex flex-wrap gap-4 items-end">
          <Textfield
            label="Search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter search term..."
            className="max-w-md flex-grow"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchInResources}
              onChange={(e) => setSearchInResources(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Search in resources</span>
          </label>
          <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {error && (
        <Card data-color="danger" className="p-4 mb-4">
          <Paragraph>Error: {error}</Paragraph>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Spinner aria-label="Searching..." />
        </div>
      )}

      {!loading && hasSearched && (
        <div>
          <Heading level={3} data-size="sm" className="mb-3">
            Results ({results.length})
          </Heading>

          {results.length === 0 ? (
            <Paragraph className="text-gray-500 italic">No packages found matching your search</Paragraph>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Search Results */}
              <div className="space-y-3">
                <Paragraph data-size="sm" className="text-gray-500">Click a package to view details and resources</Paragraph>
                {results.map((result, index) => (
                  <Card 
                    key={result.object?.id || index} 
                    data-color={selectedPackage?.id === result.object?.id ? 'accent' : 'neutral'} 
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => result.object?.id && handlePackageClick(result.object.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <Heading level={4} data-size="sm">
                          {highlightMatches(result.object?.name || 'Unnamed Package', result.fields)}
                        </Heading>
                        {result.object?.description && (
                          <Paragraph data-size="sm" className="text-gray-600 mt-1 line-clamp-2">
                            {highlightMatches(result.object.description, result.fields)}
                          </Paragraph>
                        )}
                      </div>
                      <Tag data-size="sm" data-color="info" className="ml-2 flex-shrink-0">
                        {result.score.toFixed(2)}
                      </Tag>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.object?.isDelegable && (
                        <Tag data-size="sm" data-color="success">Delegable</Tag>
                      )}
                      {result.object?.isAssignable && (
                        <Tag data-size="sm" data-color="info">Assignable</Tag>
                      )}
                      {result.object?.area && (
                        <Tag data-size="sm" data-color="neutral">
                          {result.object.area.name}
                        </Tag>
                      )}
                    </div>

                    {result.fields && result.fields.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {result.fields.slice(0, 3).map((field, fieldIndex) => (
                            <Tag key={fieldIndex} data-size="sm" data-color="neutral">
                              {field.field}
                            </Tag>
                          ))}
                          {result.fields.length > 3 && (
                            <Tag data-size="sm" data-color="neutral">+{result.fields.length - 3} more</Tag>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Package Details Panel */}
              <div>
                {loadingPackage ? (
                  <Card data-color="neutral" className="p-6">
                    <div className="flex items-center justify-center py-12">
                      <Spinner aria-label="Loading package details..." />
                      <span className="ml-2 text-gray-500">Loading package details...</span>
                    </div>
                  </Card>
                ) : selectedPackage ? (
                  <Card data-color="neutral" className="p-6 sticky top-6">
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
                        ?
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

                    {selectedPackage.area && (
                      <div className="mb-4 p-2 bg-gray-50 rounded">
                        <Paragraph data-size="sm" className="font-semibold">Area</Paragraph>
                        <Paragraph data-size="sm">{selectedPackage.area.name}</Paragraph>
                        {selectedPackage.area.group && (
                          <Tag data-size="sm" data-color="neutral" className="mt-1">
                            {selectedPackage.area.group.name}
                          </Tag>
                        )}
                      </div>
                    )}

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
                        Resources ({selectedPackage.resources?.length || 0})
                      </Heading>

                      {selectedPackage.resources && selectedPackage.resources.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded">
                          <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <Paragraph className="text-gray-500">No resources in this package</Paragraph>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card data-color="neutral" className="p-6 sticky top-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <Heading level={4} data-size="sm" className="text-gray-600 mb-2">
                        Package Details
                      </Heading>
                      <Paragraph className="text-gray-500">
                        Select a package from the search results to view its details and resources
                      </Paragraph>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Heading level={3} data-size="sm" className="text-gray-600 mb-2">
            Search for packages
          </Heading>
          <Paragraph className="text-gray-500">
            Enter a search term to find access packages
          </Paragraph>
        </div>
      )}
    </div>
  );
}
