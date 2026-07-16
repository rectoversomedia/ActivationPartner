'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle, XCircle, Clock, Warning, Eye, Shield,
  Funnel, ArrowLeft, User, Calendar, Phone, Envelope,
  MapPin, DeviceMobile, Camera, Check
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FraudFlag {
  flag: string;
  reason: string;
  severity: string;
}

interface Submission {
  id: string;
  submission_code: string;
  sales_name: string;
  pic_name: string;
  campaign_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_phone_masked: string;
  status: string;
  created_at: string;
  device_info: string;
  gps_lat: number;
  gps_lng: number;
  screenshot_download: boolean;
  screenshot_register: boolean;
  screenshot_rating: boolean;
  fraud_flags: string;
  qc_notes: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending QC', color: 'bg-amber-100 text-amber-700', icon: Clock },
  valid: { label: 'Valid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  invalid: { label: 'Invalid', color: 'bg-red-100 text-red-700', icon: XCircle },
  fraud: { label: 'Fraud', color: 'bg-rose-200 text-rose-800', icon: Shield },
};

export default function AdminQCPage() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('pending');
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Fetch submissions
  const fetchSubmissions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/submissions?${params}`);
      const result = await response.json();

      if (result.data) {
        setSubmissions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Update status
  const updateStatus = async (id: string, status: 'valid' | 'invalid' | 'fraud', notes?: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, qc_notes: notes }),
      });

      if (response.ok) {
        fetchSubmissions();
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Parse fraud flags
  const parseFraudFlags = (flagsJson: string): FraudFlag[] => {
    try {
      return JSON.parse(flagsJson || '[]');
    } catch {
      return [];
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    valid: submissions.filter(s => s.status === 'valid').length,
    invalid: submissions.filter(s => s.status === 'invalid').length,
    fraud: submissions.filter(s => s.status === 'fraud').length,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
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
            <h1 className="text-2xl font-bold text-slate-900">QC Dashboard</h1>
            <p className="text-sm text-slate-500">Quality Control & Approval</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft size={18} className="mr-2" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.valid}</p>
              <p className="text-xs text-slate-500">Valid</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-rose-600">{stats.invalid + stats.fraud}</p>
              <p className="text-xs text-slate-500">Invalid/Fraud</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'valid', 'invalid', 'fraud'].map((filter) => {
            const config = STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG];
            const Icon = config?.icon || Funnel;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  statusFilter === filter
                    ? config?.color || 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                <Icon size={16} />
                {filter === 'all' ? 'Semua' : config?.label || filter}
                {filter !== 'all' && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/30 text-xs">
                    {filter === 'pending' ? stats.pending :
                     filter === 'valid' ? stats.valid :
                     filter === 'invalid' ? stats.invalid :
                     filter === 'fraud' ? stats.fraud : 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <Card className="bg-white">
            <CardContent className="p-8 text-center text-slate-500">
              Loading...
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-8 text-center text-slate-500">
              Tidak ada submission dengan status ini
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const fraudFlags = parseFraudFlags(sub.fraud_flags);
              const statusConfig = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

              return (
                <Card key={sub.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-blue-600">{sub.submission_code}</span>
                          <Badge className={statusConfig.color}>
                            <statusConfig.icon size={14} className="mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {fraudFlags.length > 0 && (
                            <Warning size={18} className="text-rose-500" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Sales</p>
                            <p className="font-medium text-slate-900">{sub.sales_name}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">PIC</p>
                            <p className="font-medium text-slate-900">{sub.pic_name}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Customer</p>
                            <p className="font-medium text-slate-900">{sub.customer_name}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Tanggal</p>
                            <p className="font-medium text-slate-900">
                              {new Date(sub.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>

                        {/* Fraud Flags */}
                        {fraudFlags.length > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
                            <p className="text-xs font-semibold text-rose-700 mb-2 flex items-center gap-1">
                              <Warning size={14} /> Alasan Flag:
                            </p>
                            <ul className="text-sm text-rose-800 space-y-1">
                              {fraudFlags.map((flag, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className={cn(
                                    'w-2 h-2 rounded-full mt-1.5',
                                    flag.severity === 'critical' ? 'bg-rose-600' :
                                    flag.severity === 'error' ? 'bg-red-500' : 'bg-amber-500'
                                  )} />
                                  {flag.reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(sub)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={16} className="mr-1" /> Detail
                        </Button>
                        {sub.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(sub.id, 'valid')}
                              disabled={isUpdating}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle size={16} className="mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(sub.id, 'invalid')}
                              disabled={isUpdating}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={16} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <Card
            className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Detail Submission</h2>
                  <p className="text-slate-500 font-mono">{selectedSubmission.submission_code}</p>
                </div>
                <Badge className={STATUS_CONFIG[selectedSubmission.status as keyof typeof STATUS_CONFIG]?.color}>
                  {STATUS_CONFIG[selectedSubmission.status as keyof typeof STATUS_CONFIG]?.label}
                </Badge>
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
                  <p className="text-xs text-blue-600 font-semibold mb-2 flex items-center gap-1">
                    <DeviceMobile size={14} /> Device
                  </p>
                  <p className="text-sm font-mono text-slate-700">{selectedSubmission.device_info || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 font-semibold mb-2 flex items-center gap-1">
                    <MapPin size={14} /> GPS Location
                  </p>
                  <p className="text-sm text-slate-700">
                    {selectedSubmission.gps_lat && selectedSubmission.gps_lng
                      ? `${selectedSubmission.gps_lat.toFixed(6)}, ${selectedSubmission.gps_lng.toFixed(6)}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Screenshots */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Camera size={16} /> Screenshots
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'screenshot_download', label: 'Download' },
                    { key: 'screenshot_register', label: 'Registrasi' },
                    { key: 'screenshot_rating', label: 'Rating' },
                  ].map((item) => {
                    const value = selectedSubmission[item.key as keyof Submission];
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          'aspect-square rounded-xl flex flex-col items-center justify-center gap-2',
                          value
                            ? 'bg-emerald-100 border-2 border-emerald-300'
                            : 'bg-slate-50 border-2 border-dashed border-slate-200'
                        )}
                      >
                        {value ? (
                          <>
                            <CheckCircle size={24} className="text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-700">{item.label}</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={24} className="text-slate-400" />
                            <span className="text-xs text-slate-400">{item.label}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fraud Flags */}
              {parseFraudFlags(selectedSubmission.fraud_flags).length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-1">
                    <Warning size={16} /> Fraud Detection
                  </p>
                  <ul className="space-y-2">
                    {parseFraudFlags(selectedSubmission.fraud_flags).map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className={cn(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          flag.severity === 'critical' ? 'bg-rose-600' :
                          flag.severity === 'error' ? 'bg-red-500' : 'bg-amber-500'
                        )} />
                        <span className="text-rose-800">{flag.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* QC Notes */}
              {selectedSubmission.qc_notes && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-600 font-semibold mb-1">QC Notes</p>
                  <p className="text-sm text-slate-700">{selectedSubmission.qc_notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => updateStatus(selectedSubmission.id, 'valid')}
                    disabled={isUpdating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle size={18} className="mr-2" /> Approve Valid
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedSubmission.id, 'invalid')}
                    disabled={isUpdating}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle size={18} className="mr-2" /> Reject
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={() => setSelectedSubmission(null)}
                className="w-full mt-3"
              >
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
