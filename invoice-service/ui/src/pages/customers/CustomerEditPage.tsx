import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { customersApi, Customer } from '../../services/customers'

export const CustomerEditPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    customersApi.getById(Number(id)).then(c => {
      setCustomer(c)
      setName(c.name)
      setEmail(c.email)
    })
  }, [id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      const updated = await customersApi.update(Number(id), { name, email })
      navigate(`/customers/${updated.id}`)
    } finally {
      setSaving(false)
    }
  }

  if (!customer) return <div>Loading…</div>

  return (
    <div>
      <h2>Edit Customer #{customer.id}</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  )
}
