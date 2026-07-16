'use client';

import * as React from 'react';
import Link from 'next/link';
import { CurrencyCircleDollar, PlusCircle, MagnifyingGlass, Eye, CheckCircle, Clock, XCircle, DownloadSimple, Users, FileText, Calendar, Bank, Receipt, CaretLeft, PencilSimple, Check } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { cn, formatIDR, formatDate, formatNumber } from '@/lib/utils';
import type { PaymentBatchStatus } from '@/types';

interface PaymentBatch {
  id: string;
  batch_code: string;
  campaign_id: string;
  campaign_name: string;
  period_start: string;
  period_end: string;
  status: PaymentBatchStatus;
  total_partners: number;
  total_activations: number;
  total_amount: number;
  approved_by?: string;
  approved_at?: string;
  payment_date?: string;
  created_at: string;
}

interface PartnerPayment {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_email: string;
  valid_activations: number;
  fee_per_activation: number;
  gross_amount: number;
  adjustment_amount: number;
  adjustment_reason?: string;
  final_amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_date?: string;
}

const mockBatches: PaymentBatch[] = [
  { id: '1', batch_code: 'BATCH-2607-001', campaign_id: '1', campaign_name: 'FIFGO Campaign', period_start: '2026-07-01', period_end: '2026-07-07', status: 'approved', total_partners: 15, total_activations: 234, total_amount: 1170000, approved_by: 'admin@rectoverso.id', approved_at: '2026-07-08T10:00:00Z', payment_date: '2026-07-10', created_at: '2026-07-08T09:00:00Z' },
  { id: '2', batch_code: 'BATCH-2606-002', campaign_id: '1', campaign_name: 'FIFGO Campaign', period_start: '2026-06-24', period_end: '2026-06-30', status: 'paid', total_partners: 14, total_activations: 198, total_amount: 990000, approved_by: 'admin@rectoverso.id', approved_at: '2026-06-30T15:00:00Z', payment_date: '2026-07-03', created_at: '2026-06-30T14:00:00Z' },
  { id: '3', batch_code: 'BATCH-2606-001', campaign_id: '1', campaign_name: 'FIFGO Campaign', period_start: '2026-06-17', period_end: '2026-06-23', status: 'paid', total_partners: 12, total_activations: 156, total_amount: 780000, approved_by: 'admin@rectoverso.id', approved_at: '2026-06-24T10:00:00Z', payment_date: '2026-06-27', created_at: '2026-06-24T09:00:00Z' },
];

const mockPartnerPayments: PartnerPayment[] = [
  { id: '1', partner_id: 'p1', partner_name: 'Ahmad Fauzi', partner_email: 'ahmad@email.com', valid_activations: 45, fee_per_activation: 5000, gross_amount: 225000, adjustment_amount: 0, final_amount: 225000, status: 'pending' },
  { id: '2', partner_id: 'p2', partner_name: 'Budi Santoso', partner_email: 'budi@email.com', valid_activations: 38, fee_per_activation: 5000, gross_amount: 190000, adjustment_amount: -10000, adjustment_reason: 'Duplicate submission penalty', final_amount: 180000, status: 'pending' },
  { id: '3', partner_id: 'p3', partner_name: 'Citra Dewi', partner_email: 'citra@email.com', valid_activations: 32, fee_per_activation: 5000, gross_amount: 160000, adjustment_amount: 0, final_amount: 160000, status: 'pending' },
  { id: '4', partner_id: 'p4', partner_name: 'Dian Pratama', partner_email: 'dian@email.com', valid_activations: 28, fee_per_activation: 5000, gross_amount: 140000, adjustment_amount: 0, final_amount: 140000, status: 'pending' },
  { id: '5', partner_id: 'p5', partner_name: 'Eko Wijaya', partner_email: 'eko@email.com', valid_activations: 25, fee_per_activation: 5000, gross_amount: 125000, adjustment_amount: 0, final_amount: 125000, status: 'pending' },
];

const statusColors: Record<PaymentBatchStatus, { bg: string; text: string; dot: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  approved: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  processing: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  partially_paid: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const statusLabels: Record<PaymentBatchStatus, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  approved: 'Approved',
  processing: 'Processing',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  cancelled: 'Cancelled',
};

export default function AdminPaymentsPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedBatch, setSelectedBatch] = React.useState<PaymentBatch | null>(null);
  const [showBatchDetail, setShowBatchDetail] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('batches');
  const [showCreateBatch, setShowCreateBatch] = React.useState(false);

  const filteredBatches = React.useMemo(() => {
    return mockBatches.filter((batch) => {
      const matchesSearch = !search || batch.batch_code.toLowerCase().includes(search.toLowerCase()) || batch.campaign_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const stats = {
    totalBatches: mockBatches.length,
    pendingApproval: mockBatches.filter(b => b.status === 'approved').length,
    processing: mockBatches.filter(b => b.status === 'processing').length,
    totalPaid: mockBatches.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total_amount, 0),
  };

  const handleViewBatch = (batch: PaymentBatch) => {
    setSelectedBatch(batch);
    setShowBatchDetail(true);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="text-sm text-slate-500">Kelola pembayaran partner</p>
          </div>
          <Button onClick={() => setShowCreateBatch(true)}>
            <PlusCircle size={18} className="mr-2" />Create Batch
          </Button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50"><Receipt size={24} className="text-blue-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Total Batches</p>
                <p className="text-xl font-bold">{stats.totalBatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50"><Clock size={24} className="text-amber-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Pending Approval</p>
                <p className="text-xl font-bold text-amber-600">{stats.pendingApproval}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50"><CurrencyCircleDollar size={24} className="text-purple-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Processing</p>
                <p className="text-xl font-bold text-purple-600">{stats.processing}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={24} className="text-emerald-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Total Paid</p>
                <p className="text-xl font-bold text-emerald-600">{formatIDR(stats.totalPaid)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="batches">Payment Batches</TabsTrigger>
            <TabsTrigger value="partners">Partner Payments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Cari batch..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mt-4">
              {filteredBatches.map((batch) => (
                <Card key={batch.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewBatch(batch)}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Receipt size={24} weight="fill" className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 font-mono">{batch.batch_code}</h3>
                            <Badge className={statusColors[batch.status].bg + ' ' + statusColors[batch.status].text}>
                              {statusLabels[batch.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">{batch.campaign_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Period</p>
                          <p className="text-sm font-medium">{formatDate(batch.period_start)} - {formatDate(batch.period_end)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Partners</p>
                          <p className="text-sm font-medium">{batch.total_partners}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Activations</p>
                          <p className="text-sm font-medium">{batch.total_activations}</p>
                        </div>
                        <div className="text-right min-w-[140px]">
                          <p className="text-xs text-slate-500">Total Amount</p>
                          <p className="text-lg font-bold text-emerald-600">{formatIDR(batch.total_amount)}</p>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleViewBatch(batch); }}>
                          <Eye size={18} />
                        </Button>
                      </div>
                    </div>
                    {batch.payment_date && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={14} />Payment Date: {formatDate(batch.payment_date)}</span>
                        <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" />Approved by {batch.approved_by}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Pending Partner Payments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Activations</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Gross</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Adjustment</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Final</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockPartnerPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {payment.partner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{payment.partner_name}</p>
                                <p className="text-xs text-slate-500">{payment.partner_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center font-medium">{payment.valid_activations}</td>
                          <td className="px-4 py-4 text-right">{formatIDR(payment.gross_amount)}</td>
                          <td className="px-4 py-4 text-right">
                            {payment.adjustment_amount !== 0 ? (
                              <span className={payment.adjustment_amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {payment.adjustment_amount > 0 ? '+' : ''}{formatIDR(payment.adjustment_amount)}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-emerald-600">{formatIDR(payment.final_amount)}</td>
                          <td className="px-4 py-4 text-center">
                            <Button variant="ghost" size="icon-sm"><Eye size={18} /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Payment History</h3>
                <div className="space-y-3">
                  {mockBatches.filter(b => b.status === 'paid').map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 font-mono">{batch.batch_code}</p>
                          <p className="text-sm text-emerald-600">{formatDate(batch.payment_date!)} • {batch.total_partners} partners</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{formatIDR(batch.total_amount)}</p>
                        <Button variant="ghost" size="sm"><DownloadSimple size={16} className="mr-1" />Receipt</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBatchDetail(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Receipt size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-mono">{selectedBatch.batch_code}</h2>
                    <p className="text-sm text-slate-500">{selectedBatch.campaign_name}</p>
                  </div>
                </div>
                <button onClick={() => setShowBatchDetail(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">Period</p>
                  <p className="text-sm font-medium">{formatDate(selectedBatch.period_start)} - {formatDate(selectedBatch.period_end)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">Partners</p>
                  <p className="text-lg font-bold">{selectedBatch.total_partners}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">Activations</p>
                  <p className="text-lg font-bold">{selectedBatch.total_activations}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600">Total Amount</p>
                  <p className="text-lg font-bold text-emerald-600">{formatIDR(selectedBatch.total_amount)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Partner Breakdown</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockPartnerPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {payment.partner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium">{payment.partner_name}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{formatIDR(payment.final_amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" className="flex-1"><DownloadSimple size={18} className="mr-2" />Export</Button>
                {selectedBatch.status === 'approved' && (
                  <Button className="flex-1"><Bank size={18} className="mr-2" />Process Payment</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Campaign</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifgo">FIFGO Campaign</SelectItem>
                  <SelectItem value="brandx">Brand X Activation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Period Start</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Period End</label>
                <Input type="date" />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Preview</p>
              <p className="text-lg font-bold text-slate-900">15 partners • 234 activations</p>
              <p className="text-emerald-600 font-semibold">Est. Total: {formatIDR(1170000)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateBatch(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => setShowCreateBatch(false)} className="flex-1">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
