'use client';

import { Button } from '@/components/ui/button';
import { toastService } from '@/lib/toast-service';
import { useRef, useState } from 'react';

/**
 * Toast Test Component
 * Use this component to test and debug toast functionality
 * Remove this file in production
 */
export function ToastTest() {
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);
  const toastRef = useRef<string | number | null>(null);

  const testAuthFlow = () => {
    // Test sign in flow
    const toastId = toastService.auth.signingIn();
    setLoadingToastId(toastId);
    toastRef.current = toastId;

    // Simulate success after 2 seconds
    setTimeout(() => {
      if (toastRef.current) {
        toastService.auth.loginSuccess('John Doe', toastRef.current);
        setLoadingToastId(null);
        toastRef.current = null;
      }
    }, 2000);
  };

  const testAuthError = () => {
    // Test sign in error flow
    const toastId = toastService.auth.signingIn();
    setLoadingToastId(toastId);
    toastRef.current = toastId;

    // Simulate error after 2 seconds
    setTimeout(() => {
      if (toastRef.current) {
        toastService.auth.loginError('Invalid credentials', toastRef.current);
        setLoadingToastId(null);
        toastRef.current = null;
      }
    }, 2000);
  };

  const testLogoutFlow = () => {
    // Test logout flow
    const toastId = toastService.auth.signingOut();
    setLoadingToastId(toastId);
    toastRef.current = toastId;

    // Simulate success after 1.5 seconds
    setTimeout(() => {
      if (toastRef.current) {
        toastService.auth.logoutSuccess(toastRef.current);
        setLoadingToastId(null);
        toastRef.current = null;
      }
    }, 1500);
  };

  const testCheckoutFlow = () => {
    // Test checkout flow
    const toastId = toastService.checkout.processingCheckout();
    setLoadingToastId(toastId);
    toastRef.current = toastId;

    // Simulate success after 2.5 seconds
    setTimeout(() => {
      if (toastRef.current) {
        toastService.checkout.checkoutSuccess(toastRef.current);
        setLoadingToastId(null);
        toastRef.current = null;
      }
    }, 2500);
  };

  const testCheckoutError = () => {
    // Test checkout error flow
    const toastId = toastService.checkout.processingCheckout();
    setLoadingToastId(toastId);
    toastRef.current = toastId;

    // Simulate error after 2 seconds
    setTimeout(() => {
      if (toastRef.current) {
        toastService.checkout.checkoutError('Payment processing failed', toastRef.current);
        setLoadingToastId(null);
        toastRef.current = null;
      }
    }, 2000);
  };

  const testDirectUpdate = () => {
    // Test direct update method
    const toastId = toastService.loading('Testing direct update...');
    setLoadingToastId(toastId);

    setTimeout(() => {
      toastService.update(toastId, 'Direct update successful!', 'success');
      setLoadingToastId(null);
    }, 2000);
  };

  const testReplaceMethod = () => {
    // Test replace method
    const toastId = toastService.loading('Testing replace method...');
    setLoadingToastId(toastId);

    setTimeout(() => {
      toastService.replaceWithSuccess(toastId, 'Replace method successful!');
      setLoadingToastId(null);
    }, 2000);
  };

  const dismissCurrentToast = () => {
    if (loadingToastId) {
      toastService.dismiss(loadingToastId);
      setLoadingToastId(null);
      toastRef.current = null;
    }
  };

  const dismissAllToasts = () => {
    toastService.dismissAll();
    setLoadingToastId(null);
    toastRef.current = null;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Toast Testing Component</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testAuthFlow} variant="default">
            Test Login Success
          </Button>
          
          <Button onClick={testAuthError} variant="destructive">
            Test Login Error
          </Button>
          
          <Button onClick={testLogoutFlow} variant="secondary">
            Test Logout Flow
          </Button>
          
          <Button onClick={testCheckoutFlow} variant="default">
            Test Checkout Success
          </Button>
          
          <Button onClick={testCheckoutError} variant="destructive">
            Test Checkout Error
          </Button>
          
          <Button onClick={testDirectUpdate} variant="outline">
            Test Direct Update
          </Button>
          
          <Button onClick={testReplaceMethod} variant="outline">
            Test Replace Method
          </Button>
        </div>
        
        <div className="flex gap-4 pt-4 border-t">
          <Button 
            onClick={dismissCurrentToast} 
            variant="ghost" 
            disabled={!loadingToastId}
          >
            Dismiss Current Toast
          </Button>
          
          <Button onClick={dismissAllToasts} variant="ghost">
            Dismiss All Toasts
          </Button>
        </div>
        
        {loadingToastId && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Active loading toast ID: {loadingToastId}
            </p>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Loading toast should appear immediately</li>
            <li>• After delay, loading toast should be replaced (not duplicated)</li>
            <li>• Only one toast should be visible at a time per action</li>
            <li>• Success toasts should be green, errors should be red</li>
            <li>• Toasts should auto-dismiss after 3-4 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Usage Instructions:
 * 
 * 1. Add this component to a test page temporarily
 * 2. Test each button to verify toast behavior
 * 3. Check that loading toasts are properly replaced
 * 4. Verify no duplicate toasts appear
 * 5. Remove this component before production
 * 
 * Example usage in a page:
 * 
 * ```tsx
 * import { ToastTest } from '@/components/debug/toast-test';
 * 
 * export default function TestPage() {
 *   return <ToastTest />;
 * }
 * ```
 */
