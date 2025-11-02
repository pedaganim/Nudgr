import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { invoicesApi, Invoice, InvoiceAttachment } from '../../services/invoices'
import { customersApi, Customer } from '../../services/customers'

type EditItem = {
  serviceDate?: string
  productOrService?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export const InvoiceEditPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState<number | ''>('')

  const [issueDate, setIssueDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [billingAddress, setBillingAddress] = useState<string>('')
  const [terms, setTerms] = useState<string>('')
  const [tags, setTags] = useState<string>('')
  const [messageOnInvoice, setMessageOnInvoice] = useState<string>('')
  const [messageOnStatement, setMessageOnStatement] = useState<string>('')
  const [items, setItems] = useState<EditItem[]>([])
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [inv, custs] = await Promise.all([
          invoicesApi.getById(Number(id)),
          customersApi.list()
        ])
        setCustomers(custs)
        setCustomerId(inv.customer?.id ?? '')
        setIssueDate(inv.issueDate ?? '')
        setDueDate(inv.dueDate ?? '')
        setCurrency(inv.currency ?? 'USD')
        setBillingAddress(inv.billingAddress ?? '')
        setTerms((inv.terms as any) ?? '')
        setTags(inv.tags ?? '')
        setMessageOnInvoice(inv.messageOnInvoice ?? '')
        setMessageOnStatement(inv.messageOnStatement ?? '')
        setItems((inv.items ?? []).map(it => ({
          serviceDate: it.serviceDate ?? '',
          productOrService: it.productOrService ?? '',
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          taxRate: Number(it.taxRate)
        })))
        const atts = await invoicesApi.listAttachments(Number(id))
        setAttachments(atts)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const subTotal = useMemo(() => items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0), [items])
  const taxTotal = useMemo(() => items.reduce((sum, it) => sum + (it.quantity * it.unitPrice) * (it.taxRate / 100), 0), [items])
  const total = useMemo(() => Number((subTotal + taxTotal).toFixed(2)), [subTotal, taxTotal])

  const lineTotal = (q: number, p: number, tax: number) => {
    const base = q * p
    const taxAmt = base * (tax / 100)
    return Math.max(0, Number((base + taxAmt).toFixed(2)))
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    if (!customerId) return
    setSaving(true)
    try {
      const payload: Partial<Invoice> = {
        customer: { id: Number(customerId) },
        issueDate,
        dueDate,
        currency,
        billingAddress: billingAddress?.trim() || undefined,
        terms: terms ? (terms as any) : undefined,
        tags: tags?.trim() || undefined,
        messageOnInvoice: messageOnInvoice?.trim() || undefined,
        messageOnStatement: messageOnStatement?.trim() || undefined,
        items: items
          .filter(it => it.description && it.quantity > 0)
          .map(it => ({
            serviceDate: it.serviceDate || null,
            productOrService: it.productOrService || '',
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            taxRate: it.taxRate,
            lineTotal: lineTotal(it.quantity, it.unitPrice, it.taxRate)
          })),
        subTotal: Number(subTotal.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        discountTotal: 0,
        total,
      }
      const updated = await invoicesApi.update(Number(id), payload)
      navigate(`/invoices/${updated.id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading…</div>

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold">Edit Invoice #{id}</h2>
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Customer</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={customerId}
            onChange={e => setCustomerId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Select a customer…</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Attachments</h3>
          <div className="flex items-center gap-3">
            <input id="fileUpload" className="hidden" type="file" onChange={async e => {
              if (!id || !e.target.files || e.target.files.length === 0) return
              const file = e.target.files[0]
              setUploading(true)
              try {
                const att = await invoicesApi.uploadAttachment(Number(id), file)
                setAttachments(prev => [att, ...prev])
                ;(e.target as HTMLInputElement).value = ''
              } finally {
                setUploading(false)
              }
            }} />
            <label htmlFor="fileUpload" className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
              <span>📎</span>
              <span>Upload attachment</span>
            </label>
            <span className="text-xs text-gray-500">Max 10MB</span>
            {uploading && <span className="text-sm text-gray-600">Uploading…</span>}
          </div>
          <ul className="space-y-2 text-sm">
            {attachments.map(att => (
              <li key={att.id} className="flex items-center justify-between rounded border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span>📎</span>
                  <a className="text-blue-600 hover:underline" href={`/api/attachments/${att.id}`}>{att.filename}</a>
                  <span className="text-xs text-gray-500">{Math.max(1, Math.round(att.size / 1024))} KB</span>
                </div>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={async () => {
                    await invoicesApi.deleteAttachment(att.id)
                    setAttachments(prev => prev.filter(a => a.id !== att.id))
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
            {attachments.length === 0 && <li className="rounded border px-3 py-2 text-gray-600">No attachments</li>}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Issue Date</label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Due Date</label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Currency</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Billing Address</label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              value={billingAddress}
              onChange={e => setBillingAddress(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Terms</label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={terms}
              onChange={e => setTerms(e.target.value)}
            >
              <option value="">—</option>
              <option value="DUE_ON_RECEIPT">Due on Receipt</option>
              <option value="NET_15">Net 15</option>
              <option value="NET_30">Net 30</option>
              <option value="NET_60">Net 60</option>
            </select>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium">Tags (comma separated)</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. urgent, consulting"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Message on invoice</label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              value={messageOnInvoice}
              onChange={e => setMessageOnInvoice(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message on statement</label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              value={messageOnStatement}
              onChange={e => setMessageOnStatement(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Items</h3>
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => setItems(prev => [...prev, { serviceDate: '', productOrService: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 }])}
            >
              Add item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-2 text-left">Service Date</th>
                  <th className="border px-2 py-2 text-left">Product / Service</th>
                  <th className="border px-2 py-2 text-left">Description</th>
                  <th className="border px-2 py-2 text-right">QTY</th>
                  <th className="border px-2 py-2 text-right">Rate</th>
                  <th className="border px-2 py-2 text-right">GST %</th>
                  <th className="border px-2 py-2 text-right">Amount</th>
                  <th className="border px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 py-2">
                      <input
                        type="date"
                        className="w-full rounded-md border px-2 py-1"
                        value={it.serviceDate || ''}
                        onChange={e => {
                          const v = e.target.value
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, serviceDate: v } : p))
                        }}
                      />
                    </td>
                    <td className="border px-2 py-2">
                      <input
                        className="w-full rounded-md border px-2 py-1"
                        value={it.productOrService || ''}
                        onChange={e => {
                          const v = e.target.value
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, productOrService: v } : p))
                        }}
                        placeholder="Product or service"
                      />
                    </td>
                    <td className="border px-2 py-2">
                      <input
                        className="w-full rounded-md border px-2 py-1"
                        value={it.description}
                        onChange={e => {
                          const v = e.target.value
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, description: v } : p))
                        }}
                        placeholder="Service description"
                      />
                    </td>
                    <td className="border px-2 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="w-24 rounded-md border px-2 py-1 text-right"
                        value={it.quantity}
                        onChange={e => {
                          const v = Number(e.target.value)
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, quantity: v } : p))
                        }}
                      />
                    </td>
                    <td className="border px-2 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="w-28 rounded-md border px-2 py-1 text-right"
                        value={it.unitPrice}
                        onChange={e => {
                          const v = Number(e.target.value)
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, unitPrice: v } : p))
                        }}
                      />
                    </td>
                    <td className="border px-2 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="w-24 rounded-md border px-2 py-1 text-right"
                        value={it.taxRate}
                        onChange={e => {
                          const v = Number(e.target.value)
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, taxRate: v } : p))
                        }}
                      />
                    </td>
                    <td className="border px-2 py-2 text-right">
                      {lineTotal(it.quantity, it.unitPrice, it.taxRate).toFixed(2)}
                    </td>
                    <td className="border px-2 py-2 text-center">
                      <button
                        type="button"
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="border px-2 py-4 text-center text-gray-500" colSpan={6}>No items. Click "Add item".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{taxTotal.toFixed(2)}</span></div>
              <div className="flex justify-between font-medium"><span>Total</span><span>{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-gray-50"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
