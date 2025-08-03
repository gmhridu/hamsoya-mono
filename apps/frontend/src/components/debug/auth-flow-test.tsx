'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-auth';
import { getAuthDebugInfo, runAuthDiagnostics } from '@/lib/auth-debug';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AuthFlowTest() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: currentUserData, isLoading, error } = useCurrentUser();
  const [diagnosticsResult, setDiagnosticsResult] = useState<string>('');
  const router = useRouter();

  const handleRunDiagnostics = async () => {
    setDiagnosticsResult('Running diagnostics...');

    // Capture console output
    const originalLog = console.log;
    const originalGroup = console.group;
    const originalGroupEnd = console.groupEnd;
    const originalError = console.error;

    let output = '';

    const captureLog = (...args: any[]) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };

    const captureGroup = (label: string) => {
      output += `\n=== ${label} ===\n`;
      originalGroup(label);
    };

    const captureGroupEnd = () => {
      output += '\n';
      originalGroupEnd();
    };

    const captureError = (...args: any[]) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
      originalError(...args);
    };

    // Override console methods
    console.log = captureLog;
    console.group = captureGroup;
    console.groupEnd = captureGroupEnd;
    console.error = captureError;

    try {
      await runAuthDiagnostics();
      setDiagnosticsResult(output);
    } catch (error) {
      setDiagnosticsResult(output + '\nDiagnostics failed: ' + error);
    } finally {
      // Restore console methods
      console.log = originalLog;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
      console.error = originalError;
    }
  };

  const debugInfo = getAuthDebugInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow Test</CardTitle>
          <CardDescription>Test and debug the authentication system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Store State</h4>
              <div className="text-sm space-y-1">
                <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
                <div>User: {user ? `${user.name} (${user.email})` : 'None'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Query State</h4>
              <div className="text-sm space-y-1">
                <div>Loading: {isLoading ? '⏳' : '✅'}</div>
                <div>Error: {error ? '❌' : '✅'}</div>
                <div>Data: {currentUserData ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>

          {/* Token Info */}
          <div>
            <h4 className="font-medium mb-2">Token Status</h4>
            <div className="text-sm space-y-1">
              <div>Access Token: {debugInfo.hasAccessToken ? '✅' : '❌'}</div>
              <div>Refresh Token: {debugInfo.hasRefreshToken ? '✅' : '❌'}</div>
              <div>Total Cookies: {debugInfo.cookieCount}</div>
              {debugInfo.accessTokenPreview && (
                <div>Token Preview: {debugInfo.accessTokenPreview}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleRunDiagnostics} variant="outline">
              Run Diagnostics
            </Button>
            <Button onClick={() => router.refresh()} variant="outline">
              Refresh Page
            </Button>
          </div>

          {/* Diagnostics Output */}
          {diagnosticsResult && (
            <div>
              <h4 className="font-medium mb-2">Diagnostics Output</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                {diagnosticsResult}
              </pre>
            </div>
          )}

          {/* Cookie Details */}
          <div>
            <h4 className="font-medium mb-2">Cookie Details</h4>
            <div className="text-xs space-y-1">
              {debugInfo.allCookies.map((cookie, index) => (
                <div key={index} className="font-mono">
                  {cookie}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
