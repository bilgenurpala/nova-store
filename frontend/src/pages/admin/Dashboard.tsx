export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h2>

      {/* Stat cards — will be wired to API on Day 10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: '—', color: 'blue' },
          { label: 'Total Categories', value: '—', color: 'green' },
          { label: 'Total Orders', value: '—', color: 'purple' },
          { label: 'Total Users', value: '—', color: 'orange' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h3>
        <p className="text-sm text-gray-400">Order table will be added on Day 10.</p>
      </div>
    </div>
  )
}
