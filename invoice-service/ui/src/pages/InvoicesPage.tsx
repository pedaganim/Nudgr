import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { invoicesApi } from '../services/invoices'

type Invoice = {
  id: number
  invoiceNumber?: string
  status: string
  total: number
}

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.get('/api/invoices')
      .then(res => setInvoices(res.data.content ?? res.data))
      .finally(() => setLoading(false))
  }, [])

  const onDelete = async (id: number) => {
    if (!confirm('Delete this invoice?')) return
    setDeletingId(id)
    try {
      await invoicesApi.remove(id)
      setInvoices(prev => prev.filter(i => i.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <button
          onClick={() => navigate('/invoices/new')}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          New Invoice
        </button>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">ID</th>
                <th className="border px-3 py-2 text-left">Number</th>
                <th className="border px-3 py-2 text-left">Status</th>
                <th className="border px-3 py-2 text-left">Total</th>
                <th className="border px-3 py-2 text-left">PDF</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{inv.id}</td>
                  <td className="border px-3 py-2">
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="text-blue-600 underline underline-offset-4 hover:text-blue-800 font-medium"
                    >
                      {inv.invoiceNumber || 'DRAFT'}
                    </Link>
                  </td>
                  <td className="border px-3 py-2">{inv.status}</td>
                  <td className="border px-3 py-2">{inv.total}</td>
                  <td className="border px-3 py-2">
                    <a
                      href={`/api/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Download
                    </a>
                  </td>
                  <td className="border px-3 py-2 space-x-2">
                    <Link
                      to={`/invoices/${inv.id}/edit`}
                      className="inline-flex items-center px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/invoices/${inv.id}/delete`}
                      className="inline-flex items-center px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
