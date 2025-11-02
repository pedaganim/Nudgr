import { api } from './api'

export type Customer = {
  id: number
  name: string
  email: string
}

export const customersApi = {
  async list(): Promise<Customer[]> {
    const res = await api.get('/api/customers')
    return res.data.content ?? res.data
  },
  async getById(id: number): Promise<Customer> {
    const res = await api.get(`/api/customers/${id}`)
    return res.data
  },
  async create(payload: Partial<Customer>): Promise<Customer> {
    const res = await api.post('/api/customers', payload)
    return res.data
  },
  async update(id: number, payload: Partial<Customer>): Promise<Customer> {
    const res = await api.put(`/api/customers/${id}`, payload)
    return res.data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/api/customers/${id}`)
  }
}
