'use client';

import * as React from 'react';
import { User, Phone, Camera, PencilSimple, Check, Bank, Plus, Trash, Eye, EyeSlash } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Label, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';

export default function PartnerProfilePage() {
  const [profile, setProfile] = React.useState({ full_name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', phone: '081234567890', whatsapp: '081234567890', city: 'Jakarta Selatan', address: 'Jl. Sudirman No. 123' });
  const [bankAccounts, setBankAccounts] = React.useState([{ id: '1', bank_name: 'Bank Central Asia (BCA)', account_number_masked: '1234567890', account_holder_name: 'Ahmad Fauzi', is_primary: true }]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showAddBank, setShowAddBank] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold text-slate-900">Profil</h1><p className="text-sm text-slate-500">Kelola informasi akun</p></div>
            {!isEditing ? <Button onClick={() => setIsEditing(true)}><PencilSimple size={18} className="mr-2" />Edit Profil</Button> : <div className="flex gap-2"><Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button><Button onClick={handleSave}><Check size={18} className="mr-2" />Simpan</Button></div>}
          </div>
        </div>
      </header>
      {saved && <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-500 text-white rounded-xl flex items-center gap-3 animate-fade-in"><Check size={20} />Profil berhasil disimpan</div>}
      <div className="px-4 md:px-8 py-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">{profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50"><Camera size={16} /></button>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-slate-900">{profile.full_name}</h2>
                <p className="text-slate-500">{profile.email}</p>
                <div className="flex gap-2 mt-2 justify-center md:justify-start"><Badge variant="success">Aktif</Badge><Badge variant="outline">FIFGO Campaign</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2"><User size={20} className="text-blue-500" />Informasi Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={profile.full_name} onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))} disabled={!isEditing} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled className="bg-slate-50" /></div>
              <div className="space-y-2"><Label>Nomor Telepon</Label><Input type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} disabled={!isEditing} leftIcon={<Phone size={18} />} /></div>
              <div className="space-y-2"><Label>WhatsApp</Label><Input type="tel" value={profile.whatsapp} onChange={(e) => setProfile(p => ({ ...p, whatsapp: e.target.value }))} disabled={!isEditing} /></div>
              <div className="space-y-2"><Label>Kota</Label><Input value={profile.city} onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))} disabled={!isEditing} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Alamat</Label><Textarea value={profile.address} onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))} disabled={!isEditing} rows={3} /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><Bank size={20} className="text-emerald-500" />Rekening Bank</h3><Button variant="outline" size="sm" onClick={() => setShowAddBank(true)}><Plus size={16} className="mr-1" />Tambah</Button></div>
            <div className="space-y-4">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className={`p-4 rounded-xl border-2 ${bank.is_primary ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"><Bank size={24} className={bank.is_primary ? 'text-emerald-600' : 'text-slate-500'} /></div>
                      <div><p className="font-semibold text-slate-900">{bank.bank_name}</p><p className="text-sm text-slate-500">{bank.account_number_masked}</p><p className="text-sm text-slate-500">{bank.account_holder_name}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {bank.is_primary && <Badge variant="success" size="sm">Primary</Badge>}
                      <Button variant="ghost" size="icon-sm" onClick={() => setBankAccounts(prev => prev.filter(b => b.id !== bank.id))} className="text-red-500"><Trash size={18} /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Rekening Bank</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nama Bank</Label><Select><SelectTrigger><SelectValue placeholder="Pilih bank" /></SelectTrigger><SelectContent><SelectItem value="bca">Bank Central Asia (BCA)</SelectItem><SelectItem value="mandiri">Bank Mandiri</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Nomor Rekening</Label><Input placeholder="Masukkan nomor rekening" /></div>
            <div className="space-y-2"><Label>Nama Pemilik</Label><Input placeholder="Nama di buku tabungan" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddBank(false)}>Batal</Button><Button onClick={() => setShowAddBank(false)}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
