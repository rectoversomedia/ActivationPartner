'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  House,
  UserCircle,
  FileText,
  ChartLineUp,
  CurrencyCircleDollar,
  Bell,
  Gear,
  SignOut,
  List,
  X,
  ShieldCheck,
  UsersThree,
  Trophy,
  Warning,
  Eye,
  ClipboardText,
  Wallet,
  CalendarCheck,
  Bank,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  PlusCircle,
} from '@phosphor-icons/react';
import { Avatar, AvatarFallback, Badge } from '@/components/ui';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

const partnerNav: NavItem[] = [
  { title: 'Dashboard', href: '/partner/dashboard', icon: House, color: 'text-blue-500' },
  { title: 'Aktivasi Baru', href: '/partner/submissions/new', icon: PlusCircle, color: 'text-emerald-500' },
  { title: 'Submissions Saya', href: '/partner/submissions', icon: FileText, color: 'text-purple-500' },
  { title: 'Earnings', href: '/partner/earnings', icon: ChartLineUp, color: 'text-amber-500' },
  { title: 'Pembayaran', href: '/partner/payments', icon: Wallet, color: 'text-cyan-500' },
  { title: 'Profil', href: '/partner/profile', icon: UserCircle, color: 'text-pink-500' },
];

const picNav: NavItem[] = [
  { title: 'Dashboard', href: '/pic/dashboard', icon: House, color: 'text-blue-500' },
  { title: 'QC Queue', href: '/pic/qc', icon: ClipboardText, color: 'text-emerald-500' },
  { title: 'Partners', href: '/pic/partners', icon: UsersThree, color: 'text-purple-500' },
  { title: 'Submissions', href: '/pic/submissions', icon: MagnifyingGlass, color: 'text-amber-500' },
  { title: 'Fraud Alerts', href: '/pic/fraud', icon: Warning, color: 'text-red-500' },
  { title: 'Reports', href: '/pic/reports', icon: ChartLineUp, color: 'text-cyan-500' },
];

const managerNav: NavItem[] = [
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

interface SidebarProps {
  role: 'partner' | 'pic' | 'manager';
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ role, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'partner' ? partnerNav : role === 'pic' ? picNav : managerNav;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ShieldCheck size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rectoverso
              </h1>
              <p className="text-[10px] text-slate-500 -mt-1">Activation System</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-scale-in">
            <ShieldCheck size={24} weight="fill" className="text-white" />
          </Link>
        )}
        <button
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            'p-2 rounded-lg hover:bg-slate-100 transition-all duration-200',
            collapsed && 'absolute -right-3 top-6 bg-white border border-slate-200 shadow-sm'
          )}
        >
          {collapsed ? (
            <CaretRight size={16} className="text-slate-500" />
          ) : (
            <CaretLeft size={16} className="text-slate-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              <Icon
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                className={cn(
                  'relative z-10 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-white' : item.color
                )}
              />
              {!collapsed && (
                <>
                  <span className="relative z-10 font-medium text-sm">{item.title}</span>
                  {item.badge && (
                    <Badge variant="danger" size="sm" className="relative z-10 ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce-in">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100">
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer',
          collapsed && 'justify-center p-2'
        )}>
          <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              Partner
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Partner Name</p>
              <p className="text-xs text-slate-500 truncate">partner@rectoverso.id</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-2 rounded-lg hover:bg-white transition-colors text-slate-400 hover:text-red-500">
              <SignOut size={18} />
            </button>
          )}
          {collapsed && (
            <button className="absolute -right-3 bottom-3 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <SignOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, subtitle, actions, showBack, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 active:scale-95"
            >
              <CaretLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 animate-fade-in">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <button className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 active:scale-95">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          </button>
          <button className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 active:scale-95">
            <Gear size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
}

interface MobileNavProps {
  role: 'partner' | 'pic' | 'manager';
  currentPath: string;
  onNavigate: (href: string) => void;
}

export function MobileNav({ role, currentPath, onNavigate }: MobileNavProps) {
  const navItems = role === 'partner' ? partnerNav : role === 'pic' ? picNav : managerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-400'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all duration-200',
                isActive && 'bg-blue-50'
              )}>
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              </div>
              <span className="text-[10px] font-medium">{item.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { partnerNav, picNav, managerNav };
