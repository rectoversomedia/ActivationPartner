'use client';

import * as React from 'react';
import { UsersThree, UserCirclePlus, MagnifyingGlass, Eye, PencilSimple } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

const mockUsers = [
  { id: '1', full_name: 'Ahmad Fauzi', email: 'ahmad@rectoverso.id', role: 'partner', status: 'active', valid_submissions: 156 },
  { id: '2', full_name: 'Budi Santoso', email: 'budi@rectoverso.id', role: 'partner', status: 'active', valid_submissions: 142 },
  { id: '3', full_name: 'Citra Dewi', email: 'citra@rectoverso.id', role: 'pic', status: 'active', valid_submissions: 0 },
  { id: '4', full_name: 'Admin Utama', email: 'admin@rectoverso.id', role: 'campaign_manager', status: 'active', valid_submissions: 0 },
];

export default function AdminUsersPage() {
  const stats = { total: mockUsers.length, partners: 2, pics: 1, managers: 1 };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Users & Partners</h1><p className="text-sm text-slate-500">Kelola semua user</p></div>
          <Button><UserCirclePlus size={18} className="mr-2" />Tambah User</Button>
        </div>
      </header>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"><CardContent className="p-5"><div className="flex items-center gap-3"><UsersThree size={28} weight="fill" className="opacity-80" /><div><p className="text-blue-100 text-sm">Total</p><p className="text-2xl font-bold">{stats.total}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-cyan-50"><UserCirclePlus size={24} className="text-cyan-500" /></div><div><p className="text-slate-500 text-sm">Partners</p><p className="text-xl font-bold">{stats.partners}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-purple-50"><UsersThree size={24} className="text-purple-500" /></div><div><p className="text-slate-500 text-sm">PICs</p><p className="text-xl font-bold">{stats.pics}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-50"><UsersThree size={24} className="text-emerald-500" /></div><div><p className="text-slate-500 text-sm">Managers</p><p className="text-xl font-bold">{stats.managers}</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div><p className="font-medium text-slate-900">{user.full_name}</p><p className="text-sm text-slate-500">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={user.role === 'campaign_manager' ? 'warning' : user.role === 'pic' ? 'purple' : 'info'}>{user.role.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-4"><Badge variant="success" size="sm">{user.status}</Badge></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon-sm"><Eye size={18} /></Button>
                        <Button variant="ghost" size="icon-sm"><PencilSimple size={18} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
