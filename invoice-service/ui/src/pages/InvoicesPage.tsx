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
      <h2>Invoices</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate('/invoices/new')}>New Invoice</button>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Status</th>
              <th>Total</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td><Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber || 'DRAFT'}</Link></td>
                <td>{inv.status}</td>
                <td>{inv.total}</td>
                <td>
                  <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noreferrer">Download</a>
                </td>
                <td>
                  <Link to={`/invoices/${inv.id}/edit`}>Edit</Link>
                  {' | '}
                  <button onClick={() => onDelete(inv.id)} disabled={deletingId === inv.id}>
                    {deletingId === inv.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
