import { useState } from 'react';
import { Card, Heading, Paragraph, Spinner, Tag, Textfield, Button } from '@digdir/designsystemet-react';
import type { SearchObjectOfPackageDto } from '../types/metadata';
import { searchPackages } from '../services/metadataApi';

export function PackageSearchView() {
  const [results, setResults] = useState<SearchObjectOfPackageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInResources, setSearchInResources] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await searchPackages(searchTerm, undefined, searchInResources);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
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
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={result.object?.id || index} data-color="neutral" className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <Heading level={4} data-size="sm">
                        {highlightMatches(result.object?.name || 'Unnamed Package', result.fields)}
                      </Heading>
                      {result.object?.description && (
                        <Paragraph data-size="sm" className="text-gray-600 mt-1">
                          {highlightMatches(result.object.description, result.fields)}
                        </Paragraph>
                      )}
                    </div>
                    <Tag data-size="sm" data-color="info" className="ml-2">
                      Score: {result.score.toFixed(2)}
                    </Tag>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.object?.isDelegable && (
                      <Tag data-size="sm" data-color="success">Delegable</Tag>
                    )}
                    {result.object?.isAssignable && (
                      <Tag data-size="sm" data-color="info">Assignable</Tag>
                    )}
                    {result.object?.area && (
                      <Tag data-size="sm" data-color="neutral">
                        Area: {result.object.area.name}
                      </Tag>
                    )}
                    {result.object?.resources && result.object.resources.length > 0 && (
                      <Tag data-size="sm" data-color="neutral">
                        {result.object.resources.length} resources
                      </Tag>
                    )}
                  </div>

                  {result.object?.urn && (
                    <code className="text-xs text-gray-500 block mt-2 break-all">
                      {result.object.urn}
                    </code>
                  )}

                  {result.fields && result.fields.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Paragraph data-size="xs" className="text-gray-500 font-semibold mb-1">
                        Matched fields:
                      </Paragraph>
                      <div className="flex flex-wrap gap-1">
                        {result.fields.map((field, fieldIndex) => (
                          <Tag key={fieldIndex} data-size="sm" data-color="neutral">
                            {field.field}: {field.score.toFixed(2)}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
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
