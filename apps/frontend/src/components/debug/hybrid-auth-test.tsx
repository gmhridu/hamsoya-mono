'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';

export function HybridAuthTest() {
  const { isAuthenticated, user } = useAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const getAccessTokenFromCookie = (): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; accessToken=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }

    return null;
  };

  const testCookieAccess = () => {
    const accessToken = getAccessTokenFromCookie();
    if (accessToken) {
      addResult(`✅ Access token found in cookie: ${accessToken.substring(0, 20)}...`);
      addResult(`✅ Access token is JavaScript-accessible (non-httpOnly)`);
    } else {
      addResult(`❌ Access token not found in cookie`);
    }

    // Try to access refresh token (should fail)
    const refreshTokenAttempt = document.cookie.includes('refreshToken');
    if (refreshTokenAttempt) {
      addResult(`❌ Refresh token visible in document.cookie (security issue!)`);
    } else {
      addResult(`✅ Refresh token is httpOnly (not accessible via JavaScript)`);
    }
  };

  const testApiCallWithToken = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getCurrentUser();
      addResult(`✅ API call with Authorization header successful: ${(result as any).data?.name || 'User data received'}`);
    } catch (error: any) {
      addResult(`❌ API call failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        addResult(`✅ Token refresh successful`);

        // Check if new access token is available
        setTimeout(() => {
          const newToken = getAccessTokenFromCookie();
          if (newToken) {
            addResult(`✅ New access token available: ${newToken.substring(0, 20)}...`);
          }
        }, 100);
      } else {
        addResult(`❌ Token refresh failed: ${response.status}`);
      }
    } catch (error: any) {
      addResult(`❌ Token refresh error: ${error.message}`);
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
          <CardTitle>Hybrid Auth Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please log in to test hybrid authentication functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Hybrid Authentication System Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Logged in as: {user?.name} ({user?.email})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testCookieAccess} disabled={isLoading}>
            Test Cookie Access
          </Button>
          <Button onClick={testApiCallWithToken} disabled={isLoading} variant="outline">
            Test API Call
          </Button>
          <Button onClick={testTokenRefresh} disabled={isLoading} variant="outline">
            Test Token Refresh
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

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Hybrid Authentication System:</strong></p>
          <p>• Access Token: JavaScript-accessible cookie (5-minute expiry)</p>
          <p>• Refresh Token: httpOnly cookie (30-day expiry)</p>
          <p>• API calls use Authorization: Bearer header</p>
          <p>• Automatic token refresh on 401 responses</p>
          <p>• Database validation for refresh tokens</p>
        </div>
      </CardContent>
    </Card>
  );
}
