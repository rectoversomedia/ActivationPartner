'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  UserCircle,
  FileText,
  ChartLineUp,
  CurrencyCircleDollar,
  Bell,
  Gear,
  SignOut,
  PlusCircle,
  CaretLeft,
  CaretRight,
  List,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui';

const partnerNav = [
  { title: 'Dashboard', href: '/partner/dashboard', icon: House, color: 'text-blue-500' },
  { title: 'Aktivasi Baru', href: '/partner/submissions/new', icon: PlusCircle, color: 'text-emerald-500' },
  { title: 'Submission', href: '/partner/submissions', icon: FileText, color: 'text-purple-500' },
  { title: 'Earnings', href: '/partner/earnings', icon: ChartLineUp, color: 'text-amber-500' },
  { title: 'Pembayaran', href: '/partner/payments', icon: CurrencyCircleDollar, color: 'text-cyan-500' },
  { title: 'Profil', href: '/partner/profile', icon: UserCircle, color: 'text-pink-500' },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-20' : 'w-72'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <Link href="/partner/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={28} height={28} className="object-contain brightness-0 invert" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={120} height={30} className="object-contain" />
                <p className="text-[10px] text-slate-500 -mt-1">Activation System</p>
              </div>
            )}
          </Link>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-slate-100">
            {sidebarCollapsed ? <CaretRight size={16} className="text-slate-400" /> : <CaretLeft size={16} className="text-slate-400" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {partnerNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                  isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-white' : item.color} />
                {!sidebarCollapsed && <span className="font-medium text-sm">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer', sidebarCollapsed && 'justify-center')}>
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">P1</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">Partner Demo</p>
                  <p className="text-xs text-slate-500 truncate">partner1@rectoverso.id</p>
                </div>
                <button onClick={() => router.push('/login')} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-red-500"><SignOut size={18} /></button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100"><List size={24} className="text-slate-600" /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={20} height={20} className="object-contain brightness-0 invert" />
            </div>
            <span className="font-bold text-slate-900">RECTOVERSO</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-slate-100"><Bell size={20} className="text-slate-600" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" /></button>
          <Avatar className="w-8 h-8"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">P1</AvatarFallback></Avatar>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white animate-slide-in-left">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={24} height={24} className="object-contain brightness-0 invert" />
                </div>
                <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={100} height={25} className="object-contain" />
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><CaretLeft size={20} className="text-slate-400" /></button>
            </div>
            <nav className="p-3 space-y-1">
              {partnerNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl transition-all', isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {partnerNav.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn('flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all min-w-[60px]', isActive ? 'text-blue-600' : 'text-slate-400')}>
                <div className={cn('p-2 rounded-xl transition-all', isActive && 'bg-blue-50')}><Icon size={20} weight={isActive ? 'fill' : 'regular'} /></div>
                <span className="text-[10px] font-medium">{item.title.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
