import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { invoicesApi, Invoice } from '../../services/invoices'

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    invoicesApi.getById(Number(id))
      .then(setInvoice)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading…</div>
  if (!invoice) return <div>Not found</div>

  return (
    <div>
      <h2>Invoice #{invoice.id}</h2>
      <div>Number: {invoice.invoiceNumber || 'DRAFT'}</div>
      <div>Status: {invoice.status}</div>
      <div>Total: {invoice.total}</div>
      <div style={{ marginTop: 12 }}>
        <Link to={`/invoices/${invoice.id}/edit`}>Edit</Link>
        {' | '}
        <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
        {' | '}
        <Link to="/">Back to list</Link>
      </div>
    </div>
  )
}
