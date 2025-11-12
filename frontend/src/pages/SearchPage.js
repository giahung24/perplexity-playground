import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Spinner,
  Link,
  Divider
} from '@nextui-org/react';
import { searchService } from '../services/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trimSnippet = (text, maxWords = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchService.search(query);
      setResults(searchResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">Search</h1>
      </div>
      
      {/* Search Form */}
      <Card className="shadow-md">
        <CardBody className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Input
              type="text"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              variant="bordered"
              size="lg"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              color="primary"
              size="lg"
              className="px-6 sm:px-8 w-full sm:w-auto"
            >
              {loading ? <Spinner size="sm" color="white" /> : 'Search'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-danger-50 border-danger-200">
          <CardBody>
            <p className="text-danger-600">Error: {error}</p>
          </CardBody>
        </Card>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-foreground text-base sm:text-lg">Searching for results...</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results && !loading && (
        <Card className="shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold break-words">
              Search Results for: "<span className="text-primary">{results.query}</span>"
            </h2>
          </CardHeader>
          <CardBody className="p-4 sm:p-6 pt-0">
            {results.results && results.results.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {results.results.map((result, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardBody className="gap-3 p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-primary break-words">
                        {result.title}
                      </h3>
                      {result.url && (
                        <Link
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-secondary break-all"
                          showAnchorIcon
                        >
                          {result.url}
                        </Link>
                      )}
                      <Divider />
                      <p className="text-sm leading-relaxed text-foreground-700">
                        {trimSnippet(result.snippet)}
                      </p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 sm:py-8 text-foreground-500">No results found.</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default SearchPage;