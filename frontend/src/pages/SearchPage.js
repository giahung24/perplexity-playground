import React, { useState } from 'react';
import styled from 'styled-components';
import { searchService } from '../services/api';

const PageContainer = styled.div`
  color: white;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const SearchContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  outline: none;
  
  &:focus {
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #45a049;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ResultItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ResultTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #FFD700;
`;

const ResultURL = styled.a`
  color: #87CEEB;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ResultSnippet = styled.p`
  margin: 0.5rem 0 0 0;
  line-height: 1.6;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <PageContainer>
      <Title>Search</Title>
      
      <SearchContainer>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            disabled={loading}
          />
          <SearchButton type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </SearchButton>
        </SearchForm>
      </SearchContainer>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {loading && (
        <LoadingSpinner>
          Searching for results...
        </LoadingSpinner>
      )}

      {results && !loading && (
        <ResultsContainer>
          <h3>Search Results for: "{results.query}"</h3>
          {results.results && results.results.length > 0 ? (
            results.results.map((result, index) => (
              <ResultItem key={index}>
                <ResultTitle>{result.title}</ResultTitle>
                {result.url && (
                  <ResultURL href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.url}
                  </ResultURL>
                )}
                <ResultSnippet>{result.snippet}</ResultSnippet>
              </ResultItem>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </ResultsContainer>
      )}
    </PageContainer>
  );
}

export default SearchPage;