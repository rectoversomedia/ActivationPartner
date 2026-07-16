'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  MagnifyingGlass,
  PlusCircle,
  Eye,
  CaretLeft,
  CaretRight,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  SortAscending,
  DownloadSimple,
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Skeleton } from '@/components/ui';
import { cn, formatDate, statusColors, statusLabels } from '@/lib/utils';
import type { SubmissionStatus } from '@/types';

const mockSubmissions = [
  { id: 'SUB-260715-A1B2C3D4', customer_name: 'Budi Santoso', customer_phone_masked: '0812****7890', activation_city: 'Jakarta', activation_date: '2026-07-15', status: 'valid' as SubmissionStatus, fee: 5000 },
  { id: 'SUB-260715-E5F6G7H8', customer_name: 'Ani Wijaya', customer_phone_masked: '0857****1234', activation_city: 'Bandung', activation_date: '2026-07-15', status: 'pending_qc' as SubmissionStatus, fee: 5000 },
  { id: 'SUB-260714-I9J0K1L2', customer_name: 'Dedi Kurniawan', customer_phone_masked: '0813****5678', activation_city: 'Surabaya', activation_date: '2026-07-14', status: 'need_revision' as SubmissionStatus, fee: 5000 },
  { id: 'SUB-260714-M3N4O5P6', customer_name: 'Citra Dewi', customer_phone_masked: '0821****9012', activation_city: 'Medan', activation_date: '2026-07-14', status: 'non_valid' as SubmissionStatus, fee: 0 },
];

const ITEMS_PER_PAGE = 10;

export default function PartnerSubmissionsPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading] = React.useState(false);

  const filteredSubmissions = React.useMemo(() => {
    return mockSubmissions.filter((sub) => {
      const matchesSearch = !search || sub.id.toLowerCase().includes(search.toLowerCase()) || sub.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const getStatusBadge = (status: SubmissionStatus) => {
    const colors = statusColors[status] || statusColors.submitted;
    const label = statusLabels[status] || status;
    return <Badge className={cn(colors.bg, colors.text)} size="sm">{label}</Badge>;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Submission Saya</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola semua submission aktivasi Anda</p>
            </div>
            <Link href="/partner/submissions/new">
              <Button className="gap-2"><PlusCircle size={18} weight="fill" />Aktivasi Baru</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4"><CardContent className="p-0 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-50"><FileText size={20} className="text-blue-500" /></div><div><p className="text-xs text-slate-500">Total</p><p className="text-xl font-bold text-slate-900">{mockSubmissions.length}</p></div></CardContent></Card>
          <Card className="p-4"><CardContent className="p-0 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={20} className="text-emerald-500" /></div><div><p className="text-xs text-slate-500">Valid</p><p className="text-xl font-bold text-emerald-600">{mockSubmissions.filter(s => s.status === 'valid').length}</p></div></CardContent></Card>
          <Card className="p-4"><CardContent className="p-0 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-50"><Clock size={20} className="text-amber-500" /></div><div><p className="text-xs text-slate-500">Pending</p><p className="text-xl font-bold text-amber-600">{mockSubmissions.filter(s => s.status === 'pending_qc').length}</p></div></CardContent></Card>
          <Card className="p-4"><CardContent className="p-0 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-50"><XCircle size={20} className="text-red-500" /></div><div><p className="text-xs text-slate-500">Invalid</p><p className="text-xl font-bold text-red-600">{mockSubmissions.filter(s => s.status === 'non_valid').length}</p></div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="pending_qc">Pending QC</SelectItem>
                  <SelectItem value="non_valid">Tidak Valid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4"><FileText size={32} className="text-slate-400" /></div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Submission</h3>
                <Link href="/partner/submissions/new"><Button><PlusCircle size={18} className="mr-2" />Buat Submission Baru</Button></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kota</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Fee</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4"><span className="font-mono text-sm font-medium text-blue-600">{sub.id}</span></td>
                        <td className="px-4 py-4"><p className="font-medium text-slate-900">{sub.customer_name}</p><p className="text-xs text-slate-500">{sub.customer_phone_masked}</p></td>
                        <td className="px-4 py-4 text-sm text-slate-600">{sub.activation_city}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{formatDate(sub.activation_date)}</td>
                        <td className="px-4 py-4">{getStatusBadge(sub.status)}</td>
                        <td className="px-4 py-4 text-right font-semibold text-slate-900">{sub.fee > 0 ? `Rp ${sub.fee.toLocaleString('id-ID')}` : '-'}</td>
                        <td className="px-4 py-4"><div className="flex items-center justify-center gap-2"><Link href={`/partner/submissions/${sub.id}`}><Button variant="ghost" size="icon-sm"><Eye size={18} /></Button></Link></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
