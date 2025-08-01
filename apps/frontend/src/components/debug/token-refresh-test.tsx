'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { tokenRefreshService } from '@/lib/token-refresh-service';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';

export function TokenRefreshTest() {
  const { isAuthenticated, user } = useAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiCall = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getCurrentUser();
      addResult(`✅ API call successful: ${result.data?.name || 'User data received'}`);
    } catch (error: any) {
      addResult(`❌ API call failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testManualRefresh = async () => {
    setIsLoading(true);
    try {
      const success = await tokenRefreshService.refreshNow();
      addResult(success ? '✅ Manual token refresh successful' : '❌ Manual token refresh failed');
    } catch (error: any) {
      addResult(`❌ Manual token refresh error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Token Refresh Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please log in to test token refresh functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Token Refresh Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Logged in as: {user?.name} ({user?.email})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testApiCall} disabled={isLoading}>
            Test API Call
          </Button>
          <Button onClick={testManualRefresh} disabled={isLoading} variant="outline">
            Manual Refresh
          </Button>
          <Button onClick={clearResults} variant="ghost">
            Clear Results
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Test Results:</h4>
          <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-sm">No test results yet.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Access tokens expire every 5 minutes</p>
          <p>• Automatic refresh happens 1 minute before expiry</p>
          <p>• All API calls automatically retry with fresh tokens</p>
        </div>
      </CardContent>
    </Card>
  );
}
