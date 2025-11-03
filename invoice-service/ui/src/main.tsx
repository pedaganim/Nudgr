import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { InvoicesPage } from './pages/InvoicesPage'
import { CustomersPage } from './pages/CustomersPage'
import { InvoiceDetailPage } from './pages/invoices/InvoiceDetailPage'
import { InvoiceCreatePage } from './pages/invoices/InvoiceCreatePage'
import { InvoiceEditPage } from './pages/invoices/InvoiceEditPage'
import { InvoiceDeletePage } from './pages/invoices/InvoiceDeletePage'
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage'
import { CustomerCreatePage } from './pages/customers/CustomerCreatePage'
import { CustomerEditPage } from './pages/customers/CustomerEditPage'
import { Layout } from './ui/Layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <InvoicesPage /> },
      { path: 'invoices/new', element: <InvoiceCreatePage /> },
      { path: 'invoices/:id', element: <InvoiceDetailPage /> },
      { path: 'invoices/:id/edit', element: <InvoiceEditPage /> },
      { path: 'invoices/:id/delete', element: <InvoiceDeletePage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/new', element: <CustomerCreatePage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'customers/:id/edit', element: <CustomerEditPage /> }
    ]
  }
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right"/>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
