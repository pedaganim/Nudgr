import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { invoicesApi, Invoice } from '../../services/invoices'

export const InvoiceEditPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    invoicesApi.getById(Number(id)).then(setInvoice)
  }, [id])

  const updateStatus = async (status: Invoice['status']) => {
    if (!id) return
    setSaving(true)
    try {
      const updated = await invoicesApi.update(Number(id), { status })
      setInvoice(updated)
      navigate(`/invoices/${updated.id}`)
    } finally {
      setSaving(false)
    }
  }

  if (!invoice) return <div>Loading…</div>

  return (
    <div>
      <h2>Edit Invoice #{invoice.id}</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={saving} onClick={() => updateStatus('DRAFT')}>Set DRAFT</button>
        <button disabled={saving} onClick={() => updateStatus('SENT')}>Set SENT</button>
        <button disabled={saving} onClick={() => updateStatus('PAID')}>Set PAID</button>
      </div>
    </div>
  )
}
