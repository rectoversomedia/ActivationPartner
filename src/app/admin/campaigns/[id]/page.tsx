'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CaretLeft, Trophy, PlusCircle, CheckCircle, Users, FileText, CurrencyCircleDollar, PencilSimple } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { formatDate, formatIDR, formatNumber, statusColors, statusLabels } from '@/lib/utils';

const mockCampaign = { id: '1', name: 'FIFGO Campaign', code: 'FIFGO2026', status: 'active', start_date: '2026-01-01', end_date: '2026-12-31', fee_per_activation: 5000, target_activations: 10000, current_activations: 4523, valid_activations: 4274, partners: 45 };

export default function CampaignDetailPage() {
  // params would be used for real data fetching
  const [activeTab, setActiveTab] = React.useState('overview');
  const progress = (mockCampaign.current_activations / mockCampaign.target_activations) * 100;
  const validRate = (mockCampaign.valid_activations / mockCampaign.current_activations) * 100;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6">
          <Link href="/admin/campaigns" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"><CaretLeft size={18} />Kembali ke Campaigns</Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Trophy size={28} weight="fill" className="text-white" /></div>
              <div><div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-slate-900">{mockCampaign.name}</h1><Badge className={statusColors[mockCampaign.status].bg + ' ' + statusColors[mockCampaign.status].text}>{statusLabels[mockCampaign.status]}</Badge></div><p className="text-slate-500 font-mono">{mockCampaign.code}</p></div>
            </div>
            <div className="flex gap-2"><Button variant="outline"><PencilSimple size={18} className="mr-2" />Edit</Button><Button><PlusCircle size={18} className="mr-2" />Tambah Partner</Button></div>
          </div>
        </div>
        <div className="px-4 md:px-8 bg-slate-50">
          <Tabs value={activeTab} onValueChange={setActiveTab}><TabsList className="bg-transparent h-auto p-0"><TabsTrigger value="overview" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">Overview</TabsTrigger><TabsTrigger value="partners" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">Partners</TabsTrigger><TabsTrigger value="settings" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-t-lg px-4 py-3">Settings</TabsTrigger></TabsList></Tabs>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-blue-100 text-sm">Campaign Progress</p><p className="text-3xl font-bold">{progress.toFixed(1)}%</p></div>
              <div className="text-right"><p className="text-blue-100 text-sm">Target</p><p className="text-2xl font-bold">{formatNumber(mockCampaign.target_activations)}</p></div>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} /></div>
            <div className="flex justify-between mt-2 text-sm text-blue-100"><span>{formatNumber(mockCampaign.current_activations)} completed</span><span>{formatNumber(mockCampaign.target_activations - mockCampaign.current_activations)} remaining</span></div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-50"><FileText size={24} className="text-blue-500" /></div><div><p className="text-slate-500 text-sm">Total</p><p className="text-xl font-bold">{formatNumber(mockCampaign.current_activations)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={24} className="text-emerald-500" /></div><div><p className="text-slate-500 text-sm">Valid</p><p className="text-xl font-bold text-emerald-600">{formatNumber(mockCampaign.valid_activations)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-purple-50"><Users size={24} className="text-purple-500" /></div><div><p className="text-slate-500 text-sm">Partners</p><p className="text-xl font-bold">{mockCampaign.partners}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-50"><CurrencyCircleDollar size={24} className="text-amber-500" /></div><div><p className="text-slate-500 text-sm">Fee/Aktivasi</p><p className="text-xl font-bold">{formatIDR(mockCampaign.fee_per_activation)}</p></div></div></CardContent></Card>
        </div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardContent className="p-6"><h3 className="font-semibold text-slate-900 mb-4">Informasi Campaign</h3><div className="space-y-4"><div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Periode</span><span className="font-medium">{formatDate(mockCampaign.start_date)} - {formatDate(mockCampaign.end_date)}</span></div><div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Valid Rate</span><span className="font-medium text-emerald-600">{validRate.toFixed(1)}%</span></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><h3 className="font-semibold text-slate-900 mb-4">Deskripsi</h3><p className="text-slate-600">Campaign aktivasi aplikasi FIFGO untuk meningkatkan download dan registrasi pengguna baru.</p></CardContent></Card>
          </div>
        )}
        {activeTab === 'partners' && (
          <Card><CardContent className="p-6"><div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-slate-900">Top Partners</h3><Button variant="outline" size="sm"><PlusCircle size={16} className="mr-1" />Tambah</Button></div>
            <div className="space-y-3">
              {[{ name: 'Ahmad Fauzi', submissions: 156, valid: 152 }, { name: 'Budi Santoso', submissions: 142, valid: 138 }].map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</div>
                  <div className="flex-1"><p className="font-medium text-slate-900">{p.name}</p><p className="text-sm text-slate-500">{p.submissions} submissions • {p.valid} valid</p></div>
                  <div className="text-right"><p className="font-bold text-emerald-600">{formatIDR(p.valid * mockCampaign.fee_per_activation)}</p></div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
