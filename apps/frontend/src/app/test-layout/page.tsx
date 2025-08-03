/**
 * Test page to verify layout behavior
 */

export default function TestLayoutPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Layout Page</h1>
      <p className="mb-4">This page should show with Navbar and Footer.</p>
      <div className="space-y-2">
        <p>✅ Navbar should be visible above</p>
        <p>✅ Footer should be visible below</p>
        <p>✅ This is a regular page layout</p>
      </div>
    </div>
  );
}
