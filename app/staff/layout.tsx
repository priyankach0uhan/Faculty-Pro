"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-white border-r border-[#F5F1EA] fixed top-0 bottom-0 left-0 flex flex-col z-30">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7A8F66] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#7A8F66]/20">
              F
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-[#2D2D2D]">FACULTY PORTAL</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Enterprise Suite</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] px-4 mb-4">Workspace</div>
          
          <SidebarNavItem 
            href="/staff/dashboard" 
            label="My Dashboard" 
            icon="📊" 
            active={isActive("/staff/dashboard")} 
          />
          
          <SidebarNavItem 
            href="/staff/resignation" 
            label="Resignation Desk" 
            icon="📄" 
            active={isActive("/staff/resignation")} 
          />
          <SidebarNavItem
           href="/staff/inquiry" label="Messages & Reply" icon="💬" active={isActive("/staff/inquiry")} 
        />
           </nav>

        <div className="p-6 border-t border-[#F5F1EA]">
          <Link href="/login" className="flex items-center justify-between p-4 rounded-2xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all">
            Logout <span>🚪</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 pl-72">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#F5F1EA] flex items-center justify-between px-10 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Cloud Synced</span>
          </div>
          <div className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <main className="p-10 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarNavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
        active 
        ? "bg-[#FAF9F6] text-[#7A8F66] shadow-sm border border-[#F5F1EA]" 
        : "text-gray-400 hover:text-[#2D2D2D] hover:bg-[#FAF9F6]/50"
      }`}
    >
      <span className={`text-lg transition-transform group-hover:scale-110 ${active ? "opacity-100" : "opacity-50"}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}