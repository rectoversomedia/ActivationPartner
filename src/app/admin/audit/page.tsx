'use client';

import * as React from 'react';
import { Eye, MagnifyingGlass, Filter, DownloadSimple, CaretLeft, User, ShieldCheck, FileText, ClipboardText, CurrencyCircleDollar, Gear, UsersThree, CheckCircle, XCircle, Warning } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui';
import { cn, formatDateTime } from '@/lib/utils';

interface AuditLog {
  id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  created_at: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', actor_email: 'admin@rectoverso.id', actor_role: 'campaign_manager', action: 'submission_qc_approved', entity_type: 'submission', entity_id: 'SUB-260715-A1B2C3D4', created_at: '2026-07-15T16:30:00Z', ip_address: '192.168.1.100' },
  { id: '2', actor_email: 'qc1@rectoverso.id', actor_role: 'qc_reviewer', action: 'submission_qc_rejected', entity_type: 'submission', entity_id: 'SUB-260715-E5F6G7H8', created_at: '2026-07-15T15:45:00Z', ip_address: '192.168.1.101' },
  { id: '3', actor_email: 'admin@rectoverso.id', actor_role: 'campaign_manager', action: 'partner_status_changed', entity_type: 'profile', entity_id: 'p-456', new_value: { status: 'suspended' }, reason: 'Violation of campaign terms', created_at: '2026-07-15T14:00:00Z' },
  { id: '4', actor_email: 'pic1@rectoverso.id', actor_role: 'pic', action: 'fraud_review_confirmed', entity_type: 'submission', entity_id: 'SUB-260714-I9J0K1L2', created_at: '2026-07-14T18:20:00Z' },
  { id: '5', actor_email: 'admin@rectoverso.id', actor_role: 'campaign_manager', action: 'payment_batch_approved', entity_type: 'payment_batch', entity_id: 'BATCH-2607-001', created_at: '2026-07-14T10:00:00Z', ip_address: '192.168.1.100' },
  { id: '6', actor_email: 'partner1@rectoverso.id', actor_role: 'partner', action: 'submission_created', entity_type: 'submission', entity_id: 'SUB-260715-M3N4O5P6', created_at: '2026-07-15T12:30:00Z', ip_address: '10.0.0.50' },
  { id: '7', actor_email: 'admin@rectoverso.id', actor_role: 'campaign_manager', action: 'campaign_settings_updated', entity_type: 'campaign', entity_id: 'FIFGO2026', new_value: { fee_per_activation: 6000 }, created_at: '2026-07-13T09:00:00Z' },
  { id: '8', actor_email: 'pic2@rectoverso.id', actor_role: 'pic', action: 'submission_escalated', entity_type: 'submission', entity_id: 'SUB-260713-Q7R8S9T0', created_at: '2026-07-13T16:45:00Z', reason: 'Requires fraud investigation' },
];

const actionIcons: Record<string, React.ElementType> = {
  submission_qc_approved: CheckCircle,
  submission_qc_rejected: XCircle,
  submission_created: FileText,
  submission_updated: ClipboardText,
  fraud_review_confirmed: Warning,
  fraud_review_dismissed: ShieldCheck,
  partner_status_changed: UsersThree,
  payment_batch_approved: CurrencyCircleDollar,
  campaign_settings_updated: Gear,
  submission_escalated: Warning,
  user_login: User,
  user_logout: User,
};

const actionColors: Record<string, string> = {
  submission_qc_approved: 'text-emerald-500 bg-emerald-50',
  submission_qc_rejected: 'text-red-500 bg-red-50',
  submission_created: 'text-blue-500 bg-blue-50',
  submission_updated: 'text-amber-500 bg-amber-50',
  fraud_review_confirmed: 'text-red-500 bg-red-50',
  fraud_review_dismissed: 'text-green-500 bg-green-50',
  partner_status_changed: 'text-purple-500 bg-purple-50',
  payment_batch_approved: 'text-cyan-500 bg-cyan-50',
  campaign_settings_updated: 'text-slate-500 bg-slate-50',
  submission_escalated: 'text-orange-500 bg-orange-50',
  user_login: 'text-blue-500 bg-blue-50',
  user_logout: 'text-slate-500 bg-slate-50',
};

const actionLabels: Record<string, string> = {
  submission_qc_approved: 'QC Approved',
  submission_qc_rejected: 'QC Rejected',
  submission_created: 'Submission Created',
  submission_updated: 'Submission Updated',
  fraud_review_confirmed: 'Fraud Confirmed',
  fraud_review_dismissed: 'Fraud Dismissed',
  partner_status_changed: 'Partner Status Changed',
  payment_batch_approved: 'Payment Batch Approved',
  campaign_settings_updated: 'Campaign Settings Updated',
  submission_escalated: 'Escalated to Fraud',
  user_login: 'User Login',
  user_logout: 'User Logout',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  campaign_manager: 'bg-amber-100 text-amber-700',
  pic: 'bg-blue-100 text-blue-700',
  qc_reviewer: 'bg-cyan-100 text-cyan-700',
  partner: 'bg-green-100 text-green-700',
};

export default function AdminAuditPage() {
  const [search, setSearch] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState<string>('all');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  const filteredLogs = React.useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchesSearch = !search ||
        log.actor_email.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_id.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
      const matchesRole = roleFilter === 'all' || log.actor_role === roleFilter;
      return matchesSearch && matchesAction && matchesRole;
    });
  }, [search, actionFilter, roleFilter]);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
            <p className="text-sm text-slate-500">Riwayat aktivitas sistem</p>
          </div>
          <Button variant="outline"><DownloadSimple size={18} className="mr-2" />Export</Button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50"><Eye size={20} className="text-blue-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Total Logs</p>
                <p className="text-xl font-bold">{mockAuditLogs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50"><CheckCircle size={20} className="text-emerald-500" /></div>
              <div>
                <p className="text-sm text-slate-500">QC Actions</p>
                <p className="text-xl font-bold">{mockAuditLogs.filter(l => l.action.includes('qc')).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50"><Warning size={20} className="text-red-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Fraud Actions</p>
                <p className="text-xl font-bold">{mockAuditLogs.filter(l => l.action.includes('fraud')).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50"><Gear size={20} className="text-amber-500" /></div>
              <div>
                <p className="text-sm text-slate-500">Settings Changes</p>
                <p className="text-xl font-bold">{mockAuditLogs.filter(l => l.action.includes('settings') || l.action.includes('status')).length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari email, ID, atau action..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Action</SelectItem>
                  <SelectItem value="submission">Submission</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="campaign_manager">Manager</SelectItem>
                  <SelectItem value="qc_reviewer">QC</SelectItem>
                  <SelectItem value="pic">PIC</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const Icon = actionIcons[log.action] || Eye;
                    const colorClass = actionColors[log.action] || 'text-slate-500 bg-slate-50';
                    const actionLabel = actionLabels[log.action] || log.action;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-slate-900">{formatDateTime(log.created_at)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {log.actor_email.split('@')[0].slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{log.actor_email}</p>
                              <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', roleColors[log.actor_role] || 'bg-slate-100 text-slate-600')}>
                                {log.actor_role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn('p-2 rounded-lg', colorClass)}>
                              <Icon size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{actionLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700 capitalize">{log.entity_type}</p>
                            <p className="text-xs text-slate-400 font-mono">{log.entity_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-500 font-mono">{log.ip_address || '-'}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedLog(log)}>
                            <Eye size={18} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Audit Log Detail</h2>
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Actor</p>
                  <p className="text-sm font-medium">{selectedLog.actor_email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-medium capitalize">{selectedLog.actor_role.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Action</p>
                  <p className="text-sm font-medium">{actionLabels[selectedLog.action] || selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Timestamp</p>
                  <p className="text-sm font-medium">{formatDateTime(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Entity Type</p>
                  <p className="text-sm font-medium capitalize">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Entity ID</p>
                  <p className="text-sm font-medium font-mono">{selectedLog.entity_id}</p>
                </div>
              </div>

              {selectedLog.reason && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600">Reason</p>
                  <p className="text-sm text-amber-800">{selectedLog.reason}</p>
                </div>
              )}

              {selectedLog.previous_value && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Previous Value</p>
                  <pre className="p-3 bg-slate-100 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.previous_value, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_value && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">New Value</p>
                  <pre className="p-3 bg-blue-50 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.new_value, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500">IP Address</p>
                <p className="text-sm font-mono">{selectedLog.ip_address || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
