'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Eye, Plus, Funnel, Download } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock data
const mockSubmissions = [
  { id: 'ACT-ABC12345', sales: 'Ahmad Fauzi', pic: 'Budi Santoso', campaign: 'FIFGO Campaign', date: '2026-07-16', status: 'valid', screenshots: 3 },
  { id: 'ACT-DEF67890', sales: 'Budi Santoso', pic: 'Ani Wijaya', campaign: 'FIFGO Campaign', date: '2026-07-16', status: 'pending', screenshots: 3 },
  { id: 'ACT-GHI11223', sales: 'Citra Dewi', pic: 'Budi Santoso', campaign: 'FIFGO Campaign', date: '2026-07-15', status: 'invalid', screenshots: 2 },
  { id: 'ACT-JKL44556', sales: 'Dian Pratama', pic: 'Ani Wijaya', campaign: 'Rectoverso Promo', date: '2026-07-15', status: 'valid', screenshots: 3 },
  { id: 'ACT-MNO77889', sales: 'Eko Wijaya', pic: 'Dewi Lestari', campaign: 'FIFGO Campaign', date: '2026-07-14', status: 'pending', screenshots: 3 },
  { id: 'ACT-PQR00112', sales: 'Fani Astuti', pic: 'Budi Santoso', campaign: 'FIFGO Campaign', date: '2026-07-14', status: 'valid', screenshots: 3 },
  { id: 'ACT-STU33445', sales: 'Gunawan', pic: 'Ani Wijaya', campaign: 'Rectoverso Promo', date: '2026-07-13', status: 'invalid', screenshots: 1 },
];

type StatusFilter = 'all' | 'valid' | 'pending' | 'invalid';

export default function DashboardPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [selectedSubmission, setSelectedSubmission] = React.useState<typeof mockSubmissions[0] | null>(null);

  const filteredSubmissions = mockSubmissions.filter(
    sub => statusFilter === 'all' || sub.status === statusFilter
  );

  const stats = {
    total: mockSubmissions.length,
    valid: mockSubmissions.filter(s => s.status === 'valid').length,
    pending: mockSubmissions.filter(s => s.status === 'pending').length,
    invalid: mockSubmissions.filter(s => s.status === 'invalid').length,
  };

  const validRate = Math.round((stats.valid / stats.total) * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle size={14} className="mr-1" />Valid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700"><Clock size={14} className="mr-1" />Pending</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-700"><XCircle size={14} className="mr-1" />Invalid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Monitoring Dashboard</h1>
              <p className="text-white/50 text-sm">FIFGO Campaign</p>
            </div>
            <Link href="/submit">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Plus size={18} className="mr-2" /> Submit Baru
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <Funnel size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Valid</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.valid}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <Clock size={24} className="text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Invalid</p>
                  <p className="text-3xl font-bold text-red-600">{stats.invalid}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100">
                  <XCircle size={24} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Valid Rate Bar */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-slate-900">Valid Rate</p>
              <p className="text-lg font-bold text-emerald-600">{validRate}%</p>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${validRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(['all', 'valid', 'pending', 'invalid'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                statusFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {filter === 'all' ? 'Semua' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                statusFilter === filter ? 'bg-white/20' : 'bg-slate-100'
              )}>
                {filter === 'all' ? stats.total :
                  filter === 'valid' ? stats.valid :
                  filter === 'pending' ? stats.pending : stats.invalid}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <Card className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Kode</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Sales</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">PIC</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden md:table-cell">Campaign</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Tanggal</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, index) => (
                  <tr
                    key={sub.id}
                    className={cn(
                      'border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer',
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    )}
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-blue-600">{sub.id}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{sub.sales}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sub.pic}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{sub.campaign}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sub.date}</td>
                    <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                    <td className="px-4 py-3">
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <Eye size={18} className="text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-slate-500">Tidak ada data</p>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={() => setSelectedSubmission(null)}>
          <Card className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detail Submission</h2>
                  <p className="text-slate-500 font-mono">{selectedSubmission.id}</p>
                </div>
                {getStatusBadge(selectedSubmission.status)}
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Sales</p>
                    <p className="font-medium text-slate-900">{selectedSubmission.sales}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">PIC</p>
                    <p className="font-medium text-slate-900">{selectedSubmission.pic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Campaign</p>
                    <p className="font-medium text-slate-900">{selectedSubmission.campaign}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tanggal</p>
                    <p className="font-medium text-slate-900">{selectedSubmission.date}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-3">Screenshots ({selectedSubmission.screenshots}/3)</p>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center',
                        i < selectedSubmission.screenshots
                          ? 'bg-slate-100 border-2 border-dashed border-slate-300'
                          : 'bg-slate-50 border-2 border-dashed border-slate-200 opacity-50'
                      )}
                    >
                      {i < selectedSubmission.screenshots ? (
                        <span className="text-xs text-slate-500">Screenshot {i + 1}</span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    <CheckCircle size={18} className="mr-2" /> Valid
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    <XCircle size={18} className="mr-2" /> Invalid
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
