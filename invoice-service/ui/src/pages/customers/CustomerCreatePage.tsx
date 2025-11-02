import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customersApi } from '../../services/customers'

export const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await customersApi.create({ name, email })
      navigate(`/customers/${created.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2>Create Customer</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
      </form>
    </div>
  )
}
