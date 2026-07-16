'use client';

import * as React from 'react';
import Link from 'next/link';
import { Trophy, PlusCircle, MagnifyingGlass, Eye, PencilSimple, Users, FileText, CheckCircle, Calendar } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui';
import { formatDate, formatIDR, statusColors, statusLabels } from '@/lib/utils';
import type { CampaignStatus } from '@/types';

const mockCampaigns = [
  { id: '1', name: 'FIFGO Campaign', code: 'FIFGO2026', status: 'active' as CampaignStatus, start_date: '2026-01-01', end_date: '2026-12-31', fee_per_activation: 5000, target_activations: 10000, current_activations: 4523, partners: 45, valid_rate: 94.5 },
  { id: '2', name: 'Brand X Activation', code: 'BRANDX01', status: 'active' as CampaignStatus, start_date: '2026-03-01', end_date: '2026-09-30', fee_per_activation: 7500, target_activations: 5000, current_activations: 2341, partners: 28, valid_rate: 92.1 },
  { id: '3', name: 'SmartLife Promo', code: 'SLPROMO2', status: 'upcoming' as CampaignStatus, start_date: '2026-08-01', end_date: '2026-11-30', fee_per_activation: 6000, target_activations: 3000, current_activations: 0, partners: 0, valid_rate: 0 },
];

export default function AdminCampaignsPage() {
  const [search, setSearch] = React.useState('');

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Campaigns</h1><p className="text-sm text-slate-500">Kelola semua campaign</p></div>
          <Button><PlusCircle size={18} className="mr-2" />Campaign Baru</Button>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"><CardContent className="p-5"><div className="flex items-center gap-3"><Trophy size={24} weight="fill" className="opacity-80" /><div><p className="text-blue-100 text-sm">Total</p><p className="text-2xl font-bold">{mockCampaigns.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={24} className="text-emerald-500" /></div><div><p className="text-slate-500 text-sm">Active</p><p className="text-xl font-bold">{mockCampaigns.filter(c => c.status === 'active').length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-purple-50"><Users size={24} className="text-purple-500" /></div><div><p className="text-slate-500 text-sm">Total Partners</p><p className="text-xl font-bold">{mockCampaigns.reduce((sum, c) => sum + c.partners, 0)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-50"><FileText size={24} className="text-amber-500" /></div><div><p className="text-slate-500 text-sm">Total Submissions</p><p className="text-xl font-bold">{mockCampaigns.reduce((sum, c) => sum + c.current_activations, 0).toLocaleString()}</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative"><MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Cari campaign..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
              <Select><SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="upcoming">Upcoming</SelectItem></SelectContent></Select>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Trophy size={24} weight="fill" className="text-white" /></div>
                    <div><h3 className="font-semibold text-slate-900">{campaign.name}</h3><p className="text-xs text-slate-500 font-mono">{campaign.code}</p></div>
                  </div>
                  <Badge className={statusColors[campaign.status].bg + ' ' + statusColors[campaign.status].text}>{statusLabels[campaign.status]}</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Periode</span><span className="font-medium">{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Fee</span><span className="font-medium text-emerald-600">{formatIDR(campaign.fee_per_activation)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Partners</span><span className="font-medium">{campaign.partners}</span></div>
                </div>
                {campaign.target_activations > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Progress</span><span>{campaign.current_activations.toLocaleString()} / {campaign.target_activations.toLocaleString()}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(campaign.current_activations / campaign.target_activations) * 100}%` }} /></div>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/campaigns/${campaign.id}`} className="flex-1"><Button variant="outline" className="w-full" size="sm"><Eye size={16} className="mr-1" />Detail</Button></Link>
                  <Button variant="ghost" size="sm"><PencilSimple size={16} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
