'use client';

import * as React from 'react';
import { CurrencyCircleDollar, Bank, CheckCircle, Clock, XCircle, DownloadSimple, Receipt } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatIDR, formatDate } from '@/lib/utils';

const mockPayments = [
  { id: 'PAY-1', batch_code: 'BATCH-2607-001', period: 'Week 27 (Jul 1-7)', amount: 450000, status: 'paid', date: '2026-07-08' },
  { id: 'PAY-2', batch_code: 'BATCH-2607-001', period: 'Week 26 (Jun 24-30)', amount: 375000, status: 'paid', date: '2026-07-01' },
  { id: 'PAY-3', batch_code: 'BATCH-2606-002', period: 'Week 25 (Jun 17-23)', amount: 250000, status: 'paid', date: '2026-06-24' },
];

export default function PartnerPaymentsPage() {
  const stats = { totalEarned: 1075000, totalPaid: 1075000, pending: 1 };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="px-4 md:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Pembayaran</h1>
          <p className="text-cyan-100 mt-1">Riwayat pembayaran Anda</p>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20"><CurrencyCircleDollar size={28} weight="fill" /></div>
                <div><p className="text-emerald-100 text-sm">Total Earnings</p><p className="text-2xl font-bold">{formatIDR(stats.totalEarned)}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-green-50"><CheckCircle size={28} className="text-green-500" /></div><div><p className="text-slate-500 text-sm">Sudah Dibayar</p><p className="text-xl font-bold text-green-600">{formatIDR(stats.totalPaid)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-amber-50"><Clock size={28} className="text-amber-500" /></div><div><p className="text-slate-500 text-sm">Pending</p><p className="text-xl font-bold text-amber-600">{stats.pending} pembayaran</p></div></div></CardContent></Card>
        </div>
        <Card className="bg-slate-50"><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white"><Bank size={28} className="text-slate-600" /></div>
              <div><p className="text-sm text-slate-500">Rekening Tujuan</p><p className="font-semibold">Bank Central Asia (BCA)</p><p className="text-sm text-slate-600">1234****5678 • Ahmad Fauzi</p></div>
            </div>
            <Button variant="outline" size="sm">Ubah</Button>
          </div>
        </CardContent></Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Riwayat Pembayaran</h3>
            <div className="space-y-3">
              {mockPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-50"><CurrencyCircleDollar size={24} weight="fill" className="text-green-500" /></div>
                    <div>
                      <p className="font-semibold text-slate-900">{payment.period}</p>
                      <p className="text-sm text-slate-500">{payment.valid_activations} aktivasi valid</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">{formatIDR(payment.amount)}</p>
                      <p className="text-sm text-slate-500">{formatDate(payment.date)}</p>
                    </div>
                    <Badge variant="success"><CheckCircle size={14} className="mr-1" />Berhasil</Badge>
                    <Button variant="ghost" size="icon-sm"><DownloadSimple size={18} /></Button>
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
