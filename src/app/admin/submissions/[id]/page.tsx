'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CaretLeft, MapPin, Calendar, User, Phone, DeviceMobile, CheckCircle, XCircle, Clock, Warning, Eye, DownloadSimple, Image, FileText, Shield, ArrowRight, MapPinLine } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, Textarea, Label, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui';
import { cn, formatDate, formatDateTime, formatIDR, statusColors, statusLabels } from '@/lib/utils';
import type { SubmissionStatus, DeviceOS, FraudRiskLevel } from '@/types';

interface SubmissionEvidence {
  id: string;
  evidence_type: string;
  file_name: string;
  file_url?: string;
  created_at: string;
}

interface TimelineItem {
  id: string;
  status: string;
  timestamp: string;
  note: string;
  actor?: string;
}

interface SubmissionDetail {
  id: string;
  submission_code: string;
  partner_id: string;
  partner_name: string;
  partner_email: string;
  customer_name: string;
  customer_phone_normalized: string;
  customer_phone_masked: string;
  activation_date: string;
  activation_time: string;
  activation_city: string;
  activation_location: string;
  device_os: DeviceOS;
  device_model: string;
  fifgo_downloaded: boolean;
  fifgo_registered: boolean;
  user_tried_app: boolean;
  rating_submitted: boolean;
  rating_value: number;
  review_text: string;
  additional_notes: string;
  status: SubmissionStatus;
  fraud_risk_score: number;
  fraud_risk_level: FraudRiskLevel;
  fee: number;
  submitted_at: string;
  qc_reviewed_by?: string;
  qc_reviewed_at?: string;
  rejection_reason_code?: string;
  rejection_reason_visible?: string;
  internal_qc_notes?: string;
  evidence: SubmissionEvidence[];
  timeline: TimelineItem[];
}

const mockSubmission: SubmissionDetail = {
  id: '1',
  submission_code: 'SUB-260715-A1B2C3D4',
  partner_id: 'p1',
  partner_name: 'Ahmad Fauzi',
  partner_email: 'ahmad.fauzi@email.com',
  customer_name: 'Budi Santoso',
  customer_phone_normalized: '+6281234567890',
  customer_phone_masked: '0812****7890',
  activation_date: '2026-07-15',
  activation_time: '14:30',
  activation_city: 'Jakarta',
  activation_location: 'Mall Grand Indonesia, Lantai 3, Jakarta Pusat',
  device_os: 'android',
  device_model: 'Samsung Galaxy A54',
  fifgo_downloaded: true,
  fifgo_registered: true,
  user_tried_app: true,
  rating_submitted: true,
  rating_value: 5,
  review_text: 'Aplikasi sangat mudah digunakan dan membantu dalam aktivitas sehari-hari. Recommended!',
  additional_notes: '',
  status: 'pending_qc',
  fraud_risk_score: 15,
  fraud_risk_level: 'low',
  fee: 5000,
  submitted_at: '2026-07-15T14:45:00Z',
  evidence: [
    { id: 'ev1', evidence_type: 'selfie', file_name: 'selfie_budi.jpg', created_at: '2026-07-15T14:40:00Z' },
    { id: 'ev2', evidence_type: 'registration', file_name: 'registration_proof.jpg', created_at: '2026-07-15T14:41:00Z' },
    { id: 'ev3', evidence_type: 'app_screenshot', file_name: 'app_screenshot.jpg', created_at: '2026-07-15T14:42:00Z' },
    { id: 'ev4', evidence_type: 'location', file_name: 'location_proof.jpg', created_at: '2026-07-15T14:43:00Z' },
  ],
  timeline: [
    { id: 't1', status: 'submitted', timestamp: '2026-07-15T14:45:00Z', note: 'Submission berhasil dibuat', actor: 'Ahmad Fauzi' },
    { id: 't2', status: 'under_automated_check', timestamp: '2026-07-15T14:45:30Z', note: 'Automated fraud check completed', actor: 'System' },
    { id: 't3', status: 'pending_qc', timestamp: '2026-07-15T15:00:00Z', note: 'Masuk antrian QC', actor: 'System' },
  ],
};

const qcReasonCodes = [
  { code: 'incomplete_evidence', label: 'Bukti tidak lengkap' },
  { code: 'blurry_evidence', label: 'Bukti buram/tidak jelas' },
  { code: 'incorrect_evidence', label: 'Bukti salah' },
  { code: 'registration_incomplete', label: 'Registrasi belum selesai' },
  { code: 'app_usage_not_demonstrated', label: 'Penggunaan app tidak ditunjukkan' },
  { code: 'rating_not_completed', label: 'Rating/review belum selesai' },
  { code: 'customer_data_incomplete', label: 'Data pelanggan tidak lengkap' },
  { code: 'duplicate_phone', label: 'Nomor telepon duplikat' },
  { code: 'duplicate_evidence', label: 'Bukti duplikat' },
  { code: 'sop_violation', label: 'Aktivitas tidak sesuai SOP' },
  { code: 'manipulated_evidence', label: 'Bukti dimanipulasi' },
  { code: 'fraud_indication', label: 'Indikasi kecurangan' },
];

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const [submission] = React.useState<SubmissionDetail | null>(mockSubmission);
  const [activeTab, setActiveTab] = React.useState('details');
  const [showQcDialog, setShowQcDialog] = React.useState(false);
  const [qcDecision, setQcDecision] = React.useState<string>('');
  const [qcReasonCode, setQcReasonCode] = React.useState<string>('');
  const [qcNotes, setQcNotes] = React.useState<string>('');
  const [isSubmittingQc, setIsSubmittingQc] = React.useState(false);
  const [showImagePreview, setShowImagePreview] = React.useState<string | null>(null);

  const getStatusBadge = (status: SubmissionStatus) => {
    const colors = statusColors[status] || statusColors.submitted;
    return <Badge className={cn(colors.bg, colors.text)}>{statusLabels[status]}</Badge>;
  };

  const getRiskBadge = (level: FraudRiskLevel) => {
    const variants: Record<FraudRiskLevel, string> = {
      low: 'success',
      medium: 'warning',
      high: 'danger',
      critical: 'danger',
    };
    return <Badge variant={variants[level]} size="sm">{level.toUpperCase()}</Badge>;
  };

  const handleSubmitQc = async () => {
    setIsSubmittingQc(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmittingQc(false);
    setShowQcDialog(false);
  };

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Submission Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-4">Submission dengan ID tersebut tidak ditemukan</p>
          <Link href="/admin/submissions">
            <Button>Kembali ke Daftar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4">
          <Link href="/admin/submissions" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4">
            <CaretLeft size={18} />Kembali ke Submissions
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText size={28} weight="fill" className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 font-mono">{submission.submission_code}</h1>
                  {getStatusBadge(submission.status)}
                  {getRiskBadge(submission.fraud_risk_level)}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Submitted {formatDateTime(submission.submitted_at)} • Partner: {submission.partner_name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm"><DownloadSimple size={16} className="mr-1" />Export</Button>
              {submission.status === 'pending_qc' && (
                <Button size="sm" onClick={() => setShowQcDialog(true)}>
                  <Shield size={16} className="mr-1" />QC Review
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 md:px-8 bg-slate-50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger value="details" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">
                Detail
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">
                Bukti ({submission.evidence.length})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="fraud" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">
                Fraud Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {submission.fraud_risk_level !== 'low' && (
        <div className="px-4 md:px-8 py-4">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <Warning size={24} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Fraud Risk: {submission.fraud_risk_level.toUpperCase()}</p>
                <p className="text-sm text-amber-700">Risk Score: {submission.fraud_risk_score}/100</p>
              </div>
              <Link href={`/admin/fraud/${submission.id}`}>
                <Button variant="warning" size="sm">Review Fraud</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="px-4 md:px-8 py-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <User size={20} className="text-blue-500" />Informasi Customer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <User size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Nama Customer</p>
                          <p className="font-medium text-slate-900">{submission.customer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Nomor Telepon</p>
                          <p className="font-medium text-slate-900">{submission.customer_phone_masked}</p>
                          <p className="text-xs text-slate-400">{submission.customer_phone_normalized}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPinLine size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Lokasi</p>
                          <p className="font-medium text-slate-900">{submission.activation_location}</p>
                          <p className="text-sm text-slate-500">{submission.activation_city}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activation Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-purple-500" />Informasi Aktivasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Tanggal</p>
                          <p className="font-medium text-slate-900">{formatDate(submission.activation_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Waktu</p>
                          <p className="font-medium text-slate-900">{submission.activation_time}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DeviceMobile size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Device</p>
                          <p className="font-medium text-slate-900">{submission.device_os === 'android' ? '🤖 Android' : '🍎 iOS'}</p>
                          <p className="text-xs text-slate-400">{submission.device_model}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Fee</p>
                          <p className="font-bold text-emerald-600">{formatIDR(submission.fee)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FIFGO Verification */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <DeviceMobile size={20} className="text-emerald-500" />Verifikasi FIFGO
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Downloaded', checked: submission.fifgo_downloaded },
                        { label: 'Registered', checked: submission.fifgo_registered },
                        { label: 'Tried App', checked: submission.user_tried_app },
                        { label: 'Rating', checked: submission.rating_submitted },
                      ].map((item, i) => (
                        <div key={i} className={cn(
                          'p-4 rounded-xl border-2 text-center',
                          item.checked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                        )}>
                          <DeviceMobile size={24} className={cn('mx-auto mb-2', item.checked ? 'text-emerald-500' : 'text-slate-400')} />
                          <p className="text-sm font-medium">{item.label}</p>
                          {item.checked && <CheckCircle size={20} className="mx-auto text-emerald-500 mt-2" weight="fill" />}
                        </div>
                      ))}
                    </div>
                    {submission.rating_value > 0 && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-700">
                          <strong>Rating:</strong> {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < submission.rating_value ? 'text-amber-500' : 'text-slate-300'}>★</span>
                          ))} ({submission.rating_value}/5)
                        </p>
                        {submission.review_text && (
                          <p className="text-sm text-amber-800 mt-2 italic">&quot;{submission.review_text}&quot;</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Partner Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Partner Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {submission.partner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{submission.partner_name}</p>
                          <p className="text-xs text-slate-500">{submission.partner_email}</p>
                        </div>
                      </div>
                      <Link href={`/admin/users/${submission.partner_id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full">Lihat Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* QC Status */}
                {submission.qc_reviewed_by && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-4">QC Review</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reviewer</span>
                          <span className="font-medium">{submission.qc_reviewed_by}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tanggal</span>
                          <span className="font-medium">{formatDateTime(submission.qc_reviewed_at!)}</span>
                        </div>
                        {submission.rejection_reason_visible && (
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-700">{submission.rejection_reason_visible}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Aksi Cepat</h3>
                    <div className="space-y-2">
                      <Link href={`/admin/qc/${submission.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Shield size={16} className="mr-2" />QC Review
                        </Button>
                      </Link>
                      <Link href={`/admin/submissions/${submission.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ArrowRight size={16} className="mr-2" />View Full Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-6">Bukti Aktivasi ({submission.evidence.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {submission.evidence.map((ev) => (
                  <div key={ev.id} className="group relative">
                    <div
                      className="aspect-square rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowImagePreview(ev.file_name)}
                    >
                      <Image size={48} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-slate-700 capitalize">{ev.evidence_type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-400">{ev.file_name}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(ev.created_at)}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="icon-sm" onClick={() => setShowImagePreview(ev.file_name)}>
                        <Eye size={14} />
                      </Button>
                      <Button variant="secondary" size="icon-sm">
                        <DownloadSimple size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-6">Timeline Status</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-6">
                  {submission.timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-4 relative">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center z-10',
                        index === 0 ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                      )}>
                        {item.status === 'valid' ? (
                          <CheckCircle size={20} weight="fill" />
                        ) : item.status === 'non_valid' ? (
                          <XCircle size={20} weight="fill" />
                        ) : item.status === 'suspected_fraud' || item.status === 'confirmed_fraud' ? (
                          <Warning size={20} weight="fill" />
                        ) : (
                          <Clock size={20} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{statusLabels[item.status as SubmissionStatus] || item.status}</p>
                          {index === 0 && <Badge variant="success" size="sm">Latest</Badge>}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{item.note}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>{formatDateTime(item.timestamp)}</span>
                          {item.actor && <span>• by {item.actor}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-red-500" />Fraud Risk Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-sm text-slate-500">Risk Score</p>
                    <p className="text-3xl font-bold text-slate-900">{submission.fraud_risk_score}</p>
                    <p className="text-xs text-slate-400">out of 100</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-600">Risk Level</p>
                    <p className="text-3xl font-bold text-amber-600 uppercase">{submission.fraud_risk_level}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-sm text-slate-500">Checks Passed</p>
                    <p className="text-3xl font-bold text-emerald-600">7/8</p>
                    <p className="text-xs text-slate-400">Automated checks</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Phone Number Validation', passed: true },
                    { name: 'Duplicate Detection', passed: true },
                    { name: 'Location Verification', passed: true },
                    { name: 'Time Pattern Analysis', passed: true },
                    { name: 'Evidence Similarity', passed: false, detail: 'Similarity with 2 other submissions' },
                    { name: 'Device Fingerprint', passed: true },
                    { name: 'Submission Velocity', passed: true },
                    { name: 'SOP Compliance', passed: true },
                  ].map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        {check.passed ? (
                          <CheckCircle size={20} className="text-emerald-500" weight="fill" />
                        ) : (
                          <Warning size={20} className="text-amber-500" weight="fill" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{check.name}</p>
                          {check.detail && <p className="text-xs text-amber-600">{check.detail}</p>}
                        </div>
                      </div>
                      <Badge variant={check.passed ? 'success' : 'warning'} size="sm">
                        {check.passed ? 'Passed' : 'Review'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* QC Dialog */}
      <Dialog open={showQcDialog} onOpenChange={setShowQcDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QC Review - {submission.submission_code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Decision</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setQcDecision('valid')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    qcDecision === 'valid' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <CheckCircle size={32} className={cn('mx-auto mb-2', qcDecision === 'valid' ? 'text-emerald-500' : 'text-slate-400')} />
                  <p className="font-medium">Valid</p>
                </button>
                <button
                  onClick={() => setQcDecision('non_valid')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    qcDecision === 'non_valid' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <XCircle size={32} className={cn('mx-auto mb-2', qcDecision === 'non_valid' ? 'text-red-500' : 'text-slate-400')} />
                  <p className="font-medium">Tidak Valid</p>
                </button>
                <button
                  onClick={() => setQcDecision('need_revision')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    qcDecision === 'need_revision' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <Warning size={32} className={cn('mx-auto mb-2', qcDecision === 'need_revision' ? 'text-amber-500' : 'text-slate-400')} />
                  <p className="font-medium">Revisi</p>
                </button>
                <button
                  onClick={() => setQcDecision('escalate_fraud')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    qcDecision === 'escalate_fraud' ? 'border-red-600 bg-red-100' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <Shield size={32} className={cn('mx-auto mb-2', qcDecision === 'escalate_fraud' ? 'text-red-600' : 'text-slate-400')} />
                  <p className="font-medium">Fraud</p>
                </button>
              </div>
            </div>

            {(qcDecision === 'non_valid' || qcDecision === 'need_revision') && (
              <div>
                <Label>Alasan Penolakan</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {qcReasonCodes.map((reason) => (
                    <button
                      key={reason.code}
                      onClick={() => setQcReasonCode(reason.code)}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left transition-all',
                        qcReasonCode === reason.code ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Catatan Internal (opsional)</Label>
              <Textarea
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="Catatan untuk tim internal..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowQcDialog(false)} className="flex-1">
                Batal
              </Button>
              <Button
                onClick={handleSubmitQc}
                isLoading={isSubmittingQc}
                disabled={!qcDecision || ((qcDecision === 'non_valid' || qcDecision === 'need_revision') && !qcReasonCode)}
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowImagePreview(null)}>
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImagePreview(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              Close
            </button>
            <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center">
              <Image size={64} className="text-slate-400" />
              <p className="ml-4 text-slate-600">{showImagePreview}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
