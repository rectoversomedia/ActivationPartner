'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Funnel, CheckCircle, XCircle, Clock, Warning, Eye, User,
  Flag, Phone, Envelope, Camera, ChartBar, Users, Shield, FileText,
  Plus, ShieldCheck, WarningCircle, ShieldSlash, Question, MagnifyingGlass,
  Download, Trash, Pencil, ChatText, X, Filter, RefreshCw, FileArrowDown,
  TrendUp, TrendDown, Activity, Fingerprint, Robot, MapPin, WifiHigh, DeviceMobile
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Types
type StatusFilter = 'all' | 'valid' | 'pending' | 'invalid' | 'fraud';

interface FraudFlag {
  flag: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  score: number;
  metadata?: Record<string, any>;
}

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
  ip_address: string;
  fraud_flags: string;
  fraud_score: number;
  fraud_decision: string;
  fraud_reasons: string;
  fraud_remarks: string;
  qc_notes: string;
}

// Fraud category icons and colors
const FRAUD_CATEGORIES = {
  evidence: { icon: Camera, color: 'blue', label: 'Evidence' },
  location: { icon: MapPin, color: 'purple', label: 'Location' },
  behavior: { icon: Robot, color: 'amber', label: 'Behavior' },
  device: { icon: DeviceMobile, color: 'rose', label: 'Device/IP' },
  velocity: { icon: Activity, color: 'cyan', label: 'Velocity' },
};

// Parse fraud flags from JSON
const parseFraudFlags = (flagsJson: string | FraudFlag[]): FraudFlag[] => {
  if (Array.isArray(flagsJson)) return flagsJson;
  if (!flagsJson) return [];
  try {
    return JSON.parse(flagsJson);
  } catch {
    return [];
  }
};

// Get fraud decision badge
const getFraudDecisionBadge = (decision: string) => {
  switch (decision) {
    case 'allow':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><ShieldCheck size={14} weight="fill" className="mr-1" />Clean</Badge>;
    case 'review':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Question size={14} weight="fill" className="mr-1" />Review</Badge>;
    case 'flag':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><WarningCircle size={14} weight="fill" className="mr-1" />Flag</Badge>;
    case 'block':
      return <Badge className="bg-red-100 text-red-700 border-red-200"><ShieldSlash size={14} weight="fill" className="mr-1" />Blocked</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-600 border-slate-200">-</Badge>;
  }
};

// Get risk level styles
const getRiskStyles = (score: number) => {
  if (score >= 75) return { color: 'text-red-600', bg: 'bg-red-500', label: 'Critical', border: 'border-red-500' };
  if (score >= 50) return { color: 'text-orange-600', bg: 'bg-orange-500', label: 'High', border: 'border-orange-500' };
  if (score >= 25) return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Medium', border: 'border-amber-500' };
  return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Low', border: 'border-emerald-500' };
};

// Get severity badge
const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Critical</Badge>;
    case 'high':
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">High</Badge>;
    case 'medium':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Medium</Badge>;
    case 'low':
      return <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">Low</Badge>;
    default:
      return null;
  }
};

// Export to CSV
const exportToCSV = (submissions: Submission[], filename: string = 'submissions') => {
  const headers = [
    'Kode', 'Sales', 'PIC', 'Campaign', 'Customer', 'Phone', 'Email',
    'Status', 'Fraud Score', 'Fraud Decision', 'Fraud Flags', 'Remarks',
    'Device', 'IP', 'GPS', 'Created'
  ];

  const rows = submissions.map(sub => [
    sub.submission_code,
    sub.sales_name,
    sub.pic_name,
    sub.campaign_name,
    sub.customer_name,
    sub.customer_phone,
    sub.customer_email || '',
    sub.status,
    sub.fraud_score || 0,
    sub.fraud_decision || '',
    parseFraudFlags(sub.fraud_flags).map(f => `${f.flag}: ${f.reason}`).join(' | '),
    sub.fraud_remarks || '',
    sub.device_info || '',
    sub.ip_address || '',
    sub.gps_lat && sub.gps_lng ? `${sub.gps_lat}, ${sub.gps_lng}` : '',
    sub.created_at
  ]);

  const csvContent = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [fraudFilter, setFraudFilter] = React.useState<string>('all');
  const [salesFilter, setSalesFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);
  const [view, setView] = React.useState<'submissions' | 'sales' | 'fraud'>('submissions');
  const [isLoading, setIsLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [salesStats, setSalesStats] = React.useState<{name: string; total: number; valid: number; invalid: number; fraud: number; pending: number; rate: number}[]>([]);

  // Fraud review modal
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [reviewSubmission, setReviewSubmission] = React.useState<Submission | null>(null);
  const [reviewRemarks, setReviewRemarks] = React.useState('');
  const [isSavingReview, setIsSavingReview] = React.useState(false);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submissions?limit=1000');
      const result = await response.json();

      if (result.data) {
        setSubmissions(result.data);

        // Calculate per-sales stats
        const salesMap = new Map<string, {total: number; valid: number; invalid: number; fraud: number; pending: number}>();
        result.data.forEach((sub: Submission) => {
          const salesName = sub.sales_name || 'Unknown';
          const current = salesMap.get(salesName) || {total: 0, valid: 0, invalid: 0, fraud: 0, pending: 0};
          current.total++;
          if (sub.status === 'valid') current.valid++;
          else if (sub.status === 'invalid') current.invalid++;
          else if (sub.status === 'fraud') current.fraud++;
          else if (sub.status === 'pending') current.pending++;
          salesMap.set(salesName, current);
        });

        const stats = Array.from(salesMap.entries()).map(([name, data]) => ({
          name,
          total: data.total,
          valid: data.valid,
          invalid: data.invalid,
          fraud: data.fraud,
          pending: data.pending,
          rate: data.total > 0 ? Math.round((data.valid / data.total) * 100) : 0
        })).sort((a, b) => b.total - a.total);

        setSalesStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filters
  const filteredSubmissions = submissions.filter(
    sub => (statusFilter === 'all' || sub.status === statusFilter) &&
           (fraudFilter === 'all' || sub.fraud_decision === fraudFilter) &&
           (salesFilter === 'all' || sub.sales_name === salesFilter) &&
           (!searchQuery ||
            sub.submission_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.sales_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Stats
  const stats = {
    total: submissions.length,
    valid: submissions.filter(s => s.status === 'valid').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    invalid: submissions.filter(s => s.status === 'invalid').length,
    fraud: submissions.filter(s => s.status === 'fraud').length,
    fraudScoreAvg: submissions.length > 0
      ? Math.round(submissions.reduce((acc, s) => acc + (s.fraud_score || 0), 0) / submissions.length)
      : 0,
    fraudReview: submissions.filter(s => s.fraud_decision === 'review').length,
    fraudFlag: submissions.filter(s => s.fraud_decision === 'flag').length,
    fraudBlock: submissions.filter(s => s.fraud_decision === 'block').length,
  };

  const validRate = stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0;

  // Open review modal
  const openReviewModal = (sub: Submission, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewSubmission(sub);
    setReviewRemarks(sub.fraud_remarks || '');
    setShowReviewModal(true);
  };

  // Save review
  const saveReview = async () => {
    if (!reviewSubmission) return;
    setIsSavingReview(true);
    try {
      const res = await fetch(`/api/submissions/${reviewSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fraud_remarks: reviewRemarks }),
      });
      if (res.ok) {
        await fetchData();
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error('Failed to save review:', error);
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-32 sm:w-40">
                <Image src="/Logo Rectoverso.png" alt="RECTOVERSO" width={160} height={64} className="w-full h-auto" priority />
              </div>
              <div className="hidden sm:block pl-4 border-l border-slate-200">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-xs text-slate-500">Monitoring & QC System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => fetchData()} className="border-slate-300">
                <RefreshCw size={16} className="mr-2" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredSubmissions)} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <FileArrowDown size={16} className="mr-2" /> Export CSV
              </Button>
              <Link href="/submit">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                  <Plus size={18} className="mr-2" /> New Submission
                </Button>
              </Link>
              <Link href="/superadmin">
                <Button variant="outline" className="border-2 border-slate-300 hover:border-slate-400">
                  <Shield size={18} className="mr-2" /> Super Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total */}
          <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valid */}
          <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.valid}</p>
                  <p className="text-xs text-slate-500">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
                  <Clock size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invalid */}
          <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-red-500/5 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
                  <XCircle size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
                  <p className="text-xs text-slate-500">Invalid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fraud */}
          <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:shadow-rose-500/5 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30">
                  <Shield size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-600">{stats.fraud}</p>
                  <p className="text-xs text-slate-500">Fraud</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valid Rate */}
          <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/25">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{validRate}%</p>
                  <p className="text-xs text-white/70">Valid Rate</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <ChartBar size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700 shadow-lg shadow-white/50" style={{ width: `${validRate}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fraud Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/30">
                  <ShieldCheck size={20} weight="fill" className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.fraudScoreAvg}</p>
                  <p className="text-xs text-slate-300">Avg Fraud Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-sm border border-amber-500/30">
                  <Warning size={20} weight="fill" className="text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.fraudReview + stats.fraudFlag}</p>
                  <p className="text-xs text-slate-300">Need Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white shadow-xl col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30">
                  <ShieldSlash size={20} weight="fill" className="text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.fraudBlock}</p>
                  <p className="text-xs text-slate-300">Auto Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm">
            <button onClick={() => setView('submissions')} className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm',
              view === 'submissions' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30' : 'text-slate-600 hover:bg-slate-50'
            )}>
              <FileText size={16} /> Submissions
            </button>
            <button onClick={() => setView('sales')} className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm',
              view === 'sales' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/30' : 'text-slate-600 hover:bg-slate-50'
            )}>
              <Users size={16} /> Per Sales
            </button>
            <button onClick={() => setView('fraud')} className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm',
              view === 'fraud' ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-rose-500/30' : 'text-slate-600 hover:bg-slate-50'
            )}>
              <Shield size={16} /> Fraud
              {(stats.fraudReview + stats.fraudFlag) > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-rose-200 text-rose-700 animate-pulse">
                  {stats.fraudReview + stats.fraudFlag}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, customer, sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Filter size={16} /> Filter:
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'valid', 'pending', 'invalid', 'fraud'] as StatusFilter[]).map((filter) => (
                  <button key={filter} onClick={() => setStatusFilter(filter)} className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm',
                    statusFilter === filter
                      ? filter === 'valid' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30' :
                        filter === 'pending' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30' :
                        filter === 'invalid' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30' :
                        filter === 'fraud' ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-rose-500/30' :
                        'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}>
                    {filter === 'all' ? 'Semua' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Fraud Decision Filter */}
              <select
                value={fraudFilter}
                onChange={(e) => setFraudFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              >
                <option value="all">Semua Decision</option>
                <option value="allow">Clean</option>
                <option value="review">Review</option>
                <option value="flag">Flag</option>
                <option value="block">Blocked</option>
              </select>

              <select
                value={salesFilter}
                onChange={(e) => setSalesFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              >
                <option value="all">Semua Sales</option>
                {salesStats.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>

              <div className="ml-auto text-sm text-slate-500">
                {filteredSubmissions.length} of {submissions.length} submissions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        {view === 'submissions' && (
          <Card className="bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Kode</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Sales</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Customer</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Fraud</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider hidden xl:table-cell">Decision</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider w-32">Flags</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-500 font-medium">Loading submissions...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                            <FileText size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-semibold text-lg">Tidak ada submission</p>
                          <p className="text-sm text-slate-400">Submission akan muncul di sini setelah ada data</p>
                          <Link href="/submit">
                            <Button size="sm" className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              <Plus size={16} className="mr-1" /> Buat Submission Baru
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubmissions.map((sub) => {
                    const fraudScore = sub.fraud_score || 0;
                    const riskStyles = getRiskStyles(fraudScore);
                    const flags = parseFraudFlags(sub.fraud_flags);
                    const isFlagged = sub.fraud_decision !== 'allow' && sub.fraud_decision !== null;

                    return (
                      <tr
                        key={sub.submission_code}
                        onClick={() => setSelectedSubmission(sub)}
                        className={cn(
                          'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 cursor-pointer',
                          sub.fraud_decision === 'block' && 'bg-red-50/30' ||
                          sub.fraud_decision === 'flag' && 'bg-amber-50/30' ||
                          sub.fraud_decision === 'review' && 'bg-blue-50/30'
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-2.5 py-1 rounded-lg border border-blue-200/50 shadow-sm">
                            {sub.submission_code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                              {sub.sales_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm font-semibold text-slate-900 hidden sm:block">{sub.sales_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <p className="text-sm font-semibold text-slate-900">{sub.customer_name}</p>
                          <p className="text-xs text-slate-500">{sub.customer_phone}</p>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <p className="text-sm text-slate-700">{new Date(sub.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-xs text-slate-400">{new Date(sub.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.status === 'valid' && <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm"><CheckCircle size={12} className="mr-1" />Valid</Badge>}
                          {sub.status === 'pending' && <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"><Clock size={12} className="mr-1" />Pending</Badge>}
                          {sub.status === 'invalid' && <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"><XCircle size={12} className="mr-1" />Invalid</Badge>}
                          {sub.status === 'fraud' && <Badge className="bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-sm"><Shield size={12} className="mr-1" />Fraud</Badge>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-2.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                              <div className={cn('h-full rounded-full transition-all duration-500 shadow-sm', riskStyles.bg)} style={{ width: `${fraudScore}%` }} />
                            </div>
                            <span className={cn('text-sm font-bold w-8', riskStyles.color)}>{fraudScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          {getFraudDecisionBadge(sub.fraud_decision || 'allow')}
                        </td>
                        <td className="px-4 py-3.5">
                          {flags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {flags.slice(0, 2).map((flag, i) => {
                                const cat = FRAUD_CATEGORIES[flag.category as keyof typeof FRAUD_CATEGORIES];
                                const Icon = cat?.icon || Warning;
                                return (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                    <Icon size={10} />
                                    {flag.flag.substring(0, 12)}
                                  </span>
                                );
                              })}
                              {flags.length > 2 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                  +{flags.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" title="View Detail">
                              <Eye size={18} />
                            </button>
                            {isFlagged && (
                              <button
                                onClick={(e) => openReviewModal(sub, e)}
                                className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600"
                                title="Add Remarks"
                              >
                                <ChatText size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Per Sales Table */}
        {view === 'sales' && (
          <Card className="bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Sales</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Total</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Valid</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Invalid</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Fraud</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Rate</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-600 uppercase">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesStats.map((sales) => (
                    <tr
                      key={sales.name}
                      onClick={() => setSalesFilter(sales.name)}
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 cursor-pointer transition-all"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {sales.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-900">{sales.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900">{sales.total}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{sales.valid}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-red-600">{sales.invalid}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('font-bold', sales.fraud > 0 ? 'text-rose-600' : 'text-slate-400')}>
                          {sales.fraud}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm',
                          sales.rate >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                          sales.rate >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                          sales.rate >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
                          'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        )}>
                          {sales.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-32 shadow-inner">
                          <div className={cn(
                            'h-2.5 rounded-full transition-all shadow-sm',
                            sales.rate >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                            sales.rate >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            sales.rate >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                            'bg-gradient-to-r from-red-500 to-red-600'
                          )} style={{ width: `${Math.max(sales.rate, 10)}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Fraud System View */}
        {view === 'fraud' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 bg-gradient-to-r from-rose-500/10 to-orange-500/10">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 backdrop-blur-sm border border-rose-500/30">
                    <Shield size={32} weight="fill" className="text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Fraud Detection System v2</h2>
                    <p className="text-slate-300">AI-powered detection with behavioral analysis & device fingerprinting</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Robot, title: 'Bot Detection', desc: 'Typing patterns, time-on-page, mouse movements', color: 'from-emerald-500', colorBg: 'bg-emerald-500/20' },
                  { icon: DeviceMobile, title: 'Device Farm', desc: 'One device, multiple different customer accounts', color: 'from-blue-500', colorBg: 'bg-blue-500/20' },
                  { icon: Fingerprint, title: 'Fingerprinting', desc: 'Canvas, WebGL, screen & audio fingerprinting', color: 'from-purple-500', colorBg: 'bg-purple-500/20' },
                  { icon: MapPin, title: 'Location Clustering', desc: 'GPS clustering to detect suspicious patterns', color: 'from-amber-500', colorBg: 'bg-amber-500/20' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                      <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br mb-3 flex items-center justify-center', item.color, item.colorBg)}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 border-t border-white/10 bg-black/20">
                <h3 className="font-bold text-white mb-4">Fraud Score Breakdown</h3>
                <div className="space-y-2">
                  {[
                    { range: '0-24', label: 'Low Risk', color: 'from-emerald-500', decision: 'Auto Allow', desc: 'Submission passed all checks' },
                    { range: '25-49', label: 'Medium Risk', color: 'from-amber-500', decision: 'Manual Review', desc: 'Needs QC team verification' },
                    { range: '50-74', label: 'High Risk', color: 'from-orange-500', decision: 'Flag for QC', desc: 'Flagged for quality control' },
                    { range: '75-100', label: 'Critical', color: 'from-red-500', decision: 'Auto Block', desc: 'Automatically blocked' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs', item.color)}>
                          {item.range.split('-')[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <span className={cn('px-3 py-1 rounded-lg text-xs font-bold', item.color.replace('from-', 'bg-') + '/20 text-' + item.color.split('-')[1] + '-300')}>
                        {item.decision}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSubmission(null)}>
          <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submission Detail</h2>
                  <p className="text-slate-500 font-mono">{selectedSubmission.submission_code}</p>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Fraud Score */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mb-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield size={20} className="text-blue-400" />
                    <span className="font-semibold">Fraud Detection</span>
                  </div>
                  {getFraudDecisionBadge(selectedSubmission.fraud_decision || 'allow')}
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-300">Fraud Score</span>
                      <span className={cn('font-bold text-lg', getRiskStyles(selectedSubmission.fraud_score || 0).color.replace('text-', 'text-'))}>
                        {selectedSubmission.fraud_score || 0}/100
                      </span>
                    </div>
                    <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
                      <div className={cn('h-full rounded-full transition-all shadow-lg', getRiskStyles(selectedSubmission.fraud_score || 0).bg)}
                        style={{ width: `${selectedSubmission.fraud_score || 0}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{getRiskStyles(selectedSubmission.fraud_score || 0).label} Risk</p>
                  </div>
                </div>

                {/* Fraud Flags with explanations */}
                {(() => {
                  const flags = parseFraudFlags(selectedSubmission.fraud_flags);
                  return flags.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-slate-300 mb-3 font-semibold">Detection Indicators:</p>
                      <div className="space-y-2">
                        {flags.map((flag, i) => {
                          const cat = FRAUD_CATEGORIES[flag.category as keyof typeof FRAUD_CATEGORIES];
                          const Icon = cat?.icon || Warning;
                          return (
                            <div key={i} className={cn(
                              'p-3 rounded-xl backdrop-blur-sm',
                              flag.severity === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                              flag.severity === 'high' ? 'bg-orange-500/20 border border-orange-500/30' :
                              flag.severity === 'medium' ? 'bg-amber-500/20 border border-amber-500/30' :
                              'bg-slate-500/20 border border-slate-500/30'
                            )}>
                              <div className="flex items-start gap-2">
                                <Icon size={16} className="text-white/70 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-sm">{flag.flag.replace(/_/g, ' ')}</span>
                                    {getSeverityBadge(flag.severity)}
                                  </div>
                                  <p className="text-xs text-white/70">{flag.reason}</p>
                                  {flag.metadata && Object.keys(flag.metadata).length > 0 && (
                                    <p className="text-xs text-white/50 mt-1">
                                      {Object.entries(flag.metadata).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-emerald-400">
                      <ShieldCheck size={20} />
                      <span className="text-sm">No fraud indicators detected</span>
                    </div>
                  );
                })()}

                {/* QC Remarks */}
                {selectedSubmission.fraud_remarks && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-slate-300 mb-2 font-semibold">QC Remarks (Proof to Sales):</p>
                    <p className="text-sm text-white/80 bg-white/10 p-3 rounded-lg">{selectedSubmission.fraud_remarks}</p>
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-2">Customer</p>
                  <p className="font-bold text-slate-900">{selectedSubmission.customer_name}</p>
                  <p className="text-sm text-slate-600">{selectedSubmission.customer_phone}</p>
                  {selectedSubmission.customer_email && (
                    <p className="text-xs text-slate-500">{selectedSubmission.customer_email}</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-semibold mb-2">Sales Team</p>
                  <p className="font-bold text-slate-900">{selectedSubmission.sales_name}</p>
                  <p className="text-sm text-slate-600">PIC: {selectedSubmission.pic_name}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Device</p>
                  <p className="text-sm text-slate-700">{selectedSubmission.device_info || 'N/A'}</p>
                  <p className="text-xs text-slate-400 mt-1">IP: {selectedSubmission.ip_address || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Location</p>
                  <p className="text-sm text-slate-700">
                    {selectedSubmission.gps_lat && selectedSubmission.gps_lng
                      ? `${selectedSubmission.gps_lat.toFixed(6)}, ${selectedSubmission.gps_lng.toFixed(6)}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <span>Created: {new Date(selectedSubmission.created_at).toLocaleString('id-ID')}</span>
                <span>Campaign: {selectedSubmission.campaign_name}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fraud Review Modal */}
      {showReviewModal && reviewSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
          <Card className="bg-white w-full max-w-lg shadow-2xl rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Fraud Review & Remarks</h2>
                  <p className="text-sm text-slate-500 font-mono">{reviewSubmission.submission_code}</p>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Fraud Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  {getFraudDecisionBadge(reviewSubmission.fraud_decision || 'allow')}
                  <span className="font-bold text-lg">{reviewSubmission.fraud_score || 0}/100</span>
                </div>
                {(() => {
                  const flags = parseFraudFlags(reviewSubmission.fraud_flags);
                  return flags.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-semibold">Indicators:</p>
                      {flags.map((flag, i) => (
                        <p key={i} className="text-sm text-slate-700">• {flag.reason}</p>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Remarks Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  QC Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter remarks/proof for the sales team (e.g., 'Duplicate phone number detected with submission ACT-XXXXX')"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">This will be visible to the sales team as proof/justification</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={saveReview}
                  isLoading={isSavingReview}
                  disabled={!reviewRemarks.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <ChatText size={18} className="mr-2" /> Save Remarks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
