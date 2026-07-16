'use client';

import * as React from 'react';
import Link from 'next/link';
import { MagnifyingGlass, Eye, DownloadSimple, FileText, CheckCircle, Clock, Warning } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui';
import { formatDate, statusColors, statusLabels } from '@/lib/utils';
import type { SubmissionStatus } from '@/types';

const mockSubmissions = [
  { id: 'SUB-260715-A1B2', partner_name: 'Ahmad Fauzi', customer_name: 'Budi Santoso', campaign: 'FIFGO Campaign', activation_city: 'Jakarta', activation_date: '2026-07-15', status: 'pending_qc' as SubmissionStatus },
  { id: 'SUB-260715-C3D4', partner_name: 'Budi Santoso', customer_name: 'Ani Wijaya', campaign: 'FIFGO Campaign', activation_city: 'Bandung', activation_date: '2026-07-15', status: 'valid' as SubmissionStatus },
  { id: 'SUB-260715-E5F6', partner_name: 'Citra Dewi', customer_name: 'Dedi Kurniawan', campaign: 'FIFGO Campaign', activation_city: 'Surabaya', activation_date: '2026-07-15', status: 'suspected_fraud' as SubmissionStatus },
  { id: 'SUB-260714-G7H8', partner_name: 'Dian Pratama', customer_name: 'Eko Prasetyo', campaign: 'Brand X', activation_city: 'Medan', activation_date: '2026-07-14', status: 'non_valid' as SubmissionStatus },
];

export default function AdminSubmissionsPage() {
  const stats = { total: mockSubmissions.length, pending: 1, valid: 1, fraud: 1 };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">All Submissions</h1><p className="text-sm text-slate-500">Kelola semua submissions</p></div>
          <Button variant="outline"><DownloadSimple size={18} className="mr-2" />Export</Button>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-50"><FileText size={20} className="text-blue-500" /></div><div><p className="text-sm text-slate-500">Total</p><p className="text-xl font-bold">{stats.total}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-50"><Clock size={20} className="text-amber-500" /></div><div><p className="text-sm text-slate-500">Pending QC</p><p className="text-xl font-bold text-amber-600">{stats.pending}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={20} className="text-emerald-500" /></div><div><p className="text-sm text-slate-500">Valid</p><p className="text-xl font-bold text-emerald-600">{stats.valid}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-50"><Warning size={20} className="text-red-500" /></div><div><p className="text-sm text-slate-500">Fraud</p><p className="text-xl font-bold text-red-600">{stats.fraud}</p></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative"><MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Cari..." className="pl-10" /></div>
              <Select><SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Campaign" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="fifgo">FIFGO</SelectItem><SelectItem value="brandx">Brand X</SelectItem></SelectContent></Select>
              <Select><SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="pending_qc">Pending</SelectItem><SelectItem value="valid">Valid</SelectItem></SelectContent></Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4"><span className="font-mono text-sm font-medium text-blue-600">{sub.id}</span></td>
                      <td className="px-4 py-4"><p className="font-medium text-slate-900">{sub.partner_name}</p></td>
                      <td className="px-4 py-4"><p className="font-medium text-slate-900">{sub.customer_name}</p></td>
                      <td className="px-4 py-4 text-sm text-slate-600">{sub.campaign}</td>
                      <td className="px-4 py-4"><Badge className={statusColors[sub.status].bg + ' ' + statusColors[sub.status].text}>{statusLabels[sub.status]}</Badge></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/submissions/${sub.id}`}><Button variant="ghost" size="icon-sm"><Eye size={18} /></Button></Link>
                          {sub.status === 'pending_qc' && <Link href={`/admin/qc/${sub.id}`}><Button size="sm">QC</Button></Link>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
