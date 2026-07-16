'use client';

import * as React from 'react';
import Link from 'next/link';
import { CaretLeft, CheckCircle, XCircle, Warning, Eye, Image } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Label, Textarea } from '@/components/ui';
import type { QcDecision } from '@/types';

export default function QcReviewPage() {
  const params = useParams();
  const [decision, setDecision] = React.useState<QcDecision | ''>('');
  const [reasonCode, setReasonCode] = React.useState('');

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="px-4 md:px-8 py-6">
          <Link href="/admin/qc" className="inline-flex items-center gap-2 text-cyan-100 hover:text-white mb-4"><CaretLeft size={18} />Kembali ke Queue</Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">SUB-260715-A1B2</h1>
            <Badge className="bg-white/20 text-white border-0">Pending QC</Badge>
          </div>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informasi Submission</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500">Partner</p><p className="font-medium">Ahmad Fauzi</p></div>
                <div><p className="text-xs text-slate-500">Customer</p><p className="font-medium">Budi Santoso</p></div>
                <div><p className="text-xs text-slate-500">Lokasi</p><p className="font-medium">Mall Grand Indonesia</p></div>
                <div><p className="text-xs text-slate-500">Tanggal</p><p className="font-medium">15 Juli 2026</p></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Verifikasi FIFGO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Downloaded', 'Registered', 'Tried App', 'Rating'].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-center">
                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Bukti (3)</h3>
                <p className="text-sm text-slate-500">0 viewed</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center"><Image size={48} className="text-slate-400" /></div>
                ))}
              </div>
            </CardContent></Card>
          </div>
          <div>
            <Card className="sticky top-6"><CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">QC Decision</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDecision('valid')} className={`p-4 rounded-xl border-2 text-center ${decision === 'valid' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                  <CheckCircle size={32} className={`mx-auto mb-2 ${decision === 'valid' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className="font-medium">Valid</p>
                </button>
                <button onClick={() => setDecision('non_valid')} className={`p-4 rounded-xl border-2 text-center ${decision === 'non_valid' ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                  <XCircle size={32} className={`mx-auto mb-2 ${decision === 'non_valid' ? 'text-red-500' : 'text-slate-400'}`} />
                  <p className="font-medium">Tidak Valid</p>
                </button>
                <button onClick={() => setDecision('need_revision')} className={`p-4 rounded-xl border-2 text-center ${decision === 'need_revision' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                  <Warning size={32} className={`mx-auto mb-2 ${decision === 'need_revision' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <p className="font-medium">Revisi</p>
                </button>
              </div>
              {(decision === 'non_valid' || decision === 'need_revision') && (
                <div className="space-y-2">
                  <Label>Alasan</Label>
                  <Select value={reasonCode} onValueChange={setReasonCode}><SelectTrigger><SelectValue placeholder="Pilih alasan" /></SelectTrigger><SelectContent><SelectItem value="incomplete">Bukti tidak lengkap</SelectItem><SelectItem value="blurry">Bukti buram</SelectItem><SelectItem value="duplicate">Duplikat</SelectItem></SelectContent></Select>
                </div>
              )}
              <div className="space-y-2"><Label>Catatan Internal</Label><Textarea placeholder="Catatan..." rows={3} /></div>
              <Button className="w-full" disabled={!decision}>Submit Decision</Button>
            </CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}
