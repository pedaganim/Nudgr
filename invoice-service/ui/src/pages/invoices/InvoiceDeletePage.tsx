import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { invoicesApi, Invoice } from '../../services/invoices'
import { toast } from 'sonner'

export const InvoiceDeletePage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    invoicesApi.getById(Number(id)).then(setInvoice)
  }, [id])

  const onDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await invoicesApi.remove(Number(id))
      toast.success('Invoice deleted')
      navigate('/')
    } finally {
      setDeleting(false)
    }
  }

  if (!invoice) return <div>Loading…</div>

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Delete Invoice #{invoice.id}</h2>
      <p className="mb-4">This action cannot be undone.</p>
      <div className="mb-4 space-y-1 text-sm">
        <div><span className="font-medium">Number:</span> {invoice.invoiceNumber || 'DRAFT'}</div>
        {invoice.total !== undefined && (
          <div><span className="font-medium">Total:</span> {invoice.total}</div>
        )}
        <div><span className="font-medium">Status:</span> {invoice.status}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDelete}
          disabled={deleting}
          className={`inline-flex items-center px-3 py-2 rounded ${deleting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
        >
          {deleting ? 'Deleting…' : 'Confirm Delete'}
        </button>
        <Link to={`/invoices/${invoice.id}`} className="inline-flex items-center px-3 py-2 rounded border border-gray-300 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </div>
  )
}
