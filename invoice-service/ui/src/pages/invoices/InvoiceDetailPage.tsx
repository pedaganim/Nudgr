import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { invoicesApi, Invoice, InvoiceAttachment } from '../../services/invoices'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams()
  const { user, login } = useAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      invoicesApi.getById(Number(id)),
      invoicesApi.listAttachments(Number(id))
    ])
      .then(([inv, atts]) => { setInvoice(inv); setAttachments(atts) })
      .finally(() => setLoading(false))
  }, [id])

  const currency = invoice?.currency || 'USD'
  const fmt = (n?: number | null) =>
    typeof n === 'number' ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n) : '-'

  const items = invoice?.items ?? []
  const hasItems = items.length > 0

  const computed = useMemo(() => {
    const sub = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice)), 0)
    const tax = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice)) * (Number(it.taxRate) / 100), 0)
    const total = sub + tax
    return { sub, tax, total }
  }, [items])

  if (loading) return <div>Loading…</div>
  if (!invoice) return <div>Not found</div>

  return (
    <div className="w-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Invoice {invoice.invoiceNumber || `#${invoice.id}`}</h2>
          <div className="text-sm text-gray-600">Status: {invoice.status}</div>
        </div>
        <div className="space-x-2">
          <Link to={`/invoices/${invoice.id}/edit`} className="rounded-md border px-3 py-2 hover:bg-gray-50">Edit</Link>
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border px-3 py-2 hover:bg-gray-50"
          >
            Download PDF
          </a>
          <button
            type="button"
            className="rounded-md border px-3 py-2 hover:bg-gray-50"
            onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
          >
            Print / Preview
          </button>
          {user?.authenticated ? (
            <button
              type="button"
              className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
              disabled={sendingEmail}
              onClick={async () => {
                if (!id) return
                setSendingEmail(true)
                try {
                  await invoicesApi.sendEmail(Number(id))
                  toast.success('Invoice email sent successfully!')
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || 'Failed to send email')
                } finally {
                  setSendingEmail(false)
                }
              }}
            >
              {sendingEmail ? 'Sending...' : '📧 Send Email'}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md border border-blue-500 bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
              onClick={login}
            >
              🔒 Login to Send Email
            </button>
          )}
          <Link to="/" className="rounded-md border px-3 py-2 hover:bg-gray-50">Back</Link>
        </div>
      </div>

      {/* Header / Meta */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded border p-3">
          <div className="mb-2 text-sm font-medium">Bill To</div>
          <div className="text-sm">
            <div className="font-medium">{invoice.customer?.name ?? '—'}</div>
            <div className="text-gray-600">{invoice.customer?.email ?? ''}</div>
          </div>
        </div>
        <div className="rounded border p-3 text-sm">
          <div className="grid grid-cols-2 gap-y-1">
            <div className="text-gray-600">Issue Date</div><div>{invoice.issueDate ?? '—'}</div>
            <div className="text-gray-600">Due Date</div><div>{invoice.dueDate ?? '—'}</div>
            <div className="text-gray-600">Currency</div><div>{invoice.currency ?? 'USD'}</div>
            <div className="text-gray-600">Terms</div><div>{invoice.terms || '—'}</div>
            <div className="text-gray-600">Tags</div><div>{invoice.tags || '—'}</div>
          </div>
        </div>
      </div>

      {invoice.billingAddress && (
        <div className="mb-6 rounded border p-3 text-sm">
          <div className="mb-1 font-medium">Billing Address</div>
          <pre className="whitespace-pre-wrap">{invoice.billingAddress}</pre>
        </div>
      )}

      {/* Items */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Description</th>
              <th className="border px-3 py-2 text-right">Qty</th>
              <th className="border px-3 py-2 text-right">Unit Price</th>
              <th className="border px-3 py-2 text-right">Tax %</th>
              <th className="border px-3 py-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {hasItems ? (
              items.map((it, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{it.description}</td>
                  <td className="border px-3 py-2 text-right">{Number(it.quantity)}</td>
                  <td className="border px-3 py-2 text-right">{fmt(Number(it.unitPrice))}</td>
                  <td className="border px-3 py-2 text-right">{Number(it.taxRate).toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{fmt(it.lineTotal ?? (Number(it.quantity) * Number(it.unitPrice) * (1 + Number(it.taxRate)/100)))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-3 py-4 text-center text-gray-500" colSpan={5}>No items</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-6 flex justify-end">
        <div className="w-full max-w-sm space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{fmt(invoice.subTotal ?? computed.sub)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{fmt(invoice.taxTotal ?? computed.tax)}</span></div>
          <div className="flex justify-between font-medium"><span>Total</span><span>{fmt(invoice.total ?? computed.total)}</span></div>
          {typeof invoice.balanceDue === 'number' && (
            <div className="flex justify-between"><span>Balance Due</span><span>{fmt(invoice.balanceDue)}</span></div>
          )}
        </div>
      </div>

      {/* Messages */}
      {(invoice.messageOnInvoice || invoice.messageOnStatement) && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {invoice.messageOnInvoice && (
            <div className="rounded border p-3">
              <div className="mb-1 text-sm font-medium">Message on invoice</div>
              <pre className="whitespace-pre-wrap text-sm">{invoice.messageOnInvoice}</pre>
            </div>
          )}
          {invoice.messageOnStatement && (
            <div className="rounded border p-3">
              <div className="mb-1 text-sm font-medium">Message on statement</div>
              <pre className="whitespace-pre-wrap text-sm">{invoice.messageOnStatement}</pre>
            </div>
          )}
        </div>
      )}

      {/* Attachments */}
      <div className="rounded border p-3">
        <div className="mb-2 text-sm font-medium">Attachments</div>
        <ul className="space-y-2 text-sm">
          {attachments.map(att => (
            <li key={att.id} className="flex items-center justify-between rounded border px-3 py-2">
              <div className="flex items-center gap-2">
                <span>📎</span>
                <a className="text-blue-600 hover:underline" href={`/api/attachments/${att.id}`}>{att.filename}</a>
                <span className="text-xs text-gray-500">{Math.max(1, Math.round(att.size / 1024))} KB</span>
              </div>
              <a
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                href={`/api/attachments/${att.id}`}
              >
                Download
              </a>
            </li>
          ))}
          {attachments.length === 0 && <li className="rounded border px-3 py-2 text-gray-600">No attachments</li>}
        </ul>
      </div>
    </div>
  )
}
