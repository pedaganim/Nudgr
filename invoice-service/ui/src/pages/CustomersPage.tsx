import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

type Customer = {
  id: number
  name: string
  email: string
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/api/customers')
      .then(res => setCustomers(res.data.content ?? res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Link to="/customers/new" className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
          New Customer
        </Link>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">ID</th>
                <th className="border px-3 py-2 text-left">Name</th>
                <th className="border px-3 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{c.id}</td>
                  <td className="border px-3 py-2">{c.name}</td>
                  <td className="border px-3 py-2">{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
