'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CaretLeft, User, Phone, Envelope, MapPin, Calendar, Shield, CheckCircle, XCircle, Warning, FileText, CurrencyCircleDollar, PencilSimple, Eye, Plus, Trash, Pencil } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Label, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { cn, formatDate, formatDateTime, formatIDR, statusColors, statusLabels } from '@/lib/utils';
import type { UserStatus, RoleName } from '@/types';

interface PartnerStats {
  totalSubmissions: number;
  validSubmissions: number;
  invalidSubmissions: number;
  pendingSubmissions: number;
  fraudSubmissions: number;
  validRate: number;
  totalEarnings: number;
  paidAmount: number;
  unpaidAmount: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  province?: string;
  address?: string;
  national_id?: string;
  profile_photo_url?: string;
  status: UserStatus;
  role: RoleName;
  created_at: string;
  last_active_at?: string;
  campaign_name?: string;
}

interface SubmissionHistory {
  id: string;
  submission_code: string;
  customer_name: string;
  activation_date: string;
  status: string;
  fee: number;
}

const mockUser: UserProfile = {
  id: 'p1',
  email: 'ahmad.fauzi@email.com',
  full_name: 'Ahmad Fauzi',
  phone: '+6281234567890',
  whatsapp: '+6281234567890',
  city: 'Jakarta Selatan',
  province: 'DKI Jakarta',
  address: 'Jl. Sudirman No. 123, RT 001/RW 001, Kel. Sudirman, Kec. Tanah Abang',
  national_id: '3175012345678900',
  status: 'active',
  role: 'partner',
  created_at: '2026-01-15T10:00:00Z',
  last_active_at: '2026-07-15T14:45:00Z',
  campaign_name: 'FIFGO Campaign',
};

const mockStats: PartnerStats = {
  totalSubmissions: 156,
  validSubmissions: 142,
  invalidSubmissions: 8,
  pendingSubmissions: 4,
  fraudSubmissions: 2,
  validRate: 91.0,
  totalEarnings: 710000,
  paidAmount: 600000,
  unpaidAmount: 110000,
};

const mockSubmissions: SubmissionHistory[] = [
  { id: '1', submission_code: 'SUB-260715-A1B2C3D4', customer_name: 'Budi Santoso', activation_date: '2026-07-15', status: 'valid', fee: 5000 },
  { id: '2', submission_code: 'SUB-260714-E5F6G7H8', customer_name: 'Ani Wijaya', activation_date: '2026-07-14', status: 'pending_qc', fee: 5000 },
  { id: '3', submission_code: 'SUB-260714-I9J0K1L2', customer_name: 'Dedi Kurniawan', activation_date: '2026-07-14', status: 'non_valid', fee: 0 },
  { id: '4', submission_code: 'SUB-260713-M3N4O5P6', customer_name: 'Citra Dewi', activation_date: '2026-07-13', status: 'valid', fee: 5000 },
];

const roleColors: Record<RoleName, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  campaign_manager: 'bg-amber-100 text-amber-700',
  pic: 'bg-blue-100 text-blue-700',
  qc_reviewer: 'bg-cyan-100 text-cyan-700',
  partner: 'bg-emerald-100 text-emerald-700',
};

const roleLabels: Record<RoleName, string> = {
  super_admin: 'Super Admin',
  campaign_manager: 'Campaign Manager',
  pic: 'PIC',
  qc_reviewer: 'QC Reviewer',
  partner: 'Partner',
};

export default function UserDetailPage() {
  const params = useParams();
  const [user] = React.useState<UserProfile | null>(mockUser);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isEditing, setIsEditing] = React.useState(false);
  const [showStatusDialog, setShowStatusDialog] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<UserStatus>('');
  const [editedUser, setEditedUser] = React.useState(mockUser);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">User Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-4">User dengan ID tersebut tidak ditemukan</p>
          <Link href="/admin/users">
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
          <Link href="/admin/users" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4">
            <CaretLeft size={18} />Kembali ke Users
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900">{user.full_name}</h1>
                  <Badge className={statusColors[user.status].bg + ' ' + statusColors[user.status].text}>
                    {statusLabels[user.status]}
                  </Badge>
                  <span className={cn('px-3 py-1 rounded-full text-sm font-medium', roleColors[user.role])}>
                    {roleLabels[user.role]}
                  </span>
                </div>
                <p className="text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <PencilSimple size={18} className="mr-2" />{isEditing ? 'Batal' : 'Edit'}
              </Button>
              <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
                <Shield size={18} className="mr-2" />Ubah Status
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-8 bg-slate-50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total</p>
                      <p className="text-2xl font-bold">{mockStats.totalSubmissions}</p>
                    </div>
                    <FileText size={28} className="text-white/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Valid Rate</p>
                      <p className="text-2xl font-bold text-emerald-600">{mockStats.validRate}%</p>
                    </div>
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Earnings</p>
                      <p className="text-xl font-bold text-amber-600">{formatIDR(mockStats.totalEarnings)}</p>
                    </div>
                    <CurrencyCircleDollar size={28} className="text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Fraud</p>
                      <p className="text-2xl font-bold text-red-600">{mockStats.fraudSubmissions}</p>
                    </div>
                    <Warning size={28} className="text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-500" />Informasi Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <Input value={editedUser.full_name} onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nomor Telepon</Label>
                      <Input value={editedUser.phone} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input value={editedUser.whatsapp} onChange={(e) => setEditedUser({ ...editedUser, whatsapp: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Kota</Label>
                      <Input value={editedUser.city} onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Provinsi</Label>
                      <Input value={editedUser.province} disabled />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Alamat</Label>
                      <Input value={editedUser.address} onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>NIK</Label>
                      <Input value={editedUser.national_id} disabled />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-6">
                      <Button onClick={() => setIsEditing(false)}>Simpan Perubahan</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Account Info</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Role</span>
                        <span className="font-medium">{roleLabels[user.role]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Campaign</span>
                        <span className="font-medium">{user.campaign_name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bergabung</span>
                        <span className="font-medium">{formatDate(user.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Active</span>
                        <span className="font-medium">{user.last_active_at ? formatDateTime(user.last_active_at) : 'Never'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Payment Info</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Earnings</span>
                        <span className="font-bold text-emerald-600">{formatIDR(mockStats.totalEarnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paid</span>
                        <span className="font-medium text-green-600">{formatIDR(mockStats.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Unpaid</span>
                        <span className="font-medium text-amber-600">{formatIDR(mockStats.unpaidAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Fee</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-mono text-sm text-blue-600">{sub.submission_code}</td>
                        <td className="px-4 py-4 font-medium">{sub.customer_name}</td>
                        <td className="px-4 py-4 text-slate-500">{formatDate(sub.activation_date)}</td>
                        <td className="px-4 py-4">
                          <Badge className={statusColors[sub.status as keyof typeof statusColors]?.bg + ' ' + statusColors[sub.status as keyof typeof statusColors]?.text}>
                            {statusLabels[sub.status as keyof typeof statusLabels] || sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right font-medium">{sub.fee > 0 ? formatIDR(sub.fee) : '-'}</td>
                        <td className="px-4 py-4 text-center">
                          <Link href={`/admin/submissions/${sub.id}`}>
                            <Button variant="ghost" size="icon-sm"><Eye size={18} /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <p className="text-emerald-600 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatIDR(mockStats.totalEarnings)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-green-600 text-sm">Paid</p>
                    <p className="text-2xl font-bold text-green-700">{formatIDR(mockStats.paidAmount)}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-amber-600 text-sm">Unpaid</p>
                    <p className="text-2xl font-bold text-amber-700">{formatIDR(mockStats.unpaidAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {[
                    { period: 'Week 27 (Jul 1-7)', amount: 225000, status: 'paid' },
                    { period: 'Week 26 (Jun 24-30)', amount: 190000, status: 'paid' },
                    { period: 'Week 25 (Jun 17-23)', amount: 185000, status: 'paid' },
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.period}</p>
                          <p className="text-sm text-slate-500">5 valid activations</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{formatIDR(payment.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">User Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-slate-500">Receive email for new submissions</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-blue-500 relative">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-slate-500">Receive SMS for QC decisions</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-slate-300 relative">
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">Suspend User</p>
                      <p className="text-sm text-red-600">Temporarily disable this user&apos;s account</p>
                    </div>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">Suspend</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">Delete User</p>
                      <p className="text-sm text-red-600">Permanently delete this user and all data</p>
                    </div>
                    <Button variant="destructive" className="bg-red-600">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Status User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status Baru</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as UserStatus)}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active - User dapat login dan submit</SelectItem>
                  <SelectItem value="invited">Invited - User baru diundang</SelectItem>
                  <SelectItem value="suspended">Suspended - User ditangguhkan sementara</SelectItem>
                  <SelectItem value="inactive">Inactive - User tidak aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)} className="flex-1">Batal</Button>
              <Button onClick={() => setShowStatusDialog(false)} className="flex-1">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
