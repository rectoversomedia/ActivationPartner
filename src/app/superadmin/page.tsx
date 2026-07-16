'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gear, Users, Flag, Shield, Check, X, Plus, Trash, Pencil,
  CaretLeft, CaretRight, CheckCircle, XCircle, Warning, Eye,
  MapPin, DeviceMobile, Clock, Phone, Envelope, User,
  FloppyDisk, List, Buildings, UserCircle, Camera, Copy,
  WifiHigh, Desktop, Timer, MapTrifold, DotsSixVertical, TextT,
  SignOut, UserCircleCheck, ArrowLeft, Robot, Fingerprint,
  Info, Image as ImageIcon, CheckSquare, Square, Trash3
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

// Types
interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  source?: 'sales' | 'pics' | 'campaigns' | 'custom';
}

interface Campaign {
  id: string;
  name: string;
  code: string;
  fee_per_activation: number;
  fraud_rules: FraudRuleConfig;
  allowed_regions: Region[];
  required_evidence: EvidenceItem[];
  form_fields: FormField[];
  is_active: boolean;
  created_at: string;
}

interface EvidenceItem {
  id: string;
  label: string;
  required: boolean;
  example?: string; // URL to example image
}

interface FraudRuleConfig {
  // Evidence requirements
  require_screenshot_download: boolean;
  require_screenshot_register: boolean;
  require_screenshot_rating: boolean;
  require_gps: boolean;
  max_image_size_mb: number;
  resize_images: boolean;

  // Duplicate checks (Customer data)
  check_duplicate_phone: boolean;
  check_duplicate_name: boolean;
  check_duplicate_email: boolean;

  // Device/IP checks (Sales device fraud)
  check_duplicate_ip: boolean;
  max_submissions_per_ip_per_hour: number;

  check_duplicate_device: boolean;
  max_submissions_per_device_per_day: number;

  // Location checks
  check_gps_location: boolean;
  check_duplicate_location: boolean;
  max_same_location_per_day: number;

  // Velocity checks
  check_submission_velocity: boolean;
  min_seconds_between_submissions: number;
}

interface Region {
  name: string;
  lat: number;
  lng: number;
  radius: number;
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

// Default fraud rules with explanations
const DEFAULT_FRAUD_RULES: FraudRuleConfig = {
  // Evidence
  require_screenshot_download: true,
  require_screenshot_register: true,
  require_screenshot_rating: true,
  require_gps: true,
  max_image_size_mb: 5,
  resize_images: true,

  // Customer duplicates (Critical - blocks if found)
  check_duplicate_phone: true,
  check_duplicate_name: true,
  check_duplicate_email: true,

  // Device/IP (Warning - flags for review)
  check_duplicate_ip: true,
  max_submissions_per_ip_per_hour: 5,

  check_duplicate_device: true,
  max_submissions_per_device_per_day: 20,

  // Location
  check_gps_location: false,
  check_duplicate_location: true,
  max_same_location_per_day: 10,

  // Velocity (Robot detection)
  check_submission_velocity: true,
  min_seconds_between_submissions: 30,
};

// Fraud rule explanations
const FRAUD_RULE_EXPLANATIONS: Record<string, { title: string; description: string; severity: 'critical' | 'high' | 'medium' | 'low' }> = {
  require_screenshot_download: {
    title: 'Screenshot Download Wajib',
    description: 'Customer wajib upload screenshot sebagai bukti download aplikasi/product',
    severity: 'high'
  },
  require_screenshot_register: {
    title: 'Screenshot Registrasi Wajib',
    description: 'Customer wajib upload screenshot halaman registrasi/account creation',
    severity: 'high'
  },
  require_screenshot_rating: {
    title: 'Screenshot Rating/Review Wajib',
    description: 'Customer wajib upload screenshot bukti rating/review di app store',
    severity: 'medium'
  },
  require_gps: {
    title: 'GPS Location Wajib',
    description: 'Submission harus memiliki data GPS yang valid dari perangkat',
    severity: 'high'
  },
  max_image_size_mb: {
    title: 'Batas Ukuran Gambar',
    description: 'Maksimal ukuran file screenshot yang diupload (dalam MB)',
    severity: 'low'
  },
  resize_images: {
    title: 'Resize Otomatis Gambar',
    description: 'Gambar akan diresize otomatis jika melebihi batas ukuran untuk menghemat storage',
    severity: 'low'
  },
  check_duplicate_phone: {
    title: 'Cek HP Duplikat [CRITICAL]',
    description: 'BLOCK submission jika nomor HP customer sudah terdaftar di campaign ini. Ini mencegah satu orang membuat banyak submission.',
    severity: 'critical'
  },
  check_duplicate_name: {
    title: 'Cek Nama Duplikat [CRITICAL]',
    description: 'BLOCK submission jika nama customer sudah terdaftar. Digunakan sebagai backup check selain phone.',
    severity: 'critical'
  },
  check_duplicate_email: {
    title: 'Cek Email Duplikat [CRITICAL]',
    description: 'BLOCK submission jika email customer sudah terdaftar di campaign ini.',
    severity: 'critical'
  },
  check_duplicate_ip: {
    title: 'Cek IP Duplikat [WARNING]',
    description: 'FLAG submission jika IP address yang digunakan sudah pernah submit customer lain. Bisa menandakan device farm.',
    severity: 'medium'
  },
  max_submissions_per_ip_per_hour: {
    title: 'Max Submission/IP/Jam',
    description: 'BLOCK jika lebih dari X submission dari IP yang sama dalam 1 jam. Cegah spam dari satu sumber.',
    severity: 'high'
  },
  check_duplicate_device: {
    title: 'Cek Device Duplikat [WARNING]',
    description: 'FLAG submission jika device yang sama digunakan untuk customer berbeda. Tandai device farm.',
    severity: 'medium'
  },
  max_submissions_per_device_per_day: {
    title: 'Max Submission/Device/Hari',
    description: 'BLOCK jika lebih dari X submission dari device yang sama dalam 24 jam.',
    severity: 'high'
  },
  check_gps_location: {
    title: 'Validasi Area GPS',
    description: 'Cek apakah GPS location berada dalam area yang diizinkan (allowed_regions). Nonaktifkan jika tidak perlu.',
    severity: 'low'
  },
  check_duplicate_location: {
    title: 'Cek Lokasi GPS Sama [WARNING]',
    description: 'FLAG jika banyak customer berbeda dari lokasi GPS yang persis sama. Tandai GPS fabrication.',
    severity: 'medium'
  },
  max_same_location_per_day: {
    title: 'Max Same Location/Hari',
    description: 'BLOCK jika lebih dari X submission dari lokasi GPS yang sama dalam 24 jam.',
    severity: 'high'
  },
  check_submission_velocity: {
    title: 'Cek Kecepatan Submit [ROBOT]',
    description: 'FLAG submission yang terlalu cepat (dibawah X detik). Kemungkinan bot atau auto-fill.',
    severity: 'medium'
  },
  min_seconds_between_submissions: {
    title: 'Min Detik Antara Submission',
    description: 'Minimum waktu yang harus dilewati antar submission. Cegah automated submissions.',
    severity: 'medium'
  },
};

// Evidence examples (placeholder URLs - in production use actual example images)
const EVIDENCE_EXAMPLES = [
  { id: 'download', label: 'Screenshot Download', example: 'https://placehold.co/400x700/2563eb/white?text=Screenshot+Download' },
  { id: 'register', label: 'Screenshot Registrasi', example: 'https://placehold.co/400x700/059669/white?text=Screenshot+Registrasi' },
  { id: 'rating', label: 'Screenshot Rating', example: 'https://placehold.co/400x700/d97706/white?text=Screenshot+Rating' },
];

// Default evidence items
const DEFAULT_EVIDENCE: EvidenceItem[] = [
  { id: 'download', label: 'Screenshot Download', required: true },
  { id: 'register', label: 'Screenshot Registrasi', required: true },
  { id: 'rating', label: 'Screenshot Rating/Review', required: true },
];

// Default form fields for new campaigns
const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'sales', name: 'sales_id', label: 'Sales', type: 'select', required: true, source: 'sales', placeholder: 'Pilih Sales' },
  { id: 'pic', name: 'pic_id', label: 'PIC', type: 'select', required: true, source: 'pics', placeholder: 'Pilih PIC' },
  { id: 'customer_name', name: 'customer_name', label: 'Nama Customer', type: 'text', required: true, placeholder: 'Nama lengkap customer' },
  { id: 'customer_email', name: 'customer_email', label: 'Email Customer', type: 'email', required: false, placeholder: 'email@domain.com' },
  { id: 'customer_phone', name: 'customer_phone', label: 'No. Telepon Customer', type: 'tel', required: true, placeholder: '08xxxxxxxxxx' },
];

// Tab types
type TabType = 'campaigns' | 'sales' | 'pics' | 'settings';

// Tab interface for campaign creation
interface CampaignFormData {
  id?: string;
  name: string;
  code: string;
  fee_per_activation: number;
  fraud_rules: FraudRuleConfig;
  required_evidence: EvidenceItem[];
  form_fields: FormField[];
  is_active: boolean;
}

export default function SuperAdminPage() {
  // State
  const [activeTab, setActiveTab] = React.useState<TabType>('campaigns');
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [salesList, setSalesList] = React.useState<SalesPerson[]>([]);
  const [picsList, setPicsList] = React.useState<PIC[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Full page campaign editor
  const [showFullEditor, setShowFullEditor] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<CampaignFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Simple modals for sales/PIC
  const [editingSales, setEditingSales] = React.useState<SalesPerson | null>(null);
  const [editingPic, setEditingPic] = React.useState<PIC | null>(null);
  const [showSimpleModal, setShowSimpleModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'sales' | 'pic'>('sales');

  // Expanded fraud rule explanations
  const [expandedRules, setExpandedRules] = React.useState<Set<string>>(new Set());

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

  // Toggle rule explanation
  const toggleRule = (ruleKey: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleKey)) {
      newExpanded.delete(ruleKey);
    } else {
      newExpanded.add(ruleKey);
    }
    setExpandedRules(newExpanded);
  };

  // Open full page campaign editor
  const openCampaignEditor = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        fee_per_activation: campaign.fee_per_activation,
        fraud_rules: { ...DEFAULT_FRAUD_RULES, ...campaign.fraud_rules },
        required_evidence: [...campaign.required_evidence || DEFAULT_EVIDENCE],
        form_fields: [...campaign.form_fields || DEFAULT_FORM_FIELDS],
        is_active: campaign.is_active,
      });
    } else {
      setEditingCampaign({
        name: '',
        code: '',
        fee_per_activation: 5000,
        fraud_rules: { ...DEFAULT_FRAUD_RULES },
        required_evidence: [...DEFAULT_EVIDENCE],
        form_fields: [...DEFAULT_FORM_FIELDS],
        is_active: true,
      });
    }
    setShowFullEditor(true);
  };

  // Save campaign
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
        setShowFullEditor(false);
        setEditingCampaign(null);
      } else {
        const err = await res.json();
        alert('Gagal menyimpan: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving campaign');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete campaign
  const deleteCampaign = async (id: string) => {
    if (!confirm('Yakin hapus campaign ini?')) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Open simple modal for sales/PIC
  const openSimpleModal = (type: 'sales' | 'pic', item?: SalesPerson | PIC) => {
    setModalType(type);
    if (type === 'sales') {
      setEditingSales(item ? { id: item.id, name: item.name, phone: item.phone, is_active: item.is_active } : { id: '', name: '', phone: '', is_active: true });
    } else {
      setEditingPic(item ? { id: item.id, name: item.name, phone: item.phone, is_active: item.is_active } : { id: '', name: '', phone: '', is_active: true });
    }
    setShowSimpleModal(true);
  };

  // Save sales
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
        setShowSimpleModal(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save PIC
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
        setShowSimpleModal(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete sales/PIC
  const deleteItem = async (type: 'sales' | 'pics', id: string) => {
    if (!confirm('Yakin hapus?')) return;
    try {
      await fetch(`/api/master-data/${type}/${id}`, { method: 'DELETE' });
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

  // =====================================================
  // FULL PAGE CAMPAIGN EDITOR
  // =====================================================
  if (showFullEditor && editingCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setShowFullEditor(false)}>
                  <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {editingCampaign.id ? 'Edit Campaign' : 'Create Campaign'}
                  </h1>
                  <p className="text-sm text-slate-500">Configure fraud rules, evidence requirements & form fields</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setShowFullEditor(false)}>Cancel</Button>
                <Button onClick={saveCampaign} isLoading={isSaving} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <FloppyDisk size={18} className="mr-2" /> Save Campaign
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Basic Info */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Buildings size={20} className="text-blue-600" />
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Campaign Name *</label>
                  <Input
                    value={editingCampaign.name}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                    placeholder="FIFGO Campaign"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Campaign Code *</label>
                  <Input
                    value={editingCampaign.code}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, code: e.target.value.toUpperCase() })}
                    placeholder="FIFGO"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Fee per Activation (IDR)</label>
                  <Input
                    type="number"
                    value={editingCampaign.fee_per_activation}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, fee_per_activation: parseInt(e.target.value) || 0 })}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCampaign.is_active}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, is_active: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium">Campaign Active</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Requirements */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Camera size={20} className="text-purple-600" />
                Evidence Requirements
                <Badge className="ml-2 bg-purple-100 text-purple-700">{editingCampaign.required_evidence.length} items</Badge>
              </h2>
              <p className="text-sm text-slate-500 mb-4">Pilih screenshot apa saja yang wajib diupload customer saat submission</p>

              {/* Evidence Examples Preview */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                {EVIDENCE_EXAMPLES.map((ex) => (
                  <div key={ex.id} className="text-center">
                    <div className="w-full aspect-[3/4] bg-slate-200 rounded-lg overflow-hidden mb-2">
                      <img src={ex.example} alt={ex.label} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{ex.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {editingCampaign.required_evidence.map((evidence, index) => (
                  <div key={evidence.id || index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <button
                      onClick={() => {
                        const newEvidence = [...editingCampaign.required_evidence];
                        newEvidence[index] = { ...evidence, required: !evidence.required };
                        setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                      }}
                      className="flex-shrink-0"
                    >
                      {evidence.required ? (
                        <CheckSquare size={24} className="text-emerald-600" weight="fill" />
                      ) : (
                        <Square size={24} className="text-slate-400" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={evidence.label}
                      onChange={(e) => {
                        const newEvidence = [...editingCampaign.required_evidence];
                        newEvidence[index] = { ...evidence, label: e.target.value };
                        setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newEvidence = editingCampaign.required_evidence.filter((_, i) => i !== index);
                        setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                      }}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash3 size={18} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newEvidence = [...editingCampaign.required_evidence, { id: `evidence_${Date.now()}`, label: 'New Evidence', required: true }];
                    setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
                  }}
                  className="w-full border-dashed"
                >
                  <Plus size={18} className="mr-2" /> Tambah Evidence
                </Button>
              </div>

              {/* Image Size Limit */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Image Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Max Image Size (MB)</label>
                    <Input
                      type="number"
                      value={editingCampaign.fraud_rules.max_image_size_mb}
                      onChange={(e) => setEditingCampaign({
                        ...editingCampaign,
                        fraud_rules: { ...editingCampaign.fraud_rules, max_image_size_mb: parseInt(e.target.value) || 5 }
                      })}
                      className="border-slate-200"
                    />
                    <p className="text-xs text-slate-500">Default: 5MB per image</p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCampaign.fraud_rules.resize_images}
                        onChange={(e) => setEditingCampaign({
                          ...editingCampaign,
                          fraud_rules: { ...editingCampaign.fraud_rules, resize_images: e.target.checked }
                        })}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <p className="font-semibold text-slate-700">Auto Resize Images</p>
                        <p className="text-xs text-slate-500">Resize images that exceed max size</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Rules */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-red-600" />
                Fraud Detection Rules
                <Badge className="ml-2 bg-red-100 text-red-700">Advanced v2</Badge>
              </h2>

              {/* Severity Legend */}
              <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-xs font-semibold text-slate-700">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500" />
                  <span className="text-xs font-semibold text-slate-700">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Low</span>
                </div>
              </div>

              {/* Customer Data Checks */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <User size={16} className="text-red-600" />
                  Customer Data Checks (Critical)
                </h3>
                <div className="space-y-2">
                  {(['check_duplicate_phone', 'check_duplicate_name', 'check_duplicate_email'] as const).map((ruleKey) => {
                    const explanation = FRAUD_RULE_EXPLANATIONS[ruleKey];
                    const isExpanded = expandedRules.has(ruleKey);
                    return (
                      <div key={ruleKey} className="border border-red-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 p-4 bg-red-50/50">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules[ruleKey]}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, [ruleKey]: e.target.checked }
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{explanation.title}</span>
                              <Badge className="bg-red-100 text-red-700 text-xs">BLOCK</Badge>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleRule(ruleKey)}
                            className={cn('p-2 rounded-lg transition-colors', isExpanded ? 'bg-red-200' : 'bg-red-100 hover:bg-red-200')}
                          >
                            <Info size={18} className="text-red-700" />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-red-200">
                            <p className="text-sm text-slate-600">{explanation.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device/IP Checks */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <DeviceMobile size={16} className="text-orange-600" />
                  Device & IP Checks (High Warning)
                </h3>
                <div className="space-y-2">
                  {(['check_duplicate_ip', 'check_duplicate_device'] as const).map((ruleKey) => {
                    const explanation = FRAUD_RULE_EXPLANATIONS[ruleKey];
                    const isExpanded = expandedRules.has(ruleKey);
                    const isMaxRule = ruleKey === 'check_duplicate_ip';
                    return (
                      <div key={ruleKey} className="border border-orange-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 p-4 bg-orange-50/50">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules[ruleKey]}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, [ruleKey]: e.target.checked }
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{explanation.title}</span>
                              <Badge className="bg-orange-100 text-orange-700 text-xs">FLAG</Badge>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleRule(ruleKey)}
                            className={cn('p-2 rounded-lg transition-colors', isExpanded ? 'bg-orange-200' : 'bg-orange-100 hover:bg-orange-200')}
                          >
                            <Info size={18} className="text-orange-700" />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-orange-200">
                            <p className="text-sm text-slate-600 mb-3">{explanation.description}</p>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-slate-600">Max per hour:</label>
                              <Input
                                type="number"
                                value={editingCampaign.fraud_rules.max_submissions_per_ip_per_hour}
                                onChange={(e) => setEditingCampaign({
                                  ...editingCampaign,
                                  fraud_rules: { ...editingCampaign.fraud_rules, max_submissions_per_ip_per_hour: parseInt(e.target.value) || 5 }
                                })}
                                className="w-24 border-slate-200"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location Checks */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-purple-600" />
                  Location Checks
                </h3>
                <div className="space-y-2">
                  {(['require_gps', 'check_duplicate_location'] as const).map((ruleKey) => {
                    const explanation = FRAUD_RULE_EXPLANATIONS[ruleKey];
                    const isExpanded = expandedRules.has(ruleKey);
                    return (
                      <div key={ruleKey} className="border border-purple-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 p-4 bg-purple-50/50">
                          <input
                            type="checkbox"
                            checked={editingCampaign.fraud_rules[ruleKey]}
                            onChange={(e) => setEditingCampaign({
                              ...editingCampaign,
                              fraud_rules: { ...editingCampaign.fraud_rules, [ruleKey]: e.target.checked }
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{explanation.title}</span>
                              <Badge className="bg-purple-100 text-purple-700 text-xs">{ruleKey === 'require_gps' ? 'REQUIRED' : 'FLAG'}</Badge>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleRule(ruleKey)}
                            className={cn('p-2 rounded-lg transition-colors', isExpanded ? 'bg-purple-200' : 'bg-purple-100 hover:bg-purple-200')}
                          >
                            <Info size={18} className="text-purple-700" />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-purple-200">
                            <p className="text-sm text-slate-600">{explanation.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Velocity / Robot Checks */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Robot size={16} className="text-amber-600" />
                  Robot Detection (Velocity)
                </h3>
                <div className="border border-amber-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={editingCampaign.fraud_rules.check_submission_velocity}
                      onChange={(e) => setEditingCampaign({
                        ...editingCampaign,
                        fraud_rules: { ...editingCampaign.fraud_rules, check_submission_velocity: e.target.checked }
                      })}
                      className="w-5 h-5 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">Enable Velocity Check</span>
                        <Badge className="bg-amber-100 text-amber-700 text-xs">FLAG</Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRule('check_submission_velocity')}
                      className={cn('p-2 rounded-lg transition-colors', expandedRules.has('check_submission_velocity') ? 'bg-amber-200' : 'bg-amber-100 hover:bg-amber-200')}
                    >
                      <Info size={18} className="text-amber-700" />
                    </button>
                  </div>
                  {expandedRules.has('check_submission_velocity') && (
                    <div className="p-4 bg-white border-t border-amber-200">
                      <p className="text-sm text-slate-600 mb-3">
                        Block submission yang terlalu cepat dari submission terakhir. Cegah automated/bot submissions.
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Min seconds between submissions:</label>
                        <Input
                          type="number"
                          value={editingCampaign.fraud_rules.min_seconds_between_submissions}
                          onChange={(e) => setEditingCampaign({
                            ...editingCampaign,
                            fraud_rules: { ...editingCampaign.fraud_rules, min_seconds_between_submissions: parseInt(e.target.value) || 30 }
                          })}
                          className="w-24 border-slate-200"
                        />
                        <span className="text-sm text-slate-500">seconds</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <TextT size={20} className="text-emerald-600" />
                Form Fields
              </h2>
              <p className="text-sm text-slate-500 mb-4">Konfigurasi field apa saja yang muncul di form submission</p>

              <div className="space-y-3">
                {editingCampaign.form_fields.map((field, index) => (
                  <div key={field.id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <DotsSixVertical size={16} className="text-slate-400 cursor-grab" />
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const newFields = [...editingCampaign.form_fields];
                          newFields[index] = { ...field, type: e.target.value as FormField['type'] };
                          setEditingCampaign({ ...editingCampaign, form_fields: newFields });
                        }}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="select">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...editingCampaign.form_fields];
                          newFields[index] = {
                            ...field,
                            label: e.target.value,
                            name: e.target.value.toLowerCase().replace(/\s+/g, '_')
                          };
                          setEditingCampaign({ ...editingCampaign, form_fields: newFields });
                        }}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Field label..."
                      />
                      <label className="flex items-center gap-1 text-sm text-slate-500 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const newFields = [...editingCampaign.form_fields];
                            newFields[index] = { ...field, required: e.target.checked };
                            setEditingCampaign({ ...editingCampaign, form_fields: newFields });
                          }}
                          className="rounded"
                        />
                        Required
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFields = editingCampaign.form_fields.filter((_, i) => i !== index);
                          setEditingCampaign({ ...editingCampaign, form_fields: newFields });
                        }}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash3 size={18} />
                      </Button>
                    </div>
                    {field.type === 'select' && (
                      <div className="pl-8">
                        <input
                          type="text"
                          value={field.options?.map(o => o.label).join(', ') || ''}
                          onChange={(e) => {
                            const newFields = [...editingCampaign.form_fields];
                            const labels = e.target.value.split(',').map(l => l.trim()).filter(Boolean);
                            newFields[index] = {
                              ...field,
                              options: labels.map(l => ({ label: l, value: l.toLowerCase().replace(/\s+/g, '_') }))
                            };
                            setEditingCampaign({ ...editingCampaign, form_fields: newFields });
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Options (comma separated): Option 1, Option 2"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newFields = [...editingCampaign.form_fields, {
                      id: `field_${Date.now()}`,
                      name: `custom_field_${editingCampaign.form_fields.length + 1}`,
                      label: 'Custom Field',
                      type: 'text' as const,
                      required: false,
                      placeholder: ''
                    }];
                    setEditingCampaign({ ...editingCampaign, form_fields: newFields });
                  }}
                  className="w-full border-dashed"
                >
                  <Plus size={18} className="mr-2" /> Tambah Field
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN SUPERADMIN PAGE
  // =====================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-[180px] h-auto mb-4">
              <Image src="/Logo Rectoverso.png" alt="RECTOVERSO" width={180} height={72} className="w-full h-auto" priority />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Super Admin</h1>
            <p className="text-sm text-slate-500">Pengaturan Campaign & Master Data</p>
          </div>

          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                <CaretLeft size={16} className="mr-1" /> Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <SignOut size={16} className="mr-2" /> Logout
            </Button>
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
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 shadow-sm',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                )}
              >
                <Icon size={18} />
                {tab.label}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold',
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
          <Card className="bg-white"><CardContent className="p-12 text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading...</p>
          </CardContent></Card>
        ) : (
          <>
            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openCampaignEditor()} className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
                    <Plus size={18} className="mr-2" /> Create Campaign
                  </Button>
                </div>

                {campaigns.length === 0 ? (
                  <Card className="bg-white"><CardContent className="p-12 text-center">
                    <Flag size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">Belum ada campaign</p>
                    <p className="text-sm text-slate-400">Klik "Create Campaign" untuk membuat</p>
                  </CardContent></Card>
                ) : (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-slate-900">{campaign.name}</h3>
                              <Badge className={campaign.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                                {campaign.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-700">Rp {campaign.fee_per_activation.toLocaleString()}</Badge>
                            </div>
                            <p className="text-sm text-slate-500 mb-3 font-mono">{campaign.code}</p>

                            {/* Fraud Rules Summary */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg font-semibold">Fraud Rules:</span>
                              {campaign.fraud_rules?.check_duplicate_phone && (
                                <Badge variant="outline" className="text-xs bg-red-50 border-red-200">Dup Phone</Badge>
                              )}
                              {campaign.fraud_rules?.check_duplicate_name && (
                                <Badge variant="outline" className="text-xs bg-red-50 border-red-200">Dup Name</Badge>
                              )}
                              {campaign.fraud_rules?.check_duplicate_email && (
                                <Badge variant="outline" className="text-xs bg-red-50 border-red-200">Dup Email</Badge>
                              )}
                              {campaign.fraud_rules?.require_gps && (
                                <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">Require GPS</Badge>
                              )}
                              {campaign.fraud_rules?.check_submission_velocity && (
                                <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200">Velocity</Badge>
                              )}
                            </div>

                            {/* Evidence Required */}
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">Evidence:</span>
                              {(campaign.required_evidence || []).map((evidence: EvidenceItem, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs bg-purple-50 border-purple-200">{evidence.label}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={() => openCampaignEditor(campaign)} className="bg-gradient-to-r from-blue-600 to-blue-700">
                              <Pencil size={16} className="mr-1" /> Edit
                            </Button>
                            <Button variant="outline" onClick={() => deleteCampaign(campaign.id)} className="text-red-600 hover:bg-red-50 border-red-200">
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
                  <Button onClick={() => openSimpleModal('sales')} className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Plus size={18} className="mr-2" /> Tambah Sales
                  </Button>
                </div>

                {salesList.length === 0 ? (
                  <Card className="bg-white"><CardContent className="p-12 text-center">
                    <User size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada data sales</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {salesList.map((sales) => (
                      <Card key={sales.id} className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {sales.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">{sales.name}</h3>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Phone size={12} /> {sales.phone || '-'}
                                  </p>
                                </div>
                              </div>
                              <Badge className={sales.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-slate-100 text-slate-500 mt-2'}>
                                {sales.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openSimpleModal('sales', sales)}>
                                <Pencil size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteItem('sales', sales.id)} className="text-red-600">
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
                  <Button onClick={() => openSimpleModal('pic')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus size={18} className="mr-2" /> Tambah PIC
                  </Button>
                </div>

                {picsList.length === 0 ? (
                  <Card className="bg-white"><CardContent className="p-12 text-center">
                    <UserCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Belum ada data PIC</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {picsList.map((pic) => (
                      <Card key={pic.id} className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                  {pic.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">{pic.name}</h3>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Phone size={12} /> {pic.phone || '-'}
                                  </p>
                                </div>
                              </div>
                              <Badge className={pic.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-slate-100 text-slate-500 mt-2'}>
                                {pic.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openSimpleModal('pic', pic)}>
                                <Pencil size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteItem('pics', pic.id)} className="text-red-600">
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
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Gear size={20} className="text-slate-600" />
                    System Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Shield size={18} className="text-blue-600" />
                        API Configuration
                      </h3>
                      <p className="text-sm text-slate-600">Supabase URL dan API Key dikonfigurasi melalui environment variables.</p>
                      <p className="text-xs text-slate-400 mt-2">NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <ImageIcon size={18} className="text-purple-600" />
                        Storage
                      </h3>
                      <p className="text-sm text-slate-600">Screenshot diupload ke Supabase Storage bucket 'screenshots'.</p>
                      <p className="text-xs text-slate-400 mt-2">Bucket harus diset Public: YES</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Robot size={18} className="text-red-600" />
                        Fraud Detection v2
                      </h3>
                      <p className="text-sm text-slate-600">Rules fraud detection dapat dikonfigurasi per campaign. Versi ini termasuk bot detection dan device fingerprinting.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Simple Modal for Sales/PIC */}
      {showSimpleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSimpleModal(false)}>
          <Card className="bg-white max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {modalType === 'sales' ? (editingSales?.id ? 'Edit Sales' : 'Tambah Sales') : (editingPic?.id ? 'Edit PIC' : 'Tambah PIC')}
              </h2>

              {modalType === 'sales' && editingSales && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nama *</label>
                    <Input
                      value={editingSales.name}
                      onChange={(e) => setEditingSales({ ...editingSales, name: e.target.value })}
                      placeholder="Nama lengkap"
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">No. Telepon</label>
                    <Input
                      value={editingSales.phone}
                      onChange={(e) => setEditingSales({ ...editingSales, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="border-slate-200"
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSales.is_active}
                      onChange={(e) => setEditingSales({ ...editingSales, is_active: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span>Active</span>
                  </label>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowSimpleModal(false)} className="flex-1">Batal</Button>
                    <Button onClick={saveSales} isLoading={isSaving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">Simpan</Button>
                  </div>
                </div>
              )}

              {modalType === 'pic' && editingPic && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nama *</label>
                    <Input
                      value={editingPic.name}
                      onChange={(e) => setEditingPic({ ...editingPic, name: e.target.value })}
                      placeholder="Nama lengkap"
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">No. Telepon</label>
                    <Input
                      value={editingPic.phone}
                      onChange={(e) => setEditingPic({ ...editingPic, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="border-slate-200"
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPic.is_active}
                      onChange={(e) => setEditingPic({ ...editingPic, is_active: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span>Active</span>
                  </label>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowSimpleModal(false)} className="flex-1">Batal</Button>
                    <Button onClick={savePic} isLoading={isSaving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">Simpan</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
