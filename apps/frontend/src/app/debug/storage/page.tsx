/**
 * Storage Debug Page
 * Test page for cart and bookmark functionality
 */

import { StorageDebug } from '@/components/debug/storage-debug';

export default function StorageDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Storage System Debug</h1>
      <StorageDebug />
    </div>
  );
}
