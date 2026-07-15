'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  House,
  UsersThree,
  FileText,
  ChartLineUp,
  CurrencyCircleDollar,
  Bell,
  Gear,
  SignOut,
  Trophy,
  ShieldCheck,
  Eye,
  ClipboardText,
  Wallet,
  CaretLeft,
  CaretRight,
  List,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui';

const adminNav = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: House, color: 'text-blue-500' },
  { title: 'Campaigns', href: '/admin/campaigns', icon: Trophy, color: 'text-purple-500' },
  { title: 'Submissions', href: '/admin/submissions', icon: FileText, color: 'text-emerald-500' },
  { title: 'QC Review', href: '/admin/qc', icon: ClipboardText, color: 'text-cyan-500' },
  { title: 'Fraud Review', href: '/admin/fraud', icon: ShieldCheck, color: 'text-red-500' },
  { title: 'PIC & Partners', href: '/admin/users', icon: UsersThree, color: 'text-amber-500' },
  { title: 'Payments', href: '/admin/payments', icon: CurrencyCircleDollar, color: 'text-green-500' },
  { title: 'Reports', href: '/admin/reports', icon: ChartLineUp, color: 'text-pink-500' },
  { title: 'Audit Logs', href: '/admin/audit', icon: Eye, color: 'text-slate-500' },
  { title: 'Settings', href: '/admin/settings', icon: Gear, color: 'text-slate-400' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-20' : 'w-72'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <ShieldCheck size={24} weight="fill" className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div><h1 className="text-lg font-bold">Rectoverso</h1><p className="text-[10px] text-slate-400 -mt-1">Admin Panel</p></div>
            )}
          </Link>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-white/10">
            {sidebarCollapsed ? <CaretRight size={16} className="text-slate-400" /> : <CaretLeft size={16} className="text-slate-400" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} className="transition-transform duration-200 group-hover:scale-110" />
                {!sidebarCollapsed && <span className="font-medium text-sm">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer', sidebarCollapsed && 'justify-center')}>
            <Avatar className="w-10 h-10 ring-2 ring-white/20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">AD</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Admin User</p>
                  <p className="text-xs text-slate-400 truncate">admin@rectoverso.id</p>
                </div>
                <button onClick={() => window.location.href = '/login'} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400"><SignOut size={18} /></button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 to-slate-800 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -ml-2 rounded-lg hover:bg-white/10"><List size={24} className="text-white" /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <ShieldCheck size={20} weight="fill" className="text-white" />
            </div>
            <span className="font-bold text-white">Rectoverso</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-white/10"><Bell size={20} className="text-white" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" /></button>
          <Avatar className="w-8 h-8"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">AD</AvatarFallback></Avatar>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white animate-slide-in-left">
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><ShieldCheck size={24} weight="fill" className="text-white" /></div>
                <div><h1 className="text-lg font-bold">Rectoverso</h1><p className="text-[10px] text-slate-400">Admin Panel</p></div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/10"><CaretLeft size={20} className="text-slate-400" /></button>
            </div>
            <nav className="p-3 space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl transition-all', isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')}>
                    <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main className={cn('flex-1 min-h-screen transition-all duration-300', 'mt-16 md:mt-0', sidebarCollapsed ? 'md:ml-20' : 'md:ml-72')}>
        {children}
      </main>
    </div>
  );
}
