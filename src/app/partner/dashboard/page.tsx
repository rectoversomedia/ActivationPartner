'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Lightning,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  TrendUp,
  Trophy,
  ArrowRight,
  PlusCircle,
  Eye,
  Wallet,
  Target,
  Shield,
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { StatCard, StatusCard, EarningsCard, RecentActivityCard, ProgressCard } from '@/components/dashboard/stats';

const dashboardData = {
  today: 5,
  thisWeek: 23,
  total: 156,
  pending: 8,
  valid: 120,
  invalid: 20,
  needRevision: 6,
  suspectedFraud: 2,
  validRate: 77,
  estimatedEarnings: 600000,
  paidAmount: 450000,
  unpaidAmount: 150000,
  lastPayment: '2026-07-08',
  campaignTarget: 500,
  currentProgress: 156,
  feePerActivation: 5000,
};

const recentActivities = [
  { id: '1', type: 'submission' as const, title: 'Submission Valid', description: 'Submission SUB-260715-A1B2C3D4 declared VALID', timestamp: '2 jam lalu' },
  { id: '2', type: 'qc' as const, title: 'QC Completed', description: 'Submission SUB-260715-E5F6G7H8 reviewed', timestamp: '4 jam lalu' },
  { id: '3', type: 'submission' as const, title: 'New Submission', description: 'Submitted to FIFGO Campaign', timestamp: '5 jam lalu' },
  { id: '4', type: 'payment' as const, title: 'Payment Received', description: 'Week 27 payment of IDR 450,000', timestamp: '1 hari lalu' },
];

const weeklyData = [
  { day: 'Mon', value: 12 },
  { day: 'Tue', value: 8 },
  { day: 'Wed', value: 15 },
  { day: 'Thu', value: 10 },
  { day: 'Fri', value: 18 },
  { day: 'Sat', value: 6 },
  { day: 'Sun', value: 3 },
];

export default function PartnerDashboard() {
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <p className="text-white/70 text-sm mb-1">Selamat Datang Kembali,</p>
              <h1 className="text-2xl md:text-3xl font-bold">Partner Demo</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0"><Trophy size={14} weight="fill" className="mr-1" />FIFGO Campaign</Badge>
                <span className="text-white/60 text-xs">Joined: Jan 2026</span>
              </div>
            </div>
            <Link href="/partner/submissions/new">
              <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-xl h-12 px-6 animate-fade-in gap-2">
                <PlusCircle size={20} weight="fill" />Aktivasi Baru
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4 md:px-8 pb-6">
          {[
            { label: 'Hari Ini', value: dashboardData.today, icon: Lightning, color: 'text-yellow-300' },
            { label: 'Minggu Ini', value: dashboardData.thisWeek, icon: Calendar, color: 'text-blue-300' },
            { label: 'Valid Rate', value: `${dashboardData.validRate}%`, icon: TrendUp, color: 'text-emerald-300' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={18} weight="fill" className={stat.color} />
                <span className="text-white/70 text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        <EarningsCard validActivations={dashboardData.valid} feePerActivation={dashboardData.feePerActivation} paidAmount={dashboardData.paidAmount} unpaidAmount={dashboardData.unpaidAmount} delay={0.1} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard status="Pending" count={dashboardData.pending} icon={Clock} color="text-amber-500" bgColor="bg-amber-50" delay={0.2} />
          <StatusCard status="Valid" count={dashboardData.valid} icon={CheckCircle} color="text-emerald-500" bgColor="bg-emerald-50" delay={0.25} />
          <StatusCard status="Invalid" count={dashboardData.invalid} icon={XCircle} color="text-red-500" bgColor="bg-red-50" delay={0.3} />
          <StatusCard status="Revisi" count={dashboardData.needRevision} icon={Warning} color="text-orange-500" bgColor="bg-orange-50" delay={0.35} />
        </div>

        <ProgressCard title="Campaign Progress" current={dashboardData.currentProgress} target={dashboardData.campaignTarget} icon={Target} color="bg-blue-500" unit="activations" delay={0.4} />

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="font-semibold text-slate-900">Submission Mingguan</h3><p className="text-sm text-slate-500">Total: {dashboardData.thisWeek} submissions</p></div>
                <div className="p-2 bg-blue-50 rounded-xl"><TrendUp size={20} weight="fill" className="text-blue-500" /></div>
              </div>
              <div className="flex items-end justify-between h-32 gap-2">
                {weeklyData.map((day, i) => {
                  const maxValue = Math.max(...weeklyData.map(d => d.value));
                  const height = (day.value / maxValue) * 100;
                  const isToday = i === weeklyData.length - 1;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${0.6 + i * 0.05}s` }}>
                      <span className="text-xs font-medium text-slate-600">{day.value}</span>
                      <div className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-slate-200'}`} style={{ height: `${Math.max(height, 10)}%` }} />
                      <span className={`text-xs ${isToday ? 'font-semibold text-blue-600' : 'text-slate-400'}`}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <RecentActivityCard activities={recentActivities} delay={0.55} />
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Submission Baru', icon: PlusCircle, href: '/partner/submissions/new', color: 'from-emerald-500 to-emerald-600' },
                { label: 'Lihat Submission', icon: Eye, href: '/partner/submissions', color: 'from-blue-500 to-blue-600' },
                { label: 'Earnings', icon: Wallet, href: '/partner/earnings', color: 'from-amber-500 to-amber-600' },
                { label: 'SOP & Help', icon: Shield, href: '/partner/sop', color: 'from-purple-500 to-purple-600' },
              ].map((action, i) => (
                <Link key={action.label} href={action.href} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}><action.icon size={24} weight="fill" className="text-white" /></div>
                  <span className="text-sm font-medium text-slate-700 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
