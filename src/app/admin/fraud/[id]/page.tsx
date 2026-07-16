'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CaretLeft, Shield, Warning, CheckCircle, XCircle, Eye, User, MapPin, Clock, FileText, Phone, DeviceMobile, Link as LinkIcon, ArrowRight, Check } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Textarea, Label, Select, SelectTrigger, SelectContent, SelectItem, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { cn, formatDateTime, formatIDR } from '@/lib/utils';

interface RelatedSubmission {
  id: string;
  submission_code: string;
  customer_name: string;
  customer_phone: string;
  similarity: number;
  shared_evidence: string[];
}

interface FraudAlert {
  id: string;
  alert_id: string;
  partner_id: string;
  partner_name: string;
  partner_email: string;
  submission_id: string;
  submission_code: string;
  customer_name: string;
  customer_phone: string;
  flag_type: string;
  flag_description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  related_submissions: RelatedSubmission[];
  evidence_urls: string[];
  submission_date: string;
  location: string;
  device_info: string;
  reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution?: string;
}

const mockAlert: FraudAlert = {
  id: '1',
  alert_id: 'FA-001',
  partner_id: 'p1',
  partner_name: 'Ahmad Fauzi',
  partner_email: 'ahmad@email.com',
  submission_id: 'sub-1',
  submission_code: 'SUB-260715-A1B2C3D4',
  customer_name: 'Budi Santoso',
  customer_phone: '+6281234567890',
  flag_type: 'duplicate_phone',
  flag_description: 'Nomor telepon yang sama sudah terdaftar di 3 submission lain dalam 7 hari terakhir',
  risk_level: 'high',
  risk_score: 75,
  related_submissions: [
    { id: '1', submission_code: 'SUB-260714-X1Y2Z3', customer_name: 'Rudi Hermawan', customer_phone: '+6281234567890', similarity: 95, shared_evidence: ['selfie_1.jpg'] },
    { id: '2', submission_code: 'SUB-260713-A2B3C4', customer_name: 'Siti Nurhaliza', customer_phone: '+6281234567890', similarity: 88, shared_evidence: [] },
    { id: '3', submission_code: 'SUB-260710-M4N5O6', customer_name: 'Joko Wijaya', customer_phone: '+6281234567890', similarity: 82, shared_evidence: ['selfie_2.jpg', 'receipt.jpg'] },
  ],
  evidence_urls: ['evidence_1.jpg', 'evidence_2.jpg', 'evidence_3.jpg'],
  submission_date: '2026-07-15T14:45:00Z',
  location: 'Mall Grand Indonesia, Jakarta',
  device_info: 'Samsung Galaxy A54 - Android 14',
  reviewed: false,
};

const flagTypeLabels: Record<string, string> = {
  duplicate_phone: 'Duplicate Phone Number',
  duplicate_evidence: 'Duplicate Evidence',
  suspicious_pattern: 'Suspicious Pattern',
  manipulated_evidence: 'Manipulated Evidence',
  velocity_anomaly: 'Velocity Anomaly',
  location_mismatch: 'Location Mismatch',
  time_anomaly: 'Time Anomaly',
  device_reuse: 'Device Reuse',
};

export default function FraudDetailPage() {
  const params = useParams();
  const [alert] = React.useState<FraudAlert | null>(mockAlert);
  const [resolution, setResolution] = React.useState('');
  const [decision, setDecision] = React.useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitDecision = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowConfirmDialog(false);
  };

  if (!alert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Warning size={64} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Alert Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-4">Fraud alert dengan ID tersebut tidak ditemukan</p>
          <Link href="/admin/fraud">
            <Button>Kembali ke Daftar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
        <div className="px-4 md:px-8 py-6">
          <Link href="/admin/fraud" className="inline-flex items-center gap-2 text-red-100 hover:text-white mb-4">
            <CaretLeft size={18} />Kembali ke Fraud Alerts
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield size={28} weight="fill" className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold font-mono">{alert.alert_id}</h1>
                  <Badge className={alert.risk_level === 'critical' || alert.risk_level === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                    {alert.risk_level.toUpperCase()}
                  </Badge>
                  {alert.reviewed ? (
                    <Badge className="bg-white/20 text-white">Reviewed</Badge>
                  ) : (
                    <Badge className="bg-yellow-400 text-yellow-900">NEW</Badge>
                  )}
                </div>
                <p className="text-red-100 mt-1">{flagTypeLabels[alert.flag_type] || alert.flag_type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!alert.reviewed && (
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowConfirmDialog(true)}>
                  <Shield size={18} className="mr-2" />Take Action
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        {/* Risk Score Banner */}
        <Card className={cn(
          'border-2',
          alert.risk_level === 'critical' ? 'bg-red-50 border-red-200' :
          alert.risk_level === 'high' ? 'bg-amber-50 border-amber-200' :
          'bg-yellow-50 border-yellow-200'
        )}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold',
                  alert.risk_level === 'critical' ? 'bg-red-500' :
                  alert.risk_level === 'high' ? 'bg-amber-500' : 'bg-yellow-500'
                )}>
                  {alert.risk_score}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Risk Score</p>
                  <p className="text-sm text-slate-500">Auto-calculated from {alert.related_submissions.length + 1} checks</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-2xl text-slate-900">{alert.related_submissions.length}</p>
                  <p className="text-slate-500">Related</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl text-slate-900">{alert.evidence_urls.length}</p>
                  <p className="text-slate-500">Evidence</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl text-slate-900">7</p>
                  <p className="text-slate-500">Flags</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Warning size={20} className="text-amber-500" />Alert Details
                </h3>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <p className="text-amber-800 font-medium">{alert.flag_description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Customer Name</p>
                      <p className="font-medium">{alert.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Phone Number</p>
                      <p className="font-medium font-mono">{alert.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-medium">{alert.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DeviceMobile size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Device</p>
                      <p className="font-medium">{alert.device_info}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Submission Time</p>
                      <p className="font-medium">{formatDateTime(alert.submission_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Submission</p>
                      <Link href={`/admin/submissions/${alert.submission_id}`} className="font-medium text-blue-600 hover:underline font-mono">
                        {alert.submission_code}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Submissions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <LinkIcon size={20} className="text-purple-500" />Related Submissions ({alert.related_submissions.length})
                </h3>
                <div className="space-y-4">
                  {alert.related_submissions.map((related) => (
                    <div key={related.id} className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <LinkIcon size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 font-mono">{related.submission_code}</p>
                            <p className="text-sm text-slate-500">{related.customer_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'px-3 py-1 rounded-full text-sm font-bold',
                            related.similarity >= 90 ? 'bg-red-100 text-red-700' :
                            related.similarity >= 80 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {related.similarity}% similar
                          </div>
                          <Link href={`/admin/submissions/${related.id}`}>
                            <Button variant="ghost" size="icon-sm"><ArrowRight size={18} /></Button>
                          </Link>
                        </div>
                      </div>
                      {related.shared_evidence.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="warning" size="sm">{related.shared_evidence.length} shared evidence</Badge>
                          <div className="flex gap-1">
                            {related.shared_evidence.map((ev, i) => (
                              <span key={i} className="text-xs text-slate-500">{ev}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Evidence ({alert.evidence_urls.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {alert.evidence_urls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                      <FileText size={32} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partner Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Partner Info</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {alert.partner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{alert.partner_name}</p>
                    <p className="text-sm text-slate-500">{alert.partner_email}</p>
                  </div>
                </div>
                <Link href={`/admin/users/${alert.partner_id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">View Partner Profile</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Review Status */}
            {alert.reviewed && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} />Review Completed
                  </h3>
                  <div className="space-y-2 text-emerald-800">
                    <p><strong>Reviewer:</strong> {alert.reviewed_by}</p>
                    <p><strong>Date:</strong> {formatDateTime(alert.reviewed_at!)}</p>
                    <p><strong>Resolution:</strong> {alert.resolution}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {!alert.reviewed && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowConfirmDialog(true)}>
                      <Shield size={18} className="mr-2" />Review This Alert
                    </Button>
                    <Link href={`/admin/submissions/${alert.submission_id}`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText size={18} className="mr-2" />View Submission
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Fraud Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Decision</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setDecision('confirmed_fraud')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    decision === 'confirmed_fraud' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <XCircle size={32} className={cn('mx-auto mb-2', decision === 'confirmed_fraud' ? 'text-red-500' : 'text-slate-400')} />
                  <p className="font-medium">Confirmed Fraud</p>
                </button>
                <button
                  onClick={() => setDecision('false_positive')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    decision === 'false_positive' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <CheckCircle size={32} className={cn('mx-auto mb-2', decision === 'false_positive' ? 'text-emerald-500' : 'text-slate-400')} />
                  <p className="font-medium">False Positive</p>
                </button>
              </div>
            </div>

            {decision && (
              <div>
                <Label>Resolution Notes</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDecision}
                isLoading={isSubmitting}
                disabled={!decision}
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
