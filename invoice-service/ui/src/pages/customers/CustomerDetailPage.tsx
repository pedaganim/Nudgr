import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { customersApi, Customer } from '../../services/customers'

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    customersApi.getById(Number(id))
      .then(setCustomer)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading…</div>
  if (!customer) return <div>Not found</div>

  return (
    <div>
      <h2>Customer #{customer.id}</h2>
      <div>Name: {customer.name}</div>
      <div>Email: {customer.email}</div>
      <div style={{ marginTop: 12 }}>
        <Link to={`/customers/${customer.id}/edit`}>Edit</Link>
        {' | '}
        <Link to="/customers">Back to list</Link>
      </div>
    </div>
  )
}
