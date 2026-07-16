'use client';

import * as React from 'react';
import { ClipboardText, Clock, CheckCircle, XCircle, Warning, Eye } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

const mockQueue = [
  { id: 'SUB-260715-A1B2', partner_name: 'Ahmad Fauzi', customer_name: 'Budi Santoso', campaign: 'FIFGO', submitted_at: '2026-07-15T14:45:00Z', priority: 'normal' },
  { id: 'SUB-260715-C3D4', partner_name: 'Budi Santoso', customer_name: 'Ani Wijaya', campaign: 'FIFGO', submitted_at: '2026-07-15T13:30:00Z', priority: 'high' },
  { id: 'SUB-260714-E5F6', partner_name: 'Citra Dewi', customer_name: 'Dedi Kurniawan', campaign: 'FIFGO', submitted_at: '2026-07-14T16:20:00Z', priority: 'urgent' },
];

export default function AdminQcPage() {
  const stats = { total: mockQueue.length, urgent: 1, high: 1, normal: 1 };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="px-4 md:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold">QC Review Queue</h1>
          <p className="text-cyan-100 mt-1">Review dan validasi submissions</p>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-blue-50"><ClipboardText size={24} className="text-blue-500" /></div><div><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-red-50"><Warning size={24} className="text-red-500" /></div><div><p className="text-sm text-slate-500">Urgent</p><p className="text-2xl font-bold text-red-600">{stats.urgent}</p></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-amber-50"><Warning size={24} className="text-amber-500" /></div><div><p className="text-sm text-slate-500">High</p><p className="text-2xl font-bold text-amber-600">{stats.high}</p></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-slate-50"><Clock size={24} className="text-slate-500" /></div><div><p className="text-sm text-slate-500">Normal</p><p className="text-2xl font-bold">{stats.normal}</p></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4"><span className="font-mono text-sm font-medium text-blue-600">{item.id}</span></td>
                    <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.partner_name}</p></td>
                    <td className="px-4 py-4"><p className="font-medium text-slate-900">{item.customer_name}</p></td>
                    <td className="px-4 py-4">
                      {item.priority === 'urgent' && <Badge variant="danger" size="sm">Urgent</Badge>}
                      {item.priority === 'high' && <Badge variant="warning" size="sm">High</Badge>}
                      {item.priority === 'normal' && <Badge variant="outline" size="sm">Normal</Badge>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <a href={`/admin/qc/${item.id}`}><Button size="sm">Review</Button></a>
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
