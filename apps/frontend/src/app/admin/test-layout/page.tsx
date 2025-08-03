/**
 * Test admin page to verify admin layout behavior
 */

export default function TestAdminLayoutPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Test Admin Layout Page</h1>
      <p className="mb-4">This page should show WITHOUT Navbar and Footer.</p>
      <div className="space-y-2">
        <p>❌ Navbar should NOT be visible</p>
        <p>❌ Footer should NOT be visible</p>
        <p>✅ This is a full-screen admin layout</p>
        <p>✅ Should take full height of screen</p>
      </div>
    </div>
  );
}
