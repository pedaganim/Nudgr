import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { UserProfile } from '../components/UserProfile'

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="flex h-14 w-full items-center justify-between px-4">
          <Link to="/" className="font-semibold tracking-tight">Nudgr Invoicing</Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6 text-sm">
              <Link to="/" className="hover:underline">Invoices</Link>
              <Link to="/customers" className="hover:underline">Customers</Link>
            </nav>
            <UserProfile />
          </div>
        </div>
      </header>
      <main className="w-full px-4 py-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}
