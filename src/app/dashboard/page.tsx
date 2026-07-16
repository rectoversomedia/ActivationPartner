'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Funnel, CheckCircle, XCircle, Clock, Warning, Eye,
  User, Calendar, Flag, Phone, Envelope, Camera, ArrowRight,
  ChartBar, Users, Shield, FileText, Plus, ShieldCheck,
  ShieldAlert, ShieldSlash, Question
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Real data with fraud detection

type StatusFilter = 'all' | 'valid' | 'pending' | 'invalid' | 'fraud';
type FraudFilter = 'all' | 'allow' | 'review' | 'flag' | 'block';

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
  fraud_flags: string;
  fraud_score: number;
  fraud_decision: string;
  fraud_reasons: string;
  qc_notes: string;
}

// Parse fraud flags from JSON string
const parseFraudFlags = (flagsJson: string | string[]): { flag: string; reason: string; severity: string }[] => {
  if (Array.isArray(flagsJson)) return flagsJson as any;
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
      return <Badge className="bg-emerald-100 text-emerald-700"><ShieldCheck size={14} weight="fill" className="mr-1" />Allow</Badge>;
    case 'review':
      return <Badge className="bg-blue-100 text-blue-700"><Question size={14} weight="fill" className="mr-1" />Review</Badge>;
    case 'flag':
      return <Badge className="bg-amber-100 text-amber-700"><ShieldAlert size={14} weight="fill" className="mr-1" />Flag</Badge>;
    case 'block':
      return <Badge className="bg-red-100 text-red-700"><ShieldSlash size={14} weight="fill" className="mr-1" />Block</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-600">-</Badge>;
  }
};

// Get risk level color
const getRiskColor = (score: number) => {
  if (score >= 75) return 'text-red-600';
  if (score >= 50) return 'text-orange-600';
  if (score >= 25) return 'text-amber-600';
  return 'text-emerald-600';
};

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [fraudFilter, setFraudFilter] = React.useState<FraudFilter>('all');
  const [salesFilter, setSalesFilter] = React.useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);
  const [view, setView] = React.useState<'submissions' | 'sales' | 'fraud'>('submissions');
  const [isLoading, setIsLoading] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [salesStats, setSalesStats] = React.useState<{name: string; total: number; valid: number; invalid: number; fraud: number; pending: number; rate: number}[]>([]);

  // Fetch from API
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all submissions (no pagination for stats)
        const response = await fetch('/api/submissions?limit=1000');
        const result = await response.json();

        if (result.data) {
          setSubmissions(result.data);

          // Calculate real sales stats from API data
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

          // Convert to array with rate calculation
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
    };

    fetchData();
  }, [statusFilter]);

  const filteredSubmissions = submissions.filter(
    sub => (statusFilter === 'all' || sub.status === statusFilter) &&
           (fraudFilter === 'all' || sub.fraud_decision === fraudFilter) &&
           (salesFilter === 'all' || sub.sales_name === salesFilter)
  );

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
    <div className="min-h-screen bg-slate-100">
      {/* Header - Clean with centered logo */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Logo & Title - Centered */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-[200px] h-auto mb-4">
              <Image
                src="/Logo Rectoverso.png"
                alt="RECTOVERSO"
                width={200}
                height={80}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Monitoring & QC</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Link href="/submit">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus size={18} className="mr-2" /> New Submission
              </Button>
            </Link>
            <Link href="/superadmin">
              <Button variant="outline">
                <Shield size={18} className="mr-2" /> Super Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ShieldCheck size={20} weight="fill" className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.fraudScoreAvg}</p>
                  <p className="text-xs text-slate-500">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Warning size={20} weight="fill" className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.fraudReview + stats.fraudFlag}</p>
                  <p className="text-xs text-slate-500">Review/Flag</p>
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
            <button
              onClick={() => setView('fraud')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1',
                view === 'fraud' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Shield size={16} /> Fraud
              {(stats.fraudReview + stats.fraudFlag) > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-rose-200 text-rose-700">
                  {stats.fraudReview + stats.fraudFlag}
                </span>
              )}
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fraud Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision</th>
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
                    ) : filteredSubmissions.map((sub) => {
                        const fraudFlags = parseFraudFlags(sub.fraud_flags);
                        const fraudScore = sub.fraud_score || 0;
                        return (
                          <tr
                            key={sub.submission_code}
                            className={cn(
                              'border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer',
                              sub.fraud_decision === 'block' && 'bg-red-50' ||
                              sub.fraud_decision === 'flag' && 'bg-amber-50' ||
                              sub.fraud_decision === 'review' && 'bg-blue-50' ||
                              fraudFlags.length > 0 && 'bg-rose-50/30'
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
                              <p className="text-xs text-slate-500">{sub.customer_phone}</p>
                            </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm text-slate-900">{sub.created_at?.split('T')[0] || '-'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  'w-10 h-6 rounded-full relative overflow-hidden',
                                  fraudScore >= 75 ? 'bg-red-200' :
                                  fraudScore >= 50 ? 'bg-orange-200' :
                                  fraudScore >= 25 ? 'bg-amber-200' :
                                  'bg-emerald-100'
                                )}>
                                  <div className={cn(
                                    'absolute inset-y-0 left-0 bg-red-500',
                                    fraudScore >= 75 ? 'w-full' :
                                    fraudScore >= 50 ? 'w-3/4' :
                                    fraudScore >= 25 ? 'w-1/2' :
                                    'w-1/4'
                                  )} />
                                </div>
                                <span className={cn('text-sm font-semibold', getRiskColor(fraudScore))}>
                                  {fraudScore}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getFraudDecisionBadge(sub.fraud_decision || 'allow')}
                            </td>
                            <td className="px-4 py-3">
                              <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                <Eye size={18} className="text-slate-500" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
              {parseFraudFlags(selectedSubmission.fraud_flags).length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
                    <Shield size={18} weight="fill" /> Alasan Flag
                  </p>
                  <div className="space-y-2">
                    {parseFraudFlags(selectedSubmission.fraud_flags).map((flag: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <span className={cn(
                          'w-3 h-3 rounded-full mt-1 flex-shrink-0',
                          flag.severity === 'critical' ? 'bg-rose-600' :
                          flag.severity === 'error' ? 'bg-red-500' : 'bg-amber-500'
                        )} />
                        <div>
                          <p className="text-sm font-semibold text-rose-800">
                            {flag.reason || flag.flag?.replace(/_/g, ' ')}
                          </p>
                          {flag.severity && (
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full mt-1 inline-block',
                              flag.severity === 'critical' ? 'bg-rose-200 text-rose-800' :
                              flag.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            )}>
                              {flag.severity}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fraud Score & Decision */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" /> Fraud Detection
                  </p>
                  {getFraudDecisionBadge(selectedSubmission.fraud_decision || 'allow')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Fraud Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div className={cn(
                          'h-full rounded-full',
                          (selectedSubmission.fraud_score || 0) >= 75 ? 'bg-red-500' :
                          (selectedSubmission.fraud_score || 0) >= 50 ? 'bg-orange-500' :
                          (selectedSubmission.fraud_score || 0) >= 25 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        )} style={{ width: `${selectedSubmission.fraud_score || 0}%` }} />
                      </div>
                      <span className={cn('font-bold', getRiskColor(selectedSubmission.fraud_score || 0))}>
                        {selectedSubmission.fraud_score || 0}/100
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Device</p>
                    <p className="text-sm font-medium text-slate-700">{selectedSubmission.device_info || 'N/A'}</p>
                  </div>
                </div>
                {fraudFlags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Fraud Flags ({fraudFlags.length}):</p>
                    <div className="space-y-1">
                      {fraudFlags.map((flag: any, i: number) => (
                        <div key={i} className={cn(
                          'p-2 rounded text-xs',
                          flag.severity === 'critical' ? 'bg-red-50 text-red-700' :
                          flag.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                          flag.severity === 'medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-50 text-slate-600'
                        )}>
                          <span className="font-semibold">{flag.flag}: </span>{flag.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
