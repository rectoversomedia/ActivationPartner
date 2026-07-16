'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gear, Users, Flag, Shield, Check, X, Plus, Trash, Pencil,
  CaretLeft, CaretRight, CheckCircle, XCircle, Warning, Eye,
  MapPin, DeviceMobile, Clock, Phone, Envelope, User,
  FloppyDisk, List, Buildings, UserCircle
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

// Types
interface Campaign {
  id: string;
  name: string;
  code: string;
  fee_per_activation: number;
  fraud_rules: FraudRuleConfig;
  allowed_regions: Region[];
  required_evidence: string[];
  is_active: boolean;
  created_at: string;
}

interface FraudRuleConfig {
  require_screenshot_download: boolean;
  require_screenshot_register: boolean;
  require_screenshot_rating: boolean;
  require_gps: boolean;
  check_duplicate_phone: boolean;
  check_duplicate_name: boolean;
  check_duplicate_email: boolean;
  check_gps_location: boolean;
}

interface Region {
  name: string;
  lat: number;
  lng: number;
  radius: number; // in km
}

interface SalesPerson {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
}

interface PIC {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
}

// Default fraud rules
const DEFAULT_FRAUD_RULES: FraudRuleConfig = {
  require_screenshot_download: true,
  require_screenshot_register: true,
  require_screenshot_rating: true,
  require_gps: true,
  check_duplicate_phone: true,
  check_duplicate_name: true,
  check_duplicate_email: true,
  check_gps_location: false,
};

// Tab types
type TabType = 'campaigns' | 'sales' | 'pics' | 'settings';

export default function SuperAdminPage() {
  // State
  const [activeTab, setActiveTab] = React.useState<TabType>('campaigns');
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [salesList, setSalesList] = React.useState<SalesPerson[]>([]);
  const [picsList, setPicsList] = React.useState<PIC[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingCampaign, setEditingCampaign] = React.useState<Campaign | null>(null);
  const [editingSales, setEditingSales] = React.useState<SalesPerson | null>(null);
  const [editingPic, setEditingPic] = React.useState<PIC>(null as any);
  const [showModal, setShowModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'campaign' | 'sales' | 'pic'>('campaign');
  const [isSaving, setIsSaving] = React.useState(false);

  // Load data
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load campaigns
      const campRes = await fetch('/api/campaigns');
      const campData = await campRes.json();
      if (campData.data) {
        setCampaigns(campData.data);
      }

      // Load sales
      const salesRes = await fetch('/api/master-data?sales');
      const salesData = await salesRes.json();
      if (salesData.data) {
        setSalesList(salesData.data);
      }

      // Load PICs
      const picsRes = await fetch('/api/master-data?pics');
      const picsData = await picsRes.json();
      if (picsData.data) {
        setPicsList(picsData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for adding/editing
  const openModal = (type: 'campaign' | 'sales' | 'pic', item?: any) => {
    setModalType(type);
    if (type === 'campaign') {
      setEditingCampaign(item || createEmptyCampaign());
    } else if (type === 'sales') {
      setEditingSales(item || { id: '', name: '', phone: '', is_active: true });
    } else if (type === 'pic') {
      setEditingPic(item || { id: '', name: '', phone: '', is_active: true });
    }
    setShowModal(true);
  };

  const createEmptyCampaign = (): Campaign => ({
    id: '',
    name: '',
    code: '',
    fee_per_activation: 5000,
    fraud_rules: { ...DEFAULT_FRAUD_RULES },
    allowed_regions: [],
    required_evidence: ['download', 'register', 'rating'],
    is_active: true,
    created_at: new Date().toISOString(),
  });

  // Save handlers
  const saveCampaign = async () => {
    if (!editingCampaign?.name || !editingCampaign?.code) {
      alert('Nama dan Kode Campaign wajib diisi!');
      return;
    }
    setIsSaving(true);
    try {
      const method = editingCampaign.id ? 'PUT' : 'POST';
      const url = editingCampaign.id ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCampaign),
      });

      if (res.ok) {
        await loadData();
        setShowModal(false);
      } else {
        alert('Gagal menyimpan campaign');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSales = async () => {
    if (!editingSales?.name) {
      alert('Nama Sales wajib diisi!');
      return;
    }
    setIsSaving(true);
    try {
      const method = editingSales.id ? 'PUT' : 'POST';
      const url = editingSales.id ? `/api/master-data/sales/${editingSales.id}` : '/api/master-data/sales';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSales),
      });

      if (res.ok) {
        await loadData();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const savePic = async () => {
    if (!editingPic?.name) {
      alert('Nama PIC wajib diisi!');
      return;
    }
    setIsSaving(true);
    try {
      const method = editingPic.id ? 'PUT' : 'POST';
      const url = editingPic.id ? `/api/master-data/pics/${editingPic.id}` : '/api/master-data/pics';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPic),
      });

      if (res.ok) {
        await loadData();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Yakin hapus campaign ini?')) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const deleteSales = async (id: string) => {
    if (!confirm('Yakin hapus sales ini?')) return;
    try {
      await fetch(`/api/master-data/sales/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const deletePic = async (id: string) => {
    if (!confirm('Yakin hapus PIC ini?')) return;
    try {
      await fetch(`/api/master-data/pics/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'campaigns' as TabType, label: 'Campaigns', icon: Flag, count: campaigns.length },
    { id: 'sales' as TabType, label: 'Sales', icon: User, count: salesList.length },
    { id: 'pics' as TabType, label: 'PIC', icon: UserCircle, count: picsList.length },
    { id: 'settings' as TabType, label: 'Settings', icon: Gear, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-[180px] h-auto mb-4">
              <Image src="/Logo Rectoverso.png" alt="RECTOVERSO" width={180} height={72} className="w-full h-auto" priority />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin</h1>
            <p className="text-sm text-slate-500">Pengaturan Campaign & Master Data</p>
          </div>

          {/* Back to Dashboard */}
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <CaretLeft size={16} className="mr-1" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                )}
              >
                <Icon size={18} />
                {tab.label}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-slate-500">Loading...</CardContent></Card>
        ) : (
          <>
            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openModal('campaign')}>
                    <Plus size={18} className="mr-2" /> Tambah Campaign
                  </Button>
                </div>

                {campaigns.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-slate-500">
                    Belum ada campaign. Klik "Tambah Campaign" untuk membuat.
                  </CardContent></Card>
                ) : (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-slate-900">{campaign.name}</h3>
                              <Badge className={campaign.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                                {campaign.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">Code: {campaign.code} | Fee: Rp {campaign.fee_per_activation.toLocaleString()}/activation</p>

                            {/* Fraud Rules Summary */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Fraud Rules:</span>
                              {campaign.fraud_rules?.check_duplicate_phone && (
                                <Badge variant="outline" className="text-xs bg-red-50">Dup Phone</Badge>
                              )}
                              {campaign.fraud_rules?.check_duplicate_name && (
                                <Badge variant="outline" className="text-xs bg-red-50">Dup Name</Badge>
                              )}
                              {campaign.fraud_rules?.check_duplicate_email && (
                                <Badge variant="outline" className="text-xs bg-red-50">Dup Email</Badge>
                              )}
                              {campaign.fraud_rules?.require_gps && (
                                <Badge variant="outline" className="text-xs bg-amber-50">Require GPS</Badge>
                              )}
                              {campaign.fraud_rules?.require_screenshot_download && (
                                <Badge variant="outline" className="text-xs bg-blue-50">Screenshot</Badge>
                              )}
                            </div>

                            {/* Evidence Required */}
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Required Evidence:</span>
                              {campaign.required_evidence?.includes('download') && (
                                <Badge variant="outline" className="text-xs">Download</Badge>
                              )}
                              {campaign.required_evidence?.includes('register') && (
                                <Badge variant="outline" className="text-xs">Register</Badge>
                              )}
                              {campaign.required_evidence?.includes('rating') && (
                                <Badge variant="outline" className="text-xs">Rating</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openModal('campaign', campaign)}>
                              <Pencil size={16} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteCampaign(campaign.id)} className="text-red-600 hover:bg-red-50">
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* SALES TAB */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openModal('sales')}>
                    <Plus size={18} className="mr-2" /> Tambah Sales
                  </Button>
                </div>

                {salesList.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-slate-500">
                    Belum ada data sales.
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {salesList.map((sales) => (
                      <Card key={sales.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900">{sales.name}</h3>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Phone size={14} /> {sales.phone || '-'}
                              </p>
                              <Badge className={sales.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-slate-100 text-slate-500 mt-2'}>
                                {sales.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openModal('sales', sales)}>
                                <Pencil size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteSales(sales.id)} className="text-red-600">
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PIC TAB */}
            {activeTab === 'pics' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openModal('pic')}>
                    <Plus size={18} className="mr-2" /> Tambah PIC
                  </Button>
                </div>

                {picsList.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-slate-500">
                    Belum ada data PIC.
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {picsList.map((pic) => (
                      <Card key={pic.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900">{pic.name}</h3>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Phone size={14} /> {pic.phone || '-'}
                              </p>
                              <Badge className={pic.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-slate-100 text-slate-500 mt-2'}>
                                {pic.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openModal('pic', pic)}>
                                <Pencil size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deletePic(pic.id)} className="text-red-600">
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">System Settings</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2">API Configuration</h3>
                      <p className="text-sm text-slate-600">Supabase URL dan API Key dikonfigurasi melalui environment variables.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2">Storage</h3>
                      <p className="text-sm text-slate-600">Screenshot diupload ke Supabase Storage bucket 'screenshots'.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2">Fraud Detection</h3>
                      <p className="text-sm text-slate-600">Rules fraud detection dapat dikonfigurasi per campaign.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <CardContent className="p-6">
              {/* CAMPAIGN MODAL */}
              {modalType === 'campaign' && editingCampaign && (
                <>
                  <h2 className="text-xl font-bold mb-4">
                    {editingCampaign.id ? 'Edit Campaign' : 'Tambah Campaign'}
                  </h2>

                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nama Campaign *</Label>
                        <Input
                          value={editingCampaign.name}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                          placeholder="FIFGO Campaign"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Code *</Label>
                        <Input
                          value={editingCampaign.code}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, code: e.target.value.toUpperCase() })}
                          placeholder="FIFGO"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Fee per Activation (IDR)</Label>
                      <Input
                        type="number"
                        value={editingCampaign.fee_per_activation}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, fee_per_activation: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingCampaign.is_active}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, is_active: e.target.checked })}
                          className="rounded"
                        />
                        Campaign Active
                      </Label>
                    </div>

                    {/* Fraud Rules */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Shield size={18} className="text-red-500" />
                        Fraud Detection Rules
                      </h3>

                      <div className="space-y-3 bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-3">Aktifkan rules yang ingin di-check:</p>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules?.check_duplicate_phone ?? true}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_phone: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium text-slate-900">Duplicate Phone Check</p>
                            <p className="text-xs text-slate-500">Block jika nomor HP sudah terdaftar</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules?.check_duplicate_name ?? true}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_name: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium text-slate-900">Duplicate Name Check</p>
                            <p className="text-xs text-slate-500">Block jika nama customer sudah terdaftar</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules?.check_duplicate_email ?? true}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_email: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium text-slate-900">Duplicate Email Check</p>
                            <p className="text-xs text-slate-500">Block jika email sudah terdaftar</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules?.require_gps ?? true}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, require_gps: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium text-slate-900">Require GPS Location</p>
                            <p className="text-xs text-slate-500">Submission wajib memiliki data GPS</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules?.check_gps_location ?? false}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, check_gps_location: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium text-slate-900">GPS Location Validation</p>
                            <p className="text-xs text-slate-500">Cek apakah GPS dalam area yang diizinkan</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Required Evidence */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Camera size={18} className="text-blue-500" />
                        Required Evidence (Screenshot)
                      </h3>

                      <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.required_evidence?.includes('download')}
                            onChange={(e) => {
                              const newEvidence = e.target.checked
                                ? [...(editingCampaign.required_evidence || []), 'download']
                                : (editingCampaign.required_evidence || []).filter((x: string) => x !== 'download');
                              setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                            }}
                            className="rounded"
                          />
                          Screenshot Download
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.required_evidence?.includes('register')}
                            onChange={(e) => {
                              const newEvidence = e.target.checked
                                ? [...(editingCampaign.required_evidence || []), 'register']
                                : (editingCampaign.required_evidence || []).filter((x: string) => x !== 'register');
                              setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                            }}
                            className="rounded"
                          />
                          Screenshot Registrasi
                        </label>

                        <label className="flex items-center gap-3 p-2 bg-white rounded">
                          <input
                            type="checkbox"
                            checked={editingCampaign.required_evidence?.includes('rating')}
                            onChange={(e) => {
                              const newEvidence = e.target.checked
                                ? [...(editingCampaign.required_evidence || []), 'rating']
                                : (editingCampaign.required_evidence || []).filter((x: string) => x !== 'rating');
                              setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                            }}
                            className="rounded"
                          />
                          Screenshot Rating/Review
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                      Batal
                    </Button>
                    <Button onClick={saveCampaign} isLoading={isSaving} className="flex-1 bg-blue-600">
                      <FloppyDisk size={18} className="mr-2" /> Simpan
                    </Button>
                  </div>
                </>
              )}

              {/* SALES MODAL */}
              {modalType === 'sales' && editingSales && (
                <>
                  <h2 className="text-xl font-bold mb-4">
                    {editingSales.id ? 'Edit Sales' : 'Tambah Sales'}
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nama Sales *</Label>
                      <Input
                        value={editingSales.name}
                        onChange={(e) => setEditingSales({ ...editingSales, name: e.target.value })}
                        placeholder="Nama lengkap sales"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>No. Telepon</Label>
                      <Input
                        value={editingSales.phone}
                        onChange={(e) => setEditingSales({ ...editingSales, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingSales.is_active}
                          onChange={(e) => setEditingSales({ ...editingSales, is_active: e.target.checked })}
                          className="rounded"
                        />
                        Active
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Batal</Button>
                    <Button onClick={saveSales} isLoading={isSaving} className="flex-1 bg-blue-600">Simpan</Button>
                  </div>
                </>
              )}

              {/* PIC MODAL */}
              {modalType === 'pic' && editingPic && (
                <>
                  <h2 className="text-xl font-bold mb-4">
                    {editingPic.id ? 'Edit PIC' : 'Tambah PIC'}
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nama PIC *</Label>
                      <Input
                        value={editingPic.name}
                        onChange={(e) => setEditingPic({ ...editingPic, name: e.target.value })}
                        placeholder="Nama lengkap PIC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>No. Telepon</Label>
                      <Input
                        value={editingPic.phone}
                        onChange={(e) => setEditingPic({ ...editingPic, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingPic.is_active}
                          onChange={(e) => setEditingPic({ ...editingPic, is_active: e.target.checked })}
                          className="rounded"
                        />
                        Active
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Batal</Button>
                    <Button onClick={savePic} isLoading={isSaving} className="flex-1 bg-blue-600">Simpan</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
