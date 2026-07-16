'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Funnel, CheckCircle, XCircle, Clock, Warning, Eye,
  User, Calendar, Flag, Phone, Envelope, Camera, ArrowRight,
  ChartBar, Users, Shield, FileText, Plus
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock data with fraud detection
const mockSubmissions = [
  {
    id: 'ACT-ABC12345',
    sales: 'Ahmad Fauzi',
    pic: 'Budi Santoso',
    campaign: 'FIFGO Campaign',
    date: '2026-07-16',
    time: '10:30',
    status: 'valid',
    screenshots: 3,
    customer: { name: 'Dewi Lestari', phone: '081234567890', email: 'dewi@email.com' },
    device_fingerprint: 'android-samsung-a54',
    location: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
    fraud_flags: [],
    qc_notes: 'Valid submission'
  },
  {
    id: 'ACT-DEF67890',
    sales: 'Budi Santoso',
    pic: 'Ani Wijaya',
    campaign: 'FIFGO Campaign',
    date: '2026-07-16',
    time: '11:45',
    status: 'pending',
    screenshots: 3,
    customer: { name: 'Eko Prasetyo', phone: '081234567891', email: 'eko@email.com' },
    device_fingerprint: 'android-samsung-a54',
    location: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
    fraud_flags: ['SAME_DEVICE_DIFFERENT_CUSTOMER'],
    qc_notes: 'Pending review - same device as submission ACT-ABC12345'
  },
  {
    id: 'ACT-GHI11223',
    sales: 'Citra Dewi',
    pic: 'Budi Santoso',
    campaign: 'FIFGO Campaign',
    date: '2026-07-15',
    time: '09:15',
    status: 'invalid',
    screenshots: 2,
    customer: { name: 'Fajar Nugroho', phone: '081234567892', email: 'fajar@email.com' },
    device_fingerprint: 'ios-iphone14',
    location: { lat: -6.9175, lng: 107.6191, city: 'Bandung' },
    fraud_flags: ['SCREENSHOT_MISSING', 'INSUFFICIENT_EVIDENCE'],
    qc_notes: 'Missing rating screenshot'
  },
  {
    id: 'ACT-JKL44556',
    sales: 'Ahmad Fauzi',
    pic: 'Ani Wijaya',
    campaign: 'Rectoverso Promo',
    date: '2026-07-15',
    time: '14:20',
    status: 'valid',
    screenshots: 3,
    customer: { name: 'Gita Kumala', phone: '081234567893', email: 'gita@email.com' },
    device_fingerprint: 'android-xiaomi-redmi',
    location: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
    fraud_flags: [],
    qc_notes: 'Valid submission'
  },
  {
    id: 'ACT-MNO77889',
    sales: 'Eko Wijaya',
    pic: 'Dewi Lestari',
    campaign: 'FIFGO Campaign',
    date: '2026-07-14',
    time: '16:00',
    status: 'fraud',
    screenshots: 3,
    customer: { name: 'Hendra Gunawan', phone: '081234567894', email: 'hendra@email.com' },
    device_fingerprint: 'android-samsung-a54',
    location: { lat: -7.7956, lng: 110.3695, city: 'Yogyakarta' },
    fraud_flags: ['SAME_DEVICE_DIFFERENT_CUSTOMER', 'SAME_PHONE_PREFIX', 'GPS_SUSPICIOUS'],
    qc_notes: 'FLAGGED: Device used for 3 different customers in different cities. Phone prefix pattern suspicious.'
  },
  {
    id: 'ACT-PQR00112',
    sales: 'Fani Astuti',
    pic: 'Budi Santoso',
    campaign: 'FIFGO Campaign',
    date: '2026-07-14',
    time: '10:00',
    status: 'valid',
    screenshots: 3,
    customer: { name: 'Indah Permata', phone: '081234567895', email: 'indah@email.com' },
    device_fingerprint: 'ios-iphone13',
    location: { lat: -6.9175, lng: 107.6191, city: 'Bandung' },
    fraud_flags: [],
    qc_notes: 'Valid submission'
  },
  {
    id: 'ACT-STU33445',
    sales: 'Gunawan',
    pic: 'Ani Wijaya',
    campaign: 'Rectoverso Promo',
    date: '2026-07-13',
    time: '13:30',
    status: 'invalid',
    screenshots: 1,
    customer: { name: 'Joko Widodo', phone: '081234567896', email: 'joko@email.com' },
    device_fingerprint: 'android-oppo-reno',
    location: { lat: -7.1500, lng: 112.6500, city: 'Surabaya' },
    fraud_flags: ['SCREENSHOT_MISSING', 'RATING_NOT_5_STARS', 'DUPLICATE_LOCATION'],
    qc_notes: 'Rating only 3 stars, duplicate location pattern detected'
  },
];

// Stats per sales
const salesStats = [
  { name: 'Ahmad Fauzi', total: 25, valid: 23, invalid: 1, fraud: 1, pending: 0, rate: 92 },
  { name: 'Budi Santoso', total: 18, valid: 15, invalid: 2, fraud: 1, pending: 0, rate: 83 },
  { name: 'Citra Dewi', total: 22, valid: 18, invalid: 3, fraud: 0, pending: 1, rate: 82 },
  { name: 'Dian Pratama', total: 30, valid: 28, invalid: 1, fraud: 1, pending: 0, rate: 93 },
  { name: 'Eko Wijaya', total: 15, valid: 10, invalid: 3, fraud: 2, pending: 0, rate: 67 },
  { name: 'Fani Astuti', total: 20, valid: 19, invalid: 1, fraud: 0, pending: 0, rate: 95 },
  { name: 'Gunawan', total: 12, valid: 8, invalid: 3, fraud: 1, pending: 0, rate: 67 },
];

type StatusFilter = 'all' | 'valid' | 'pending' | 'invalid' | 'fraud';

interface Submission {
  id: string;
  submission_code: string;
  sales_name: string;
  pic_name: string;
  campaign_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  created_at: string;
  device_info: string;
  gps_lat: number;
  gps_lng: number;
  screenshot_download: boolean;
  screenshot_register: boolean;
  screenshot_rating: boolean;
  fraud_flags: string[];
  qc_notes: string;
}

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [salesFilter, setSalesFilter] = React.useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);
  const [view, setView] = React.useState<'submissions' | 'sales'>('submissions');
  const [isLoading, setIsLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);

  // Fetch from API
  React.useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const response = await fetch(`/api/submissions?${params}`);
        const result = await response.json();

        if (result.data) {
          // Transform API data to match UI
          const transformed = result.data.map((item: any) => ({
            ...item,
            id: item.submission_code,
            customer_phone_masked: item.customer_phone_masked,
            fraud_flags: item.fraud_flags || [],
            qc_notes: item.qc_notes || 'Pending review',
          }));
          setSubmissions(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
        // Fallback to mock data
        setSubmissions(mockSubmissions as any);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [statusFilter]);

  const filteredSubmissions = submissions.filter(
    sub => (statusFilter === 'all' || sub.status === statusFilter) &&
           (salesFilter === 'all' || sub.sales_name === salesFilter)
  );

  const stats = {
    total: submissions.length,
    valid: submissions.filter(s => s.status === 'valid').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    invalid: submissions.filter(s => s.status === 'invalid').length,
    fraud: submissions.filter(s => s.status === 'fraud').length,
  };

  const validRate = stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0;
  const fraudRate = stats.total > 0 ? ((stats.fraud / stats.total) * 100).toFixed(1) : '0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle size={14} weight="fill" className="mr-1" />Valid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700"><Clock size={14} weight="fill" className="mr-1" />Pending</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-700"><XCircle size={14} weight="fill" className="mr-1" />Invalid</Badge>;
      case 'fraud':
        return <Badge className="bg-rose-200 text-rose-800"><Shield size={14} weight="fill" className="mr-1" />Fraud</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12">
                <Image
                  src="/Logo Rectoverso.png"
                  alt="RECTOVERSO"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Monitoring & QC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/submit">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" /> New Submission
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">
                  <Shield size={18} className="mr-2" /> Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle size={20} weight="fill" className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.valid}</p>
                  <p className="text-xs text-slate-500">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock size={20} weight="fill" className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle size={20} weight="fill" className="text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
                  <p className="text-xs text-slate-500">Invalid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-200">
                  <Shield size={20} weight="fill" className="text-rose-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-700">{stats.fraud}</p>
                  <p className="text-xs text-slate-500">Fraud</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <ChartBar size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{validRate}%</p>
                  <p className="text-xs text-white/80">Valid Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setView('submissions')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                view === 'submissions' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              Submissions
            </button>
            <button
              onClick={() => setView('sales')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                view === 'sales' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              Per Sales
            </button>
          </div>
        </div>

        {view === 'submissions' ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Funnel size={18} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'valid', 'pending', 'invalid', 'fraud'] as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                      statusFilter === filter
                        ? filter === 'valid' ? 'bg-emerald-500 text-white' :
                          filter === 'pending' ? 'bg-amber-500 text-white' :
                          filter === 'invalid' ? 'bg-red-500 text-white' :
                          filter === 'fraud' ? 'bg-rose-600 text-white' :
                          'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {filter === 'all' ? 'Semua' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <select
                value={salesFilter}
                onChange={(e) => setSalesFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="all">Semua Sales</option>
                {salesStats.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Submissions Table */}
            <Card className="bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">QC</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          Tidak ada submission
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub, index) => (
                        <tr
                          key={sub.submission_code}
                          className={cn(
                            'border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer',
                            (sub.fraud_flags?.length ?? 0) > 0 && 'bg-rose-50/50'
                          )}
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-blue-600">{sub.submission_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <User size={14} className="text-slate-500" />
                              </div>
                              <span className="text-sm font-medium text-slate-900">{sub.sales_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{sub.customer_name}</p>
                              <p className="text-xs text-slate-500">{sub.customer_phone_masked || sub.customer_phone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{sub.campaign_name}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-slate-900">{sub.created_at?.split('T')[0] || '-'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                          <td className="px-4 py-3">
                            {(sub.fraud_flags?.length ?? 0) > 0 ? (
                              <div className="flex items-center gap-1">
                                <Warning size={16} className="text-rose-500" />
                                <span className="text-xs text-rose-600 font-medium">{sub.fraud_flags.length} flags</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                              <Eye size={18} className="text-slate-500" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          /* Per Sales View */
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Valid</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Invalid</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Fraud</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Pending</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Rate</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {salesStats.map((sales, index) => (
                    <tr
                      key={sales.name}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSalesFilter(sales.name)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {sales.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{sales.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-slate-900">{sales.total}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-emerald-600">{sales.valid}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-red-600">{sales.invalid}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'text-sm font-semibold',
                          sales.fraud > 0 ? 'text-rose-600' : 'text-slate-400'
                        )}>
                          {sales.fraud}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-amber-600">{sales.pending}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'text-sm font-bold px-2 py-1 rounded-full',
                          sales.rate >= 90 ? 'bg-emerald-100 text-emerald-700' :
                          sales.rate >= 80 ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        )}>
                          {sales.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all',
                              sales.rate >= 90 ? 'bg-emerald-500' :
                              sales.rate >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                            )}
                            style={{ width: `${sales.rate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <Card
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detail Submission</h2>
                  <p className="text-slate-500 font-mono">{selectedSubmission.submission_code}</p>
                </div>
                {getStatusBadge(selectedSubmission.status)}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 mb-1">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedSubmission.customer_name}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                    <Phone size={14} /> {selectedSubmission.customer_phone_masked || selectedSubmission.customer_phone}
                  </p>
                  {selectedSubmission.customer_email && (
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Envelope size={14} /> {selectedSubmission.customer_email}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 mb-1">Sales Info</p>
                  <p className="font-semibold text-slate-900">{selectedSubmission.sales_name}</p>
                  <p className="text-sm text-slate-600">PIC: {selectedSubmission.pic_name}</p>
                  <p className="text-sm text-slate-600">Campaign: {selectedSubmission.campaign_name}</p>
                </div>
              </div>

              {/* Device & Location */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-2">Device Fingerprint</p>
                  <p className="text-sm font-mono text-slate-700">{selectedSubmission.device_info || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 font-semibold mb-2">Location</p>
                  <p className="text-sm text-slate-700">
                    {selectedSubmission.gps_lat && selectedSubmission.gps_lng
                      ? `${selectedSubmission.gps_lat.toFixed(4)}, ${selectedSubmission.gps_lng.toFixed(4)}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Fraud Flags */}
              {(selectedSubmission.fraud_flags?.length ?? 0) > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
                    <Shield size={18} weight="fill" /> Fraud Detection Flags
                  </p>
                  <div className="space-y-2">
                    {selectedSubmission.fraud_flags.map((flag: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <Warning size={18} className="text-rose-600 mt-0.5" />
                        <p className="text-sm font-semibold text-rose-800">
                          {flag.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Screenshots ({[
                    selectedSubmission.screenshot_download,
                    selectedSubmission.screenshot_register,
                    selectedSubmission.screenshot_rating
                  ].filter(Boolean).length}/3)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className={cn(
                    'aspect-square rounded-xl flex items-center justify-center',
                    selectedSubmission.screenshot_download
                      ? 'bg-emerald-100 border-2 border-emerald-300'
                      : 'bg-slate-50 border-2 border-dashed border-slate-200 opacity-50'
                  )}>
                    {selectedSubmission.screenshot_download ? (
                      <CheckCircle size={24} className="text-emerald-500" />
                    ) : (
                      <span className="text-xs text-slate-400">Missing</span>
                    )}
                  </div>
                  <div className={cn(
                    'aspect-square rounded-xl flex items-center justify-center',
                    selectedSubmission.screenshot_register
                      ? 'bg-emerald-100 border-2 border-emerald-300'
                      : 'bg-slate-50 border-2 border-dashed border-slate-200 opacity-50'
                  )}>
                    {selectedSubmission.screenshot_register ? (
                      <CheckCircle size={24} className="text-emerald-500" />
                    ) : (
                      <span className="text-xs text-slate-400">Missing</span>
                    )}
                  </div>
                  <div className={cn(
                    'aspect-square rounded-xl flex items-center justify-center',
                    selectedSubmission.screenshot_rating
                      ? 'bg-emerald-100 border-2 border-emerald-300'
                      : 'bg-slate-50 border-2 border-dashed border-slate-200 opacity-50'
                  )}>
                    {selectedSubmission.screenshot_rating ? (
                      <CheckCircle size={24} className="text-emerald-500" />
                    ) : (
                      <span className="text-xs text-slate-400">Missing</span>
                    )}
                  </div>
                </div>
              </div>

              {/* QC Notes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-1">QC Notes</p>
                <p className="text-sm text-slate-700">{selectedSubmission.qc_notes || 'Pending review'}</p>
              </div>

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  >
                    <CheckCircle size={18} className="mr-2" /> Approve Valid
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <XCircle size={18} className="mr-2" /> Reject Invalid
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
