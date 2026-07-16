'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, Warning, Eye, MagnifyingGlass } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

const mockAlerts = [
  { id: 'FA-001', partner_name: 'Ahmad Fauzi', customer_name: 'Budi Santoso', flag_type: 'duplicate_phone', description: 'Nomor telepon yang sama sudah terdaftar di 3 submission lain', risk_level: 'high', reviewed: false },
  { id: 'FA-002', partner_name: 'Citra Dewi', customer_name: 'Ani Wijaya', flag_type: 'suspicious_pattern', description: '5 submission dalam 10 menit dari lokasi yang sama', risk_level: 'critical', reviewed: false },
  { id: 'FA-003', partner_name: 'Dian Pratama', customer_name: 'Dedi Kurniawan', flag_type: 'manipulated_evidence', description: 'Evidence appears to be manipulated', risk_level: 'high', reviewed: true },
];

export default function AdminFraudPage() {
  const stats = { total: mockAlerts.length, unreviewed: 2, critical: 1, high: 2 };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
        <div className="px-4 md:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Fraud Review</h1>
          <p className="text-red-100 mt-1">Review dan investigasi fraud alerts</p>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-red-50"><ShieldCheck size={24} className="text-red-500" /></div><div><p className="text-sm text-slate-500">Total Alerts</p><p className="text-2xl font-bold">{stats.total}</p></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-amber-50"><Warning size={24} className="text-amber-500" /></div><div><p className="text-sm text-slate-500">Unreviewed</p><p className="text-2xl font-bold text-amber-600">{stats.unreviewed}</p></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-red-100"><Warning size={24} className="text-red-600" /></div><div><p className="text-sm text-slate-500">Critical</p><p className="text-2xl font-bold text-red-600">{stats.critical}</p></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-orange-50"><Warning size={24} className="text-orange-500" /></div><div><p className="text-sm text-slate-500">High Risk</p><p className="text-2xl font-bold text-orange-600">{stats.high}</p></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Alert ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Flag</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockAlerts.map((alert) => (
                  <tr key={alert.id} className={alert.risk_level === 'critical' ? 'bg-red-50/50' : alert.risk_level === 'high' ? 'bg-amber-50/50' : ''}>
                    <td className="px-4 py-4"><span className="font-mono text-sm font-medium text-blue-600">{alert.id}</span></td>
                    <td className="px-4 py-4"><p className="font-medium text-slate-900">{alert.partner_name}</p><p className="text-sm text-slate-500">{alert.customer_name}</p></td>
                    <td className="px-4 py-4"><p className="text-sm text-slate-600 capitalize">{alert.flag_type.replace('_', ' ')}</p><p className="text-xs text-slate-400 truncate max-w-xs">{alert.description}</p></td>
                    <td className="px-4 py-4">
                      <Badge variant={alert.risk_level === 'critical' || alert.risk_level === 'high' ? 'danger' : 'warning'} size="sm">{alert.risk_level}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      {alert.reviewed ? <Badge variant="success" size="sm">Reviewed</Badge> : <Badge variant="warning" size="sm">New</Badge>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <a href={`/admin/fraud/${alert.id}`}><Button variant="ghost" size="icon-sm"><Eye size={18} /></Button></a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
