'use client';

import * as React from 'react';
import Link from 'next/link';
import { TrendUp, Wallet, CheckCircle, Clock, Calendar, DownloadSimple, CurrencyCircleDollar, ArrowRight } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { formatIDR, formatNumber, formatDate } from '@/lib/utils';

const weeklyData = [
  { day: 'Sen', value: 12, valid: 10 },
  { day: 'Sel', value: 8, valid: 7 },
  { day: 'Rab', value: 15, valid: 12 },
  { day: 'Kam', value: 10, valid: 9 },
  { day: 'Jum', value: 18, valid: 15 },
  { day: 'Sab', value: 6, valid: 5 },
  { day: 'Min', value: 3, valid: 3 },
];

export default function PartnerEarningsPage() {
  const [period, setPeriod] = React.useState('weekly');
  const stats = { totalEarnings: 1225000, paidAmount: 1075000, unpaidAmount: 150000, totalValid: 245, thisMonth: 68 };
  const maxValue = Math.max(...weeklyData.map(d => d.value));

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="px-4 md:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Earnings</h1>
          <p className="text-emerald-100 mt-1">Pantau penghasilan Anda</p>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20"><Wallet size={24} weight="fill" /></div>
                <div><p className="text-emerald-100 text-sm">Total Earnings</p><p className="text-2xl font-bold">{formatIDR(stats.totalEarnings)}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-green-50"><CheckCircle size={24} className="text-green-500" /></div><div><p className="text-slate-500 text-sm">Sudah Dibayar</p><p className="text-xl font-bold text-green-600">{formatIDR(stats.paidAmount)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-50"><Clock size={24} className="text-amber-500" /></div><div><p className="text-slate-500 text-sm">Belum Dibayar</p><p className="text-xl font-bold text-amber-600">{formatIDR(stats.unpaidAmount)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-50"><TrendUp size={24} className="text-blue-500" /></div><div><p className="text-slate-500 text-sm">Bulan Ini</p><p className="text-xl font-bold">{stats.thisMonth} activations</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="font-semibold text-slate-900">Submission Trend</h3><p className="text-sm text-slate-500">Total & valid submissions</p></div>
              <Tabs value={period} onValueChange={setPeriod}><TabsList><TabsTrigger value="weekly">Weekly</TabsTrigger><TabsTrigger value="monthly">Monthly</TabsTrigger></TabsList></Tabs>
            </div>
            <div className="h-48 flex items-end justify-between gap-3">
              {weeklyData.map((day, i) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end gap-1 h-32">
                    <div className="flex-1 rounded-t-lg bg-blue-500" style={{ height: `${(day.value / maxValue) * 100}%` }} />
                    <div className="flex-1 rounded-t-lg bg-emerald-500" style={{ height: `${(day.valid / maxValue) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-slate-500">Total</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-500">Valid</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Pembayaran Terbaru</h3>
            <div className="space-y-3">
              {[{ period: 'Week 27 (Jul 1-7)', amount: 450000, status: 'paid' }, { period: 'Week 26 (Jun 24-30)', amount: 375000, status: 'paid' }].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-50"><CurrencyCircleDollar size={24} className="text-blue-500" /></div>
                    <div><p className="font-medium">{p.period}</p><p className="text-sm text-slate-500">{formatDate('2026-07-08')}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-emerald-600">{formatIDR(p.amount)}</p>
                    <Badge variant="success"><CheckCircle size={14} className="mr-1" />Paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
