import React from "react";
import Link from "next/link";
import { handleLogoutAction } from "@/app/login/action"; // Import the secure session log-out method

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FAF9F6] antialiased selection:bg-[#7A8F66]/10">
      {/* Sidebar Navigation */}
      <aside className="w-66 bg-white border-r border-[#F5F1EA] fixed h-full flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-[#F5F1EA] bg-[#FFFDF8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7A8F66] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">F</div>
            <div>
              <h1 className="text-[#2D2D2D] font-black text-lg tracking-tight leading-none">FACULTY PRO</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Enterprise Suite</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2 block">Core Workspace</div>
          <SidebarLink href="/admin/dashboard" label="System Overview" icon="📊" />
          <SidebarLink href="/admin/employees" label="Faculty Directory" icon="👥" />
          <SidebarLink href="/admin/attendance" label="Live Attendance" icon="📍" status="Live" />
          
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-4 mb-2 block">HR Operations</div>
          <SidebarLink href="/admin/leaves" label="Leave Requests" icon="✉️" badge="3" />
          <SidebarLink href="/admin/resignations" label="Resignation Desk" icon="📄" badge="1" />
          <SidebarLink href="/admin/inquiry" label="Inquiry & Reply" icon="💬" badge="New" />
          <SidebarLink href="/admin/complaints" label="Grievances" icon="⚠️" />
        </nav>

        {/* SIGN OUT ROUTER FOOTER ELEMENT */}
        <div className="p-4 border-t border-[#F5F1EA] bg-[#FFFDF8]">
          <form action={handleLogoutAction}>
            <button 
              type="submit" 
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50/60 transition-all duration-200 group"
            >
              <span>Sign Out Session</span>
              <span className="text-xs group-hover:translate-x-1 transition-transform duration-150">🚪</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Framework Viewport */}
      <main className="flex-1 ml-66 min-h-screen flex flex-col">
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-[#F5F1EA] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
            <span>CAMPUS STATUS:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Operational Sync Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-black text-[#2D2D2D]">System Admin</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Super Administrator</p>
            </div>
            <div className="w-9 h-9 bg-[#C9A86A] rounded-xl flex items-center justify-center text-white font-bold shadow-sm text-sm border border-white">
              A
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label, icon, badge, status }: { href: string; label: string; icon: string; badge?: string; status?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-[#F5F1EA] transition-all duration-150 group">
      <div className="flex items-center gap-3">
        <span className="text-base group-hover:scale-105 transition-transform">{icon}</span>
        <span className="group-hover:text-[#7A8F66] transition-colors">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${badge === 'New' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-[#7A8F66]/10 text-[#7A8F66]'}`}>{badge}</span>
      )}
      {status && (
        <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider bg-red-100 text-red-600 font-black rounded animate-pulse">{status}</span>
      )}
    </Link>
  );
}