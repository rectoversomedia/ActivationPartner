'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  CurrencyCircleDollar,
  TrendUp,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  Shield,
  Trophy,
  ArrowRight,
  Eye,
  Lightning,
  ChartLine,
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { StatCard, StatusCard, ProgressCard, LeaderboardCard, QcQueueSummary } from '@/components/dashboard/stats';

const stats = {
  totalSubmissions: 1247,
  pendingQc: 89,
  valid: 956,
  invalid: 156,
  suspectedFraud: 23,
  confirmedFraud: 8,
  validRate: 78.5,
  fraudRate: 2.5,
  totalEarnings: 4780000,
  paidAmount: 4200000,
  unpaidAmount: 580000,
  totalPartners: 18,
  activePartners: 15,
  totalPic: 2,
  campaignTarget: 5000,
  currentProgress: 1247,
};

const recentSubmissions = [
  { id: 'SUB-260715-A1B2', partner: 'Ahmad Fauzi', city: 'Jakarta', status: 'pending_qc' },
  { id: 'SUB-260715-C3D4', partner: 'Budi Santoso', city: 'Bandung', status: 'valid' },
  { id: 'SUB-260715-E5F6', partner: 'Citra Dewi', city: 'Surabaya', status: 'suspected_fraud' },
  { id: 'SUB-260715-G7H8', partner: 'Dian Pratama', city: 'Medan', status: 'non_valid' },
  { id: 'SUB-260715-I9J0', partner: 'Eko Wijaya', city: 'Semarang', status: 'pending_qc' },
];

const weeklyData = [
  { day: 'Mon', submissions: 145, valid: 120 },
  { day: 'Tue', submissions: 168, valid: 138 },
  { day: 'Wed', submissions: 189, valid: 152 },
  { day: 'Thu', submissions: 156, valid: 128 },
  { day: 'Fri', submissions: 201, valid: 165 },
  { day: 'Sat', submissions: 178, valid: 145 },
  { day: 'Sun', submissions: 210, valid: 108 },
];

const topPartners = [
  { rank: 1, name: 'Ahmad Fauzi', value: 156 },
  { rank: 2, name: 'Budi Santoso', value: 142 },
  { rank: 3, name: 'Citra Dewi', value: 138 },
  { rank: 4, name: 'Dian Pratama', value: 125 },
  { rank: 5, name: 'Eko Wijaya', value: 118 },
];

const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default function AdminDashboard() {
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fade-in">
              <p className="text-slate-400 text-sm mb-1">Campaign Dashboard</p>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">FIFGO Campaign</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><Trophy size={14} weight="fill" className="mr-1" />Active</Badge>
              </div>
              <p className="text-slate-400 text-sm mt-1">January - December 2026</p>
            </div>
            <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Link href="/admin/submissions"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-10"><Eye size={18} className="mr-2" />View Submissions</Button></Link>
              <Link href="/admin/payments"><Button className="bg-gradient-to-r from-emerald-500 to-teal-500 h-10"><CurrencyCircleDollar size={18} className="mr-2" />Create Payment Batch</Button></Link>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Submissions" value={stats.totalSubmissions} icon={FileText} iconColor="text-blue-500" iconBg="bg-blue-50" trend={{ value: 12.5, isPositive: true, label: 'vs last week' }} delay={0.1} />
          <StatCard title="Valid Rate" value={`${stats.validRate}%`} icon={CheckCircle} iconColor="text-emerald-500" iconBg="bg-emerald-50" trend={{ value: 3.2, isPositive: true, label: 'vs last week' }} delay={0.15} />
          <StatCard title="Fraud Rate" value={`${stats.fraudRate}%`} icon={Shield} iconColor="text-red-500" iconBg="bg-red-50" trend={{ value: 0.5, isPositive: false, label: 'vs last week' }} delay={0.2} />
          <StatCard title="Total Payout" value={formatIDR(stats.totalEarnings)} icon={CurrencyCircleDollar} iconColor="text-amber-500" iconBg="bg-amber-50" format="currency" delay={0.25} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatusCard status="Pending QC" count={stats.pendingQc} icon={Clock} color="text-amber-500" bgColor="bg-amber-50" delay={0.3} />
          <StatusCard status="Valid" count={stats.valid} icon={CheckCircle} color="text-emerald-500" bgColor="bg-emerald-50" delay={0.35} />
          <StatusCard status="Invalid" count={stats.invalid} icon={XCircle} color="text-red-500" bgColor="bg-red-50" delay={0.4} />
          <StatusCard status="Suspected Fraud" count={stats.suspectedFraud} icon={Warning} color="text-orange-500" bgColor="bg-orange-50" delay={0.45} />
          <StatusCard status="Confirmed Fraud" count={stats.confirmedFraud} icon={Shield} color="text-red-600" bgColor="bg-red-100" delay={0.5} />
        </div>

        <ProgressCard title="Campaign Target Progress" current={stats.currentProgress} target={stats.campaignTarget} icon={Trophy} color="bg-gradient-to-r from-amber-500 to-orange-500" unit="activations" delay={0.55} />

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="font-semibold text-slate-900">Submission & Validasi Trend</h3><p className="text-sm text-slate-500">This week's performance</p></div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-slate-500">Submissions</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-500">Valid</span></div>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-3">
                {weeklyData.map((day, i) => {
                  const maxValue = Math.max(...weeklyData.map(d => d.submissions));
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1 animate-fade-in" style={{ animationDelay: `${0.7 + i * 0.05}s` }}>
                      <div className="w-full flex items-end gap-1 h-36">
                        <div className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700" style={{ height: `${(day.submissions / maxValue) * 100}%` }} />
                        <div className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-700" style={{ height: `${(day.valid / maxValue) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 mt-2">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <QcQueueSummary pending={stats.pendingQc} valid={stats.valid} invalid={stats.invalid} needRevision={12} avgTimeHours={4.2} delay={0.65} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Submissions</h3>
                <Link href="/admin/submissions"><Button variant="ghost" size="sm" className="text-blue-600">View All <ArrowRight size={14} className="ml-1" /></Button></Link>
              </div>
              <div className="space-y-3">
                {recentSubmissions.map((sub, i) => (
                  <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer animate-fade-in" style={{ animationDelay: `${0.8 + i * 0.05}s` }}>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{sub.id}</p><p className="text-xs text-slate-500 truncate">{sub.partner} • {sub.city}</p></div>
                    <Badge variant={sub.status === 'valid' ? 'success' : sub.status === 'pending_qc' ? 'warning' : 'danger'} size="sm">{sub.status.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <LeaderboardCard title="Top Partners" items={topPartners} unit="valid" icon={Trophy} delay={0.75} />
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl"><Shield size={20} weight="fill" className="text-white" /></div><h3 className="font-semibold text-slate-900">Fraud Alerts</h3></div>
                <Link href="/admin/fraud"><Button variant="ghost" size="sm" className="text-red-600">Review <ArrowRight size={14} className="ml-1" /></Button></Link>
              </div>
              <div className="space-y-3">
                {[{ type: 'duplicate_phone', count: 5, severity: 'high' }, { type: 'duplicate_evidence', count: 3, severity: 'medium' }, { type: 'suspicious_pattern', count: 8, severity: 'high' }].map((alert, i) => (
                  <div key={alert.type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 animate-fade-in" style={{ animationDelay: `${0.9 + i * 0.1}s` }}>
                    <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${alert.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} /><span className="text-sm text-slate-700">{alert.type.replace('_', ' ')}</span></div>
                    <Badge variant={alert.severity === 'high' ? 'danger' : 'warning'} size="sm">{alert.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Team Overview</h3>
              <Link href="/admin/users"><Button variant="ghost" size="sm" className="text-blue-600">Manage Team <ArrowRight size={14} className="ml-1" /></Button></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Partners', value: stats.totalPartners, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-500' },
                { label: 'Active Partners', value: stats.activePartners, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-500' },
                { label: 'PICs', value: stats.totalPic, icon: Users, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-500' },
                { label: 'Avg Valid Rate', value: `${Math.round((stats.valid / stats.totalSubmissions) * 100)}%`, icon: TrendUp, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-500' },
              ].map((stat, i) => (
                <div key={stat.label} className="p-4 rounded-xl bg-slate-50 animate-fade-in" style={{ animationDelay: `${1 + i * 0.05}s` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}><stat.icon size={18} weight="fill" className="text-white" /></div>
                    <span className="text-sm text-slate-500">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
