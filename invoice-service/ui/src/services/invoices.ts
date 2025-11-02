import { api } from './api'

export type Invoice = {
  id: number
  invoiceNumber?: string | null
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | string
  issueDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  billingAddress?: string
  terms?: 'DUE_ON_RECEIPT' | 'NET_15' | 'NET_30' | 'NET_60' | ''
  tags?: string
  messageOnInvoice?: string
  messageOnStatement?: string
  customer?: { id: number; name?: string; email?: string }
  items?: Array<{
    id?: number
    serviceDate?: string | null
    productOrService?: string | null
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
    lineTotal?: number
  }>
  subTotal?: number
  taxTotal?: number
  discountTotal?: number
  total?: number
  balanceDue?: number
}

export type InvoiceAttachment = {
  id: number
  filename: string
  contentType?: string
  size: number
}

export const invoicesApi = {
  async list(): Promise<Invoice[]> {
    const res = await api.get('/api/invoices')
    return res.data.content ?? res.data
  },
  async getById(id: number): Promise<Invoice> {
    const res = await api.get(`/api/invoices/${id}`)
    return res.data
  },
  async create(payload: Partial<Invoice> = {}): Promise<Invoice> {
    const res = await api.post('/api/invoices', { status: 'DRAFT', ...payload })
    return res.data
  },
  async update(id: number, payload: Partial<Invoice>): Promise<Invoice> {
    const res = await api.put(`/api/invoices/${id}` , payload)
    return res.data
  },
  async finalize(id: number): Promise<Invoice> {
    const res = await api.post(`/api/invoices/${id}/finalize`)
    return res.data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/invoices/${id}`)
  },
  async listAttachments(invoiceId: number): Promise<InvoiceAttachment[]> {
    const res = await api.get(`/api/invoices/${invoiceId}/attachments`)
    return res.data
  },
  async uploadAttachment(invoiceId: number, file: File): Promise<InvoiceAttachment> {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post(`/api/invoices/${invoiceId}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  },
  async deleteAttachment(attachmentId: number): Promise<void> {
    await api.delete(`/api/attachments/${attachmentId}`)
  }
}
