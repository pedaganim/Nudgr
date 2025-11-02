import { api } from './api'

export type Invoice = {
  id: number
  invoiceNumber?: string
  status: string
  total?: number
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
  async remove(id: number): Promise<void> {
    await api.delete(`/api/invoices/${id}`)
  }
}
