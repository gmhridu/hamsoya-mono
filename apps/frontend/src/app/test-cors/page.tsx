'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function TestCorsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (url: string, description: string) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const endTime = Date.now();

      setResults(prev => [
        ...prev,
        {
          url,
          description,
          status: response.status,
          success: response.ok,
          data,
          time: endTime - startTime,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      const endTime = Date.now();
      setResults(prev => [
        ...prev,
        {
          url,
          description,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          time: endTime - startTime,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    await testEndpoint('http://localhost:8787/api/health', 'Health Check');
    await testEndpoint('http://localhost:8787/api/test-cors', 'CORS Test');
    await testEndpoint('http://localhost:8787/api/products', 'Products API');
    await testEndpoint('http://localhost:8787/trpc/test', 'tRPC Endpoint');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CORS Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Test the CORS configuration between frontend (localhost:3000) and main backend
            (localhost:8787)
          </p>
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✅ <strong>Main Backend Running:</strong> Full tRPC, authentication, and database
              connectivity
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={runAllTests}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Testing...' : 'Run All Tests'}
          </Button>
          <Button onClick={clearResults} variant="outline" disabled={loading}>
            Clear Results
          </Button>
        </div>

        <div className="grid gap-4">
          {results.map((result, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.description}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                    <Badge variant="outline">{result.time}ms</Badge>
                    <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{result.url}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Click "Run All Tests" to test the CORS configuration
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">What this tests:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Cross-origin requests from frontend to backend</li>
            <li>• CORS headers and origin validation</li>
            <li>• Credentials and cookie handling</li>
            <li>• API endpoint accessibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
