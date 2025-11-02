import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <Link to="/" className="font-semibold tracking-tight">Nudgr Invoicing</Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/" className="hover:underline">Invoices</Link>
            <Link to="/customers" className="hover:underline">Customers</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
