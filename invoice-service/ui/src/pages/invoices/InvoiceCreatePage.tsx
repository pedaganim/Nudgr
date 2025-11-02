import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoicesApi } from '../../services/invoices'
import { customersApi, Customer } from '../../services/customers'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const InvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [customerMode, setCustomerMode] = useState<'select' | 'create'>('select')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [issueDate, setIssueDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [messageOnInvoice, setMessageOnInvoice] = useState<string>('')
  const [messageOnStatement, setMessageOnStatement] = useState<string>('')
  const [billingAddress, setBillingAddress] = useState<string>('')
  const [terms, setTerms] = useState<string>('')
  const [tags, setTags] = useState<string>('') // comma-separated
  const [items, setItems] = useState<Array<{
    serviceDate?: string
    productOrService?: string
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
  }>>([
    { serviceDate: '', productOrService: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
  ])

  const lineTotal = (q: number, p: number, tax: number) => {
    const base = q * p
    const taxAmt = base * (tax / 100)
    return Math.max(0, Number((base + taxAmt).toFixed(2)))
  }

  const subTotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
  const taxTotal = items.reduce((sum, it) => sum + (it.quantity * it.unitPrice) * (it.taxRate / 100), 0)
  const discountTotal = 0
  const total = Number((subTotal + taxTotal - discountTotal).toFixed(2))

  useEffect(() => {
    customersApi.list().then(setCustomers)
    const today = new Date()
    const twoWeeks = new Date()
    twoWeeks.setDate(today.getDate() + 14)
    setIssueDate(today.toISOString().slice(0, 10))
    setDueDate(twoWeeks.toISOString().slice(0, 10))
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    let finalCustomerId = customerId
    if (customerMode === 'select') {
      if (!finalCustomerId) {
        toast.error('Please select a customer')
        return
      }
    } else {
      if (!newCustomerName || !newCustomerEmail) {
        toast.error('Please provide name and email for the new customer')
        return
      }
    }
    setSaving(true)
    try {
      if (customerMode === 'create') {
        const createdCustomer = await customersApi.create({ name: newCustomerName, email: newCustomerEmail })
        finalCustomerId = createdCustomer.id
        // add to local list and switch mode for UX continuity
        setCustomers(prev => [{ id: createdCustomer.id, name: createdCustomer.name, email: createdCustomer.email }, ...prev])
        setCustomerId(createdCustomer.id)
      }
      const payload = {
        customer: { id: Number(finalCustomerId) },
        issueDate,
        dueDate,
        currency,
        billingAddress: billingAddress?.trim() || undefined,
        terms: terms ? (terms as any) : undefined,
        tags: tags?.trim() || undefined,
        messageOnInvoice: messageOnInvoice?.trim() || undefined,
        messageOnStatement: messageOnStatement?.trim() || undefined,
        status: 'DRAFT',
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
        discountTotal,
        total,
        balanceDue: total
      }
      const created = await invoicesApi.create(payload)
      navigate(`/invoices/${created.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold">Create Invoice</h2>
      <form onSubmit={onCreate} className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex rounded-md border p-1 text-sm">
            <button
              type="button"
              className={`rounded px-3 py-1 ${customerMode === 'select' ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setCustomerMode('select')}
            >
              Existing customer
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1 ${customerMode === 'create' ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setCustomerMode('create')}
            >
              New customer
            </button>
          </div>

          {customerMode === 'select' ? (
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
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Customer name</label>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Customer email</label>
                <input
                  type="email"
                  className="w-full rounded-md border px-3 py-2"
                  value={newCustomerEmail}
                  onChange={e => setNewCustomerEmail(e.target.value)}
                  placeholder="billing@acme.com"
                />
              </div>
            </div>
          )}
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
          {/* Mobile (stacked) */}
          <div className="space-y-4 lg:hidden">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-md border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Service Date</label>
                    <input type="date" className="w-full rounded-md border px-2 py-1" value={it.serviceDate}
                      onChange={e => {
                        const v = e.target.value
                        setItems(prev => prev.map((p, i) => i === idx ? { ...p, serviceDate: v } : p))
                      }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Product / Service</label>
                    <input className="w-full rounded-md border px-2 py-1" value={it.productOrService}
                      onChange={e => {
                        const v = e.target.value
                        setItems(prev => prev.map((p, i) => i === idx ? { ...p, productOrService: v } : p))
                      }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-gray-600">Description</label>
                    <input className="w-full rounded-md border px-2 py-1" value={it.description}
                      onChange={e => {
                        const v = e.target.value
                        setItems(prev => prev.map((p, i) => i === idx ? { ...p, description: v } : p))
                      }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">QTY</label>
                    <input type="number" className="w-full rounded-md border px-2 py-1 text-right" value={it.quantity}
                      onChange={e => {
                        const v = Number(e.target.value)
                        setItems(prev => prev.map((p, i) => i === idx ? { ...p, quantity: v } : p))
                      }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Rate</label>
                    <input type="number" className="w-full rounded-md border px-2 py-1 text-right" value={it.unitPrice}
                      onChange={e => {
                        const v = Number(e.target.value)
                        setItems(prev => prev.map((p, i) => i === idx ? { ...p, unitPrice: v } : p))
                      }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">GST %</label>
                    <input type="number" className="w-full rounded-md border px-2 py-1 text-right" value={it.taxRate}
                      onChange={e => {
                        const v = Number(e.target.value)
                        setItems(prev => prev.map((p, i) => i === idx ? { ...p, taxRate: v } : p))
                      }} />
                  </div>
                  <div className="flex items-end justify-between sm:col-span-2">
                    <div className="text-sm text-gray-700">Amount</div>
                    <div className="font-medium">{lineTotal(it.quantity, it.unitPrice, it.taxRate).toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                    onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop (table) */}
          <div className="hidden overflow-x-auto lg:block">
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
                        value={it.serviceDate}
                        onChange={e => {
                          const v = e.target.value
                          setItems(prev => prev.map((p, i) => i === idx ? { ...p, serviceDate: v } : p))
                        }}
                      />
                    </td>
                    <td className="border px-2 py-2">
                      <input
                        className="w-full rounded-md border px-2 py-1"
                        value={it.productOrService}
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

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
