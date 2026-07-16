'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CaretLeft, MapPin, Calendar, User, Phone, DeviceMobile, CheckCircle, XCircle, Clock, Warning, Eye, DownloadSimple } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { cn, formatDate, formatDateTime, statusColors, statusLabels } from '@/lib/utils';
import type { SubmissionStatus, DeviceOS } from '@/types';

interface SubmissionDetail {
  id: string;
  submission_code: string;
  customer_name: string;
  customer_phone_masked: string;
  activation_date: string;
  activation_time: string;
  activation_city: string;
  activation_location: string;
  device_os: DeviceOS;
  fifgo_downloaded: boolean;
  fifgo_registered: boolean;
  user_tried_app: boolean;
  rating_submitted: boolean;
  rating_value: number;
  review_text: string;
  status: SubmissionStatus;
  fee: number;
  submitted_at: string;
  qc_reviewed_by: string;
  rejection_reason_visible: string;
  evidence: Array<{ id: string; evidence_type: string; file_name: string }>;
  timeline: Array<{ id: string; status: string; timestamp: string; note: string }>;
}

const mockSubmission: SubmissionDetail = {
  id: '1',
  submission_code: 'SUB-260715-A1B2C3D4',
  customer_name: 'Budi Santoso',
  customer_phone_masked: '0812****7890',
  activation_date: '2026-07-15',
  activation_time: '14:30',
  activation_city: 'Jakarta',
  activation_location: 'Mall Grand Indonesia, Lantai 3',
  device_os: 'android',
  fifgo_downloaded: true,
  fifgo_registered: true,
  user_tried_app: true,
  rating_submitted: true,
  rating_value: 5,
  review_text: 'Aplikasi sangat mudah digunakan!',
  status: 'valid',
  fee: 5000,
  submitted_at: '2026-07-15T14:45:00Z',
  qc_reviewed_by: 'QC Team',
  rejection_reason_visible: '',
  evidence: [
    { id: 'ev1', evidence_type: 'selfie', file_name: 'selfie_budi.jpg' },
    { id: 'ev2', evidence_type: 'registration', file_name: 'registration_proof.jpg' },
  ],
  timeline: [
    { id: 't1', status: 'submitted', timestamp: '2026-07-15T14:45:00Z', note: 'Submission berhasil dibuat' },
    { id: 't2', status: 'pending_qc', timestamp: '2026-07-15T15:00:00Z', note: 'Masuk antrian QC' },
    { id: 't3', status: 'valid', timestamp: '2026-07-15T16:30:00Z', note: 'QC passed' },
  ],
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const [submission] = React.useState<SubmissionDetail | null>(mockSubmission);
  const [activeTab, setActiveTab] = React.useState('details');

  const getStatusBadge = (status: SubmissionStatus) => {
    const colors = statusColors[status] || statusColors.submitted;
    return <Badge className={cn(colors.bg, colors.text)}>{statusLabels[status]}</Badge>;
  };

  if (!submission) {
    return <div className="min-h-screen flex items-center justify-center"><p>Submission tidak ditemukan</p></div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/partner/submissions"><Button variant="ghost" size="icon-sm"><CaretLeft size={20} /></Button></Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 font-mono">{submission.submission_code}</h1>
                {getStatusBadge(submission.status)}
              </div>
              <p className="text-sm text-slate-500">Submitted {formatDateTime(submission.submitted_at)}</p>
            </div>
            {submission.status === 'valid' && <Button variant="outline" size="sm"><DownloadSimple size={18} className="mr-2" />Download</Button>}
          </div>
        </div>
        <div className="px-4 md:px-8 bg-slate-50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger value="details" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">Detail</TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">Bukti ({submission.evidence.length})</TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">Timeline</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {submission.status === 'valid' && (
        <div className="px-4 md:px-8 py-4">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle size={32} weight="fill" /></div>
              <div className="flex-1"><h3 className="font-semibold text-lg">Submission Valid</h3><p className="text-emerald-100">Submission Anda telah diverifikasi.</p></div>
              <div className="text-right"><p className="text-sm text-emerald-100">Fee Earned</p><p className="text-2xl font-bold">Rp {submission.fee.toLocaleString('id-ID')}</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="px-4 md:px-8 py-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <Card><CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informasi Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3"><User size={18} className="text-slate-400 mt-0.5" /><div><p className="text-xs text-slate-500">Nama</p><p className="font-medium text-slate-900">{submission.customer_name}</p></div></div>
                <div className="flex items-start gap-3"><Phone size={18} className="text-slate-400 mt-0.5" /><div><p className="text-xs text-slate-500">Telepon</p><p className="font-medium text-slate-900">{submission.customer_phone_masked}</p></div></div>
                <div className="flex items-start gap-3"><MapPin size={18} className="text-slate-400 mt-0.5" /><div><p className="text-xs text-slate-500">Lokasi</p><p className="font-medium text-slate-900">{submission.activation_location}</p><p className="text-xs text-slate-500">{submission.activation_city}</p></div></div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Verifikasi FIFGO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Downloaded', checked: submission.fifgo_downloaded },
                  { label: 'Registered', checked: submission.fifgo_registered },
                  { label: 'Tried App', checked: submission.user_tried_app },
                  { label: 'Rating', checked: submission.rating_submitted },
                ].map((item, i) => (
                  <div key={i} className={cn('p-4 rounded-xl border-2 text-center', item.checked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50')}>
                    <DeviceMobile size={24} className={cn('mx-auto mb-2', item.checked ? 'text-emerald-500' : 'text-slate-400')} />
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.checked && <CheckCircle size={16} className="mx-auto text-emerald-500 mt-1" weight="fill" />}
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </div>
        )}

        {activeTab === 'evidence' && (
          <Card><CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Bukti Aktivasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submission.evidence.map((ev) => (
                <div key={ev.id} className="group relative">
                  <div className="aspect-square rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center"><Eye size={48} className="text-slate-400" /></div>
                  <p className="text-xs text-slate-500 mt-2">{ev.file_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{ev.evidence_type}</p>
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}

        {activeTab === 'timeline' && (
          <Card><CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Timeline Status</h3>
            <div className="space-y-6">
              {submission.timeline.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', index === 0 ? 'bg-blue-100' : 'bg-slate-100')}>
                      {item.status === 'valid' ? <CheckCircle size={20} className="text-emerald-500" weight="fill" /> : <Clock size={20} className="text-blue-500" weight="fill" />}
                    </div>
                    {index < submission.timeline.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-200" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium text-slate-900">{statusLabels[item.status as SubmissionStatus]}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.note}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
