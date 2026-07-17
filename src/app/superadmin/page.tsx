'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gear, Users, Flag, Shield, Check, X, Plus, Trash, Pencil,
  CaretLeft, CheckCircle, XCircle, Warning, Eye,
  MapPin, DeviceMobile, Clock, Phone, Envelope, User,
  FloppyDisk, Buildings, UserCircle, Camera,
  SignOut, UserCircleCheck, ArrowLeft, Robot, Fingerprint,
  Info, Image as ImageIcon, CheckSquare, Square,
  Download, LinkSimple, ImageSquare, Upload, Globe,
  DotsSixVertical, ArrowsOutCardinal, CaretDown, EyeSlash,
  ToggleLeft, ToggleRight, Sliders, WarningCircle, CheckFat,
  ListPlus, PencilSimple, UserCirclePlus, ChartBar, ShieldCheck
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

interface FlexibleUrl {
  id: string;
  field_name: string;
  url: string;
}

interface Campaign {
  id: string;
  name: string;
  code: string;
  fee_per_activation: number;
  brand_logo_url?: string;
  flexible_urls?: FlexibleUrl[];
  fraud_rules: FraudRuleConfig;
  required_evidence: EvidenceItem[];
  form_fields: FormField[];
  is_active: boolean;
  created_at: string;
}

interface EvidenceItem {
  id: string;
  label: string;
  required: boolean;
}

interface FraudRuleConfig {
  // Evidence requirements
  require_screenshot_download: boolean;
  require_screenshot_register: boolean;
  require_screenshot_rating: boolean;
  require_gps: boolean;
  max_image_size_mb: number;
  resize_images: boolean;

  // Customer duplicate checks
  check_duplicate_phone: boolean;
  check_duplicate_name: boolean;
  check_duplicate_email: boolean;

  // Device/IP checks
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

const DEFAULT_FRAUD_RULES: FraudRuleConfig = {
  // Evidence
  require_screenshot_download: true,
  require_screenshot_register: true,
  require_screenshot_rating: true,
  require_gps: true,
  max_image_size_mb: 5,
  resize_images: true,

  // Customer
  check_duplicate_phone: true,
  check_duplicate_name: true,
  check_duplicate_email: true,

  // Device
  check_duplicate_ip: true,
  max_submissions_per_ip_per_hour: 5,
  check_duplicate_device: true,
  max_submissions_per_device_per_day: 20,

  // Location
  check_gps_location: false,
  check_duplicate_location: true,
  max_same_location_per_day: 10,

  // Velocity
  check_submission_velocity: true,
  min_seconds_between_submissions: 30,
};

const DEFAULT_EVIDENCE: EvidenceItem[] = [
  { id: 'download', label: 'Screenshot Download', required: true },
  { id: 'register', label: 'Screenshot Registrasi', required: true },
  { id: 'rating', label: 'Screenshot Rating/Review', required: true },
];

const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'sales', name: 'sales_id', label: 'Sales', type: 'select', required: true, source: 'sales', placeholder: 'Select Sales' },
  { id: 'pic', name: 'pic_id', label: 'PIC', type: 'select', required: true, source: 'pics', placeholder: 'Select PIC' },
  { id: 'customer_name', name: 'customer_name', label: 'Nama Customer', type: 'text', required: true, placeholder: 'Nama lengkap' },
  { id: 'customer_email', name: 'customer_email', label: 'Email', type: 'email', required: false, placeholder: 'email@example.com' },
  { id: 'customer_phone', name: 'customer_phone', label: 'No. HP', type: 'tel', required: true, placeholder: '08xxxxxxxxxx' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email Input' },
  { value: 'tel', label: 'Phone Input' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'checkbox', label: 'Checkbox' },
];

const FORM_FIELD_SOURCES = [
  { value: 'custom', label: 'Custom Input' },
  { value: 'sales', label: 'From Sales List' },
  { value: 'pics', label: 'From PIC List' },
  { value: 'campaigns', label: 'From Campaigns' },
];

type TabType = 'dashboard' | 'campaigns' | 'sales' | 'pics' | 'settings';

interface CampaignFormData {
  id?: string;
  name: string;
  code: string;
  fee_per_activation: number;
  brand_logo_url?: string;
  brand_logo_file?: File | null;
  flexible_urls: FlexibleUrl[];
  fraud_rules: FraudRuleConfig;
  required_evidence: EvidenceItem[];
  form_fields: FormField[];
  is_active: boolean;
}

// Toggle Switch Component
const Toggle = ({
  checked,
  onChange,
  label,
  description
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) => (
  <label className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
    <div className="flex-1">
      <p className="font-medium text-slate-900 text-sm">{label}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        checked ? 'bg-blue-600' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  </label>
);

// Section Card Component
const SectionCard = ({
  title,
  icon: Icon,
  color,
  children
}: {
  title: string;
  icon: any;
  color: string;
  children: React.ReactNode;
}) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <div className={cn('px-4 py-3 bg-gradient-to-r text-white', color)}>
      <div className="flex items-center gap-2">
        <Icon size={18} />
        <span className="font-semibold text-sm">{title}</span>
      </div>
    </div>
    <div className="bg-white p-2">
      {children}
    </div>
  </div>
);

// Alert Badge
const AlertBadge = ({ type, count }: { type: 'warning' | 'error' | 'info'; count?: number }) => {
  if (count === 0) return null;
  return (
    <span className={cn(
      'ml-2 px-2 py-0.5 rounded-full text-xs font-bold',
      type === 'warning' ? 'bg-amber-100 text-amber-700' :
      type === 'error' ? 'bg-red-100 text-red-700' :
      'bg-blue-100 text-blue-700'
    )}>
      {count || '!'}
    </span>
  );
};

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>('dashboard');
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [salesList, setSalesList] = React.useState<SalesPerson[]>([]);
  const [picsList, setPicsList] = React.useState<PIC[]>([]);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [campaignFilter, setCampaignFilter] = React.useState<string>('all');
  const [salesFilter, setSalesFilter] = React.useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null);
  const [showFullEditor, setShowFullEditor] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<CampaignFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingSales, setEditingSales] = React.useState<SalesPerson | null>(null);
  const [editingPic, setEditingPic] = React.useState<PIC | null>(null);
  const [showSimpleModal, setShowSimpleModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'sales' | 'pic'>('sales');

  // Fraud rules open/close state
  const [fraudRulesOpen, setFraudRulesOpen] = React.useState(true);
  const [evidenceOpen, setEvidenceOpen] = React.useState(true);
  const [formFieldsOpen, setFormFieldsOpen] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campRes, masterRes, subRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/master-data?type=all'),
        fetch('/api/submissions?limit=1000'),
      ]);
      const campData = await campRes.json();
      const masterData = await masterRes.json();
      const subData = await subRes.json();

      if (campData.data) setCampaigns(campData.data);
      if (masterData.sales) setSalesList(masterData.sales);
      if (masterData.pics) setPicsList(masterData.pics);
      if (subData.data) setSubmissions(subData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Hapus submission ini?')) return;
    try {
      await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openCampaignEditor = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        fee_per_activation: campaign.fee_per_activation,
        brand_logo_url: campaign.brand_logo_url || '',
        brand_logo_file: null,
        flexible_urls: campaign.flexible_urls || [],
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
        brand_logo_url: '',
        brand_logo_file: null,
        flexible_urls: [],
        fraud_rules: { ...DEFAULT_FRAUD_RULES },
        required_evidence: [...DEFAULT_EVIDENCE],
        form_fields: [...DEFAULT_FORM_FIELDS],
        is_active: true,
      });
    }
    setShowFullEditor(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCampaign) {
      setEditingCampaign({
        ...editingCampaign,
        brand_logo_file: file,
        brand_logo_url: URL.createObjectURL(file),
      });
    }
  };

  const saveCampaign = async () => {
    if (!editingCampaign?.name || !editingCampaign?.code) {
      alert('Name and Code are required!');
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editingCampaign.name);
      formData.append('code', editingCampaign.code);
      formData.append('fee_per_activation', editingCampaign.fee_per_activation.toString());
      formData.append('is_active', editingCampaign.is_active.toString());
      formData.append('fraud_rules', JSON.stringify(editingCampaign.fraud_rules));
      formData.append('required_evidence', JSON.stringify(editingCampaign.required_evidence));
      formData.append('form_fields', JSON.stringify(editingCampaign.form_fields));
      formData.append('flexible_urls', JSON.stringify(editingCampaign.flexible_urls || []));
      formData.append('allowed_regions', JSON.stringify([]));

      if (editingCampaign.brand_logo_file) {
        formData.append('brand_logo', editingCampaign.brand_logo_file);
      }
      if (editingCampaign.brand_logo_url && !editingCampaign.brand_logo_file) {
        formData.append('brand_logo_url', editingCampaign.brand_logo_url);
      }

      const method = editingCampaign.id ? 'PUT' : 'POST';
      const url = editingCampaign.id ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns';

      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        await loadData();
        setShowFullEditor(false);
        setEditingCampaign(null);
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openSimpleModal = (type: 'sales' | 'pic', item?: SalesPerson | PIC) => {
    setModalType(type);
    if (type === 'sales') {
      setEditingSales(item ? { id: item.id, name: item.name, phone: item.phone, is_active: item.is_active } : { id: '', name: '', phone: '', is_active: true });
    } else {
      setEditingPic(item ? { id: item.id, name: item.name, phone: item.phone, is_active: item.is_active } : { id: '', name: '', phone: '', is_active: true });
    }
    setShowSimpleModal(true);
  };

  const saveSales = async () => {
    if (!editingSales?.name) return;
    setIsSaving(true);
    try {
      const method = editingSales.id ? 'PUT' : 'POST';
      const url = editingSales.id ? `/api/master-data/sales/${editingSales.id}` : '/api/master-data/sales';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingSales) });
      if (res.ok) { await loadData(); setShowSimpleModal(false); }
    } catch (error) { console.error('Save error:', error); }
    finally { setIsSaving(false); }
  };

  const savePic = async () => {
    if (!editingPic?.name) return;
    setIsSaving(true);
    try {
      const method = editingPic.id ? 'PUT' : 'POST';
      const url = editingPic.id ? `/api/master-data/pics/${editingPic.id}` : '/api/master-data/pics';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPic) });
      if (res.ok) { await loadData(); setShowSimpleModal(false); }
    } catch (error) { console.error('Save error:', error); }
    finally { setIsSaving(false); }
  };

  const deleteItem = async (type: 'sales' | 'pics', id: string) => {
    try {
      await fetch(`/api/master-data/${type}/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) { console.error('Delete error:', error); }
  };

  // Quick Add/Edit Modal for Sales/PIC
  const [quickModalType, setQuickModalType] = React.useState<'sales' | 'pics'>('sales');
  const [quickEditItem, setQuickEditItem] = React.useState<SalesPerson | PIC | null>(null);
  const [showQuickModal, setShowQuickModal] = React.useState(false);

  const openQuickAddModal = (type: 'sales' | 'pics') => {
    setQuickModalType(type);
    setQuickEditItem(null);
    if (type === 'sales') {
      setEditingSales({ id: '', name: '', phone: '', is_active: true });
    } else {
      setEditingPic({ id: '', name: '', phone: '', is_active: true });
    }
    setShowQuickModal(true);
  };

  const openQuickEditModal = (type: 'sales' | 'pics', item: SalesPerson | PIC) => {
    setQuickModalType(type);
    setQuickEditItem(item);
    if (type === 'sales') {
      setEditingSales({ id: item.id, name: item.name, phone: item.phone, is_active: item.is_active });
    } else {
      setEditingPic({ id: item.id, name: item.name, phone: item.phone, is_active: item.is_active });
    }
    setShowQuickModal(true);
  };

  const saveQuickItem = async () => {
    setIsSaving(true);
    try {
      if (quickModalType === 'sales' && editingSales) {
        if (!editingSales.name) return;
        const method = editingSales.id ? 'PUT' : 'POST';
        const url = editingSales.id ? `/api/master-data/sales/${editingSales.id}` : '/api/master-data/sales';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingSales) });
        if (res.ok) { await loadData(); setShowQuickModal(false); }
      } else if (quickModalType === 'pics' && editingPic) {
        if (!editingPic.name) return;
        const method = editingPic.id ? 'PUT' : 'POST';
        const url = editingPic.id ? `/api/master-data/pics/${editingPic.id}` : '/api/master-data/pics';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPic) });
        if (res.ok) { await loadData(); setShowQuickModal(false); }
      }
    } catch (error) { console.error('Save error:', error); }
    finally { setIsSaving(false); }
  };

  // Add/Remove Form Field
  const addFormField = () => {
    if (!editingCampaign) return;
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
    };
    setEditingCampaign({
      ...editingCampaign,
      form_fields: [...editingCampaign.form_fields, newField],
    });
  };

  const updateFormField = (index: number, updates: Partial<FormField>) => {
    if (!editingCampaign) return;
    const newFields = [...editingCampaign.form_fields];
    newFields[index] = { ...newFields[index], ...updates };
    // Auto-set name from label if empty
    if (updates.label && !newFields[index].name) {
      newFields[index].name = updates.label.toLowerCase().replace(/\s+/g, '_');
    }
    setEditingCampaign({ ...editingCampaign, form_fields: newFields });
  };

  const removeFormField = (index: number) => {
    if (!editingCampaign) return;
    const newFields = editingCampaign.form_fields.filter((_, i) => i !== index);
    setEditingCampaign({ ...editingCampaign, form_fields: newFields });
  };

  // Add/Remove Evidence
  const addEvidence = () => {
    if (!editingCampaign) return;
    setEditingCampaign({
      ...editingCampaign,
      required_evidence: [...editingCampaign.required_evidence, { id: `ev_${Date.now()}`, label: '', required: true }],
    });
  };

  const updateEvidence = (index: number, updates: Partial<EvidenceItem>) => {
    if (!editingCampaign) return;
    const newEvidence = [...editingCampaign.required_evidence];
    newEvidence[index] = { ...newEvidence[index], ...updates };
    // Auto-set id from label if empty
    if (updates.label && !newEvidence[index].id.includes('_')) {
      newEvidence[index].id = updates.label.toLowerCase().replace(/\s+/g, '_');
    }
    setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
  };

  const removeEvidence = (index: number) => {
    if (!editingCampaign) return;
    const newEvidence = editingCampaign.required_evidence.filter((_, i) => i !== index);
    setEditingCampaign({ ...editingCampaign, required_evidence: newEvidence });
  };

  // Count fraud rules enabled
  const countFraudRulesEnabled = () => {
    if (!editingCampaign) return { enabled: 0, total: 0 };
    const rules = editingCampaign.fraud_rules;
    const checks = [
      rules.require_screenshot_download,
      rules.require_screenshot_register,
      rules.require_screenshot_rating,
      rules.require_gps,
      rules.check_duplicate_phone,
      rules.check_duplicate_name,
      rules.check_duplicate_email,
      rules.check_duplicate_ip,
      rules.check_duplicate_device,
      rules.check_duplicate_location,
      rules.check_submission_velocity,
    ];
    return { enabled: checks.filter(Boolean).length, total: checks.length };
  };

  // =====================================================
  // FULL PAGE CAMPAIGN EDITOR
  // =====================================================
  if (showFullEditor && editingCampaign) {
    const rulesCount = countFraudRulesEnabled();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setShowFullEditor(false)}>
                  <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {editingCampaign.id ? 'Edit Campaign' : 'Create Campaign'}
                  </h1>
                  <p className="text-sm text-slate-500">Configure all settings</p>
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

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Basic Info */}
          <SectionCard title="Basic Information" icon={Buildings} color="from-blue-500 to-blue-600">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Campaign Name *</label>
                <Input
                  value={editingCampaign.name}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                  placeholder="FIFGO Campaign"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Campaign Code *</label>
                <Input
                  value={editingCampaign.code}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, code: e.target.value.toUpperCase() })}
                  placeholder="FIFGO"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Fee per Activation (IDR)</label>
                <Input
                  type="number"
                  value={editingCampaign.fee_per_activation}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, fee_per_activation: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <Toggle
                  checked={editingCampaign.is_active}
                  onChange={(v) => setEditingCampaign({ ...editingCampaign, is_active: v })}
                  label={editingCampaign.is_active ? 'Active' : 'Inactive'}
                  description="Enable to make campaign available"
                />
              </div>
            </div>
          </SectionCard>

          {/* Brand Logo */}
          <SectionCard title="Brand Logo" icon={ImageSquare} color="from-pink-500 to-pink-600">
            <div className="space-y-4">
              {!editingCampaign.brand_logo_url ? (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Click to upload logo</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <img src={editingCampaign.brand_logo_url} alt="Logo" className="h-16 w-auto object-contain" />
                  <Button variant="ghost" size="sm" onClick={() => setEditingCampaign({ ...editingCampaign, brand_logo_url: '', brand_logo_file: null })} className="text-red-500">
                    <Trash size={16} className="mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Evidence Requirements */}
          <SectionCard title="Evidence Requirements" icon={Camera} color="from-purple-500 to-purple-600">
            <div className="space-y-3">
              {editingCampaign.required_evidence.map((evidence, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <button
                    onClick={() => updateEvidence(index, { required: !evidence.required })}
                    className={evidence.required ? 'text-emerald-600' : 'text-slate-300'}
                  >
                    {evidence.required ? <CheckFat size={24} weight="fill" /> : <Square size={24} />}
                  </button>
                  <input
                    type="text"
                    value={evidence.label}
                    onChange={(e) => updateEvidence(index, { label: e.target.value })}
                    placeholder="Evidence label"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeEvidence(index)} className="text-red-500">
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addEvidence} className="w-full border-dashed">
                <Plus size={18} className="mr-2" /> Add Evidence Type
              </Button>
              <p className="text-xs text-slate-500 px-2">
                Evidence types are the screenshot uploads that partners need to submit
              </p>
            </div>
          </SectionCard>

          {/* Form Fields */}
          <SectionCard title="Form Fields" icon={Sliders} color="from-cyan-500 to-cyan-600">
            <div className="space-y-3">
              {editingCampaign.form_fields.map((field, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Field {index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeFormField(index)} className="text-red-500 h-6">
                      <Trash size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateFormField(index, { label: e.target.value })}
                      placeholder="Field Label"
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateFormField(index, { type: e.target.value as any })}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      {FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={field.source || 'custom'}
                      onChange={(e) => updateFormField(index, { source: e.target.value as any })}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      {FORM_FIELD_SOURCES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 px-3">
                      <button
                        onClick={() => updateFormField(index, { required: !field.required })}
                        className={field.required ? 'text-emerald-600' : 'text-slate-300'}
                      >
                        {field.required ? <CheckFat size={20} weight="fill" /> : <Square size={20} />}
                      </button>
                      <span className="text-xs text-slate-600">Required</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addFormField} className="w-full border-dashed">
                <Plus size={18} className="mr-2" /> Add Form Field
              </Button>
            </div>
          </SectionCard>

          {/* Quick Sales/PIC Manager */}
          <SectionCard title="Quick Sales & PIC Manager" icon={Users} color="from-emerald-500 to-teal-500">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Sales List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-blue-500" /> Sales Team
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => openQuickAddModal('sales')} className="text-emerald-600 h-7">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {salesList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">No sales data</p>
                  ) : (
                    salesList.slice(0, 5).map((sales) => (
                      <div key={sales.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {sales.name[0]}
                          </div>
                          <span className="text-slate-700">{sales.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openQuickEditModal('sales', sales)} className="p-1 hover:bg-blue-100 rounded text-blue-500">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteItem('sales', sales.id)} className="p-1 hover:bg-red-100 rounded text-red-500">
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {salesList.length > 5 && (
                    <p className="text-xs text-slate-400 text-center">+{salesList.length - 5} more</p>
                  )}
                </div>
              </div>

              {/* PIC List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <UserCircle size={16} className="text-purple-500" /> PIC Team
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => openQuickAddModal('pics')} className="text-emerald-600 h-7">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {picsList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">No PIC data</p>
                  ) : (
                    picsList.slice(0, 5).map((pic) => (
                      <div key={pic.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                            {pic.name[0]}
                          </div>
                          <span className="text-slate-700">{pic.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openQuickEditModal('pics', pic)} className="p-1 hover:bg-blue-100 rounded text-blue-500">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteItem('pics', pic.id)} className="p-1 hover:bg-red-100 rounded text-red-500">
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {picsList.length > 5 && (
                    <p className="text-xs text-slate-400 text-center">+{picsList.length - 5} more</p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Fraud Detection Rules */}
          <SectionCard title="Fraud Detection Rules" icon={Shield} color="from-rose-500 to-rose-600">
            <div className="space-y-2">
              {/* Evidence Requirements */}
              <div className="text-xs font-bold text-slate-500 uppercase px-2 pt-2">Evidence Requirements</div>
              <Toggle
                checked={editingCampaign.fraud_rules.require_screenshot_download}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, require_screenshot_download: v }
                })}
                label="Screenshot Download Required"
                description="Partner must upload download proof"
              />
              <Toggle
                checked={editingCampaign.fraud_rules.require_screenshot_register}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, require_screenshot_register: v }
                })}
                label="Screenshot Register Required"
                description="Partner must upload registration proof"
              />
              <Toggle
                checked={editingCampaign.fraud_rules.require_screenshot_rating}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, require_screenshot_rating: v }
                })}
                label="Screenshot Rating Required"
                description="Partner must upload rating/review proof"
              />
              <Toggle
                checked={editingCampaign.fraud_rules.require_gps}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, require_gps: v }
                })}
                label="GPS Location Required"
                description="Capture device GPS coordinates"
              />

              <div className="border-t border-slate-200 my-2" />

              {/* Duplicate Customer */}
              <div className="text-xs font-bold text-slate-500 uppercase px-2 pt-2">Duplicate Customer Detection</div>
              <Toggle
                checked={editingCampaign.fraud_rules.check_duplicate_phone}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_phone: v }
                })}
                label="Check Duplicate Phone"
                description="Block same phone number per campaign"
              />
              <Toggle
                checked={editingCampaign.fraud_rules.check_duplicate_name}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_name: v }
                })}
                label="Check Duplicate Name"
                description="Flag same customer name (different phone)"
              />
              <Toggle
                checked={editingCampaign.fraud_rules.check_duplicate_email}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_email: v }
                })}
                label="Check Duplicate Email"
                description="Flag same email address"
              />

              <div className="border-t border-slate-200 my-2" />

              {/* Device/IP */}
              <div className="text-xs font-bold text-slate-500 uppercase px-2 pt-2">Device & IP Detection</div>
              <Toggle
                checked={editingCampaign.fraud_rules.check_duplicate_ip}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_ip: v }
                })}
                label="Check Duplicate IP"
                description="Flag submissions from same IP"
              />
              <div className="px-3 py-2">
                <label className="text-xs text-slate-600">Max per IP/hour</label>
                <input
                  type="number"
                  value={editingCampaign.fraud_rules.max_submissions_per_ip_per_hour}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    fraud_rules: { ...editingCampaign.fraud_rules, max_submissions_per_ip_per_hour: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm mt-1"
                  min="0"
                />
              </div>
              <Toggle
                checked={editingCampaign.fraud_rules.check_duplicate_device}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_device: v }
                })}
                label="Check Device Fingerprint"
                description="Flag same device, multiple customers"
              />
              <div className="px-3 py-2">
                <label className="text-xs text-slate-600">Max per Device/day</label>
                <input
                  type="number"
                  value={editingCampaign.fraud_rules.max_submissions_per_device_per_day}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    fraud_rules: { ...editingCampaign.fraud_rules, max_submissions_per_device_per_day: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm mt-1"
                  min="0"
                />
              </div>

              <div className="border-t border-slate-200 my-2" />

              {/* Location */}
              <div className="text-xs font-bold text-slate-500 uppercase px-2 pt-2">Location Detection</div>
              <Toggle
                checked={editingCampaign.fraud_rules.check_duplicate_location}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_duplicate_location: v }
                })}
                label="Check GPS Location Clustering"
                description="Flag many submissions from same location"
              />
              <div className="px-3 py-2">
                <label className="text-xs text-slate-600">Max same location/day</label>
                <input
                  type="number"
                  value={editingCampaign.fraud_rules.max_same_location_per_day}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    fraud_rules: { ...editingCampaign.fraud_rules, max_same_location_per_day: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm mt-1"
                  min="0"
                />
              </div>

              <div className="border-t border-slate-200 my-2" />

              {/* Velocity */}
              <div className="text-xs font-bold text-slate-500 uppercase px-2 pt-2">Bot/Velocity Detection</div>
              <Toggle
                checked={editingCampaign.fraud_rules.check_submission_velocity}
                onChange={(v) => setEditingCampaign({
                  ...editingCampaign,
                  fraud_rules: { ...editingCampaign.fraud_rules, check_submission_velocity: v }
                })}
                label="Check Submission Speed"
                description="Flag submissions too fast (robot)"
              />
              <div className="px-3 py-2">
                <label className="text-xs text-slate-600">Min seconds between submissions</label>
                <input
                  type="number"
                  value={editingCampaign.fraud_rules.min_seconds_between_submissions}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    fraud_rules: { ...editingCampaign.fraud_rules, min_seconds_between_submissions: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm mt-1"
                  min="0"
                />
              </div>
            </div>
          </SectionCard>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Fraud Rules Summary</p>
                <p className="text-sm text-blue-700">
                  {rulesCount.enabled} of {rulesCount.total} fraud checks enabled
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add/Edit Sales/PIC Modal */}
        {showQuickModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuickModal(false)}>
            <Card className="bg-white max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  {quickModalType === 'sales' ? (
                    <>
                      <User size={20} className="text-blue-500" />
                      {quickEditItem ? 'Edit Sales' : 'Add Sales'}
                    </>
                  ) : (
                    <>
                      <UserCircle size={20} className="text-purple-500" />
                      {quickEditItem ? 'Edit PIC' : 'Add PIC'}
                    </>
                  )}
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
                    <Input
                      value={quickModalType === 'sales' ? (editingSales?.name || '') : (editingPic?.name || '')}
                      onChange={(e) => {
                        if (quickModalType === 'sales' && editingSales) {
                          setEditingSales({ ...editingSales, name: e.target.value });
                        } else if (editingPic) {
                          setEditingPic({ ...editingPic, name: e.target.value });
                        }
                      }}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">No. HP (opsional)</label>
                    <Input
                      value={quickModalType === 'sales' ? (editingSales?.phone || '') : (editingPic?.phone || '')}
                      onChange={(e) => {
                        if (quickModalType === 'sales' && editingSales) {
                          setEditingSales({ ...editingSales, phone: e.target.value });
                        } else if (editingPic) {
                          setEditingPic({ ...editingPic, phone: e.target.value });
                        }
                      }}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Status Aktif</span>
                    <Toggle
                      checked={quickModalType === 'sales' ? (editingSales?.is_active ?? true) : (editingPic?.is_active ?? true)}
                      onChange={(v) => {
                        if (quickModalType === 'sales' && editingSales) {
                          setEditingSales({ ...editingSales, is_active: v });
                        } else if (editingPic) {
                          setEditingPic({ ...editingPic, is_active: v });
                        }
                      }}
                      label=""
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowQuickModal(false)} className="flex-1">Batal</Button>
                  <Button onClick={saveQuickItem} isLoading={isSaving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // MAIN SUPERADMIN PAGE
  // =====================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <div className="w-[180px] h-auto mx-auto mb-4">
            <Image src="/Logo Rectoverso.png" alt="RECTOVERSO" width={180} height={72} className="w-full h-auto" priority />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Super Admin</h1>
          <p className="text-sm text-slate-500">Campaign & Master Data Settings</p>
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-300"><CaretLeft size={16} className="mr-1" /> Dashboard</Button>
            </Link>
            <Button variant="outline" className="text-red-600 border-red-200"><SignOut size={16} className="mr-2" /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {[
            { id: 'dashboard' as TabType, label: 'Dashboard', icon: ChartBar },
            { id: 'campaigns' as TabType, label: 'Campaigns', icon: Flag, count: campaigns.length },
            { id: 'sales' as TabType, label: 'Sales', icon: Users, count: salesList.length },
            { id: 'pics' as TabType, label: 'PICs', icon: UserCircle, count: picsList.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm',
                activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              )}>
                <Icon size={18} /> {tab.label}
                {tab.count !== undefined && (
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100')}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <Card className="bg-white text-center"><CardContent className="p-12">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading...</p>
          </CardContent></Card>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (() => {
              const stats = {
                total: submissions.length,
                valid: submissions.filter(s => s.status === 'valid').length,
                pending: submissions.filter(s => s.status === 'pending').length,
                fraud: submissions.filter(s => s.status === 'fraud').length,
              };
              const validRate = stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0;

              // Stats per campaign
              const campaignStats = campaigns.map(c => {
                const cSubs = submissions.filter(s => s.campaign_id === c.id);
                return {
                  ...c,
                  total: cSubs.length,
                  valid: cSubs.filter(s => s.status === 'valid').length,
                  fraud: cSubs.filter(s => s.status === 'fraud').length,
                };
              });

              // Stats per sales
              const salesStats = salesList.map(s => {
                const sSubs = submissions.filter(su => su.sales_name === s.name);
                return {
                  ...s,
                  total: sSubs.length,
                  valid: sSubs.filter(su => su.status === 'valid').length,
                  fraud: sSubs.filter(su => su.status === 'fraud').length,
                };
              });

              const filteredSubs = submissions.filter(s => {
                if (statusFilter !== 'all' && s.status !== statusFilter) return false;
                if (campaignFilter !== 'all' && s.campaign_id !== campaignFilter) return false;
                if (salesFilter !== 'all' && s.sales_name !== salesFilter) return false;
                return true;
              });

              return (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                      <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                        <div className="p-3 rounded-xl bg-white/20 mb-3"><ChartBar size={28} className="text-white" /></div>
                        <p className="text-4xl font-bold">{stats.total}</p>
                        <p className="text-sm text-white/80 mt-1">Total</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg">
                      <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                        <div className="p-3 rounded-xl bg-white/20 mb-3"><CheckCircle size={28} weight="fill" className="text-white" /></div>
                        <p className="text-4xl font-bold">{stats.valid}</p>
                        <p className="text-sm text-white/80 mt-1">Valid ({validRate}%)</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-lg">
                      <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                        <div className="p-3 rounded-xl bg-white/20 mb-3"><Shield size={28} weight="fill" className="text-white" /></div>
                        <p className="text-4xl font-bold">{stats.fraud}</p>
                        <p className="text-sm text-white/80 mt-1">Fraud</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Per Campaign Stats */}
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Flag size={18} className="text-purple-500" /> Breakdown per Campaign</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-4 py-2 text-left font-semibold text-slate-600">Campaign</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Total</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Valid</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Fraud</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {campaignStats.map(c => (
                              <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                                <td className="px-4 py-3 text-center font-bold">{c.total}</td>
                                <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{c.valid}</td>
                                <td className="px-4 py-3 text-center text-rose-600 font-semibold">{c.fraud}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={cn('px-2 py-1 rounded-lg text-xs font-bold',
                                    c.total > 0 && (c.valid / c.total) >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                                    c.total > 0 && (c.valid / c.total) >= 0.7 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  )}>
                                    {c.total > 0 ? Math.round((c.valid / c.total) * 100) : 0}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Per Sales Stats */}
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Breakdown per Sales</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-4 py-2 text-left font-semibold text-slate-600">Sales</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Total</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Valid</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Fraud</th>
                              <th className="px-4 py-2 text-center font-semibold text-slate-600">Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {salesStats.filter(s => s.total > 0).map(s => (
                              <tr key={s.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                                <td className="px-4 py-3 text-center font-bold">{s.total}</td>
                                <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{s.valid}</td>
                                <td className="px-4 py-3 text-center text-rose-600 font-semibold">{s.fraud}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={cn('px-2 py-1 rounded-lg text-xs font-bold',
                                    s.total > 0 && (s.valid / s.total) >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                                    s.total > 0 && (s.valid / s.total) >= 0.7 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  )}>
                                    {s.total > 0 ? Math.round((s.valid / s.total) * 100) : 0}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Submissions Table */}
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-rose-500" /> All Submissions</h3>
                      {/* Filters */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                          <option value="all">Semua Status</option>
                          <option value="valid">Valid</option>
                          <option value="pending">Pending</option>
                          <option value="fraud">Fraud</option>
                        </select>
                        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                          <option value="all">Semua Campaign</option>
                          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={salesFilter} onChange={e => setSalesFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                          <option value="all">Semua Sales</option>
                          {salesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-3 py-2 text-left font-semibold text-slate-600">Kode</th>
                              <th className="px-3 py-2 text-left font-semibold text-slate-600">Customer</th>
                              <th className="px-3 py-2 text-left font-semibold text-slate-600">Sales</th>
                              <th className="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
                              <th className="px-3 py-2 text-center font-semibold text-slate-600">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredSubs.length === 0 ? (
                              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Tidak ada submission</td></tr>
                            ) : filteredSubs.map(sub => (
                              <tr key={sub.id} className={cn('hover:bg-slate-50', sub.status === 'fraud' && 'bg-red-50/30')}>
                                <td className="px-3 py-3 font-mono text-sm font-semibold text-blue-600">{sub.submission_code}</td>
                                <td className="px-3 py-3">
                                  <div className="font-medium text-slate-900">{sub.customer_name}</div>
                                  <div className="text-xs text-slate-500">{sub.customer_phone_masked || sub.customer_phone}</div>
                                </td>
                                <td className="px-3 py-3 text-slate-700">{sub.sales_name || '-'}</td>
                                <td className="px-3 py-3">
                                  {sub.status === 'valid' && <Badge className="bg-emerald-100 text-emerald-700">Valid</Badge>}
                                  {sub.status === 'pending' && <Badge className="bg-amber-100 text-amber-700">Pending</Badge>}
                                  {sub.status === 'fraud' && <Badge className="bg-rose-100 text-rose-700">Fraud</Badge>}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={() => setSelectedSubmission(sub)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600" title="Detail"><Eye size={16} /></button>
                                    <button onClick={() => deleteSubmission(sub.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Hapus"><Trash size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detail Modal */}
                  {selectedSubmission && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSubmission(null)}>
                      <Card className="bg-white max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-600">{selectedSubmission.submission_code}</span>
                              {selectedSubmission.status === 'valid' && <Badge className="bg-emerald-100 text-emerald-700">Valid</Badge>}
                              {selectedSubmission.status === 'fraud' && <Badge className="bg-rose-100 text-rose-700">Fraud</Badge>}
                            </div>
                            <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} className="text-slate-500" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Customer</p>
                              <p className="font-medium">{selectedSubmission.customer_name}</p>
                              <p className="text-sm text-slate-500">{selectedSubmission.customer_phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Sales</p>
                              <p className="font-medium">{selectedSubmission.sales_name || '-'}</p>
                              <p className="text-sm text-slate-500">{selectedSubmission.campaign_name}</p>
                            </div>
                          </div>
                          {selectedSubmission.fraud_flags && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mb-4">
                              <p className="text-sm font-semibold text-rose-700 mb-2">Alasan Fraud:</p>
                              {JSON.parse(selectedSubmission.fraud_flags).map((flag: any, i: number) => (
                                <p key={i} className="text-sm text-rose-600">• {flag.reason}</p>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm text-slate-500">
                            <span>{new Date(selectedSubmission.created_at).toLocaleString('id-ID')}</span>
                            <Button variant="outline" onClick={() => deleteSubmission(selectedSubmission.id)} className="text-red-600 border-red-200">
                              <Trash size={16} className="mr-1" /> Hapus
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* CAMPAIGNS */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button onClick={() => openCampaignEditor()} className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                    <Plus size={18} className="mr-2" /> Create Campaign
                  </Button>
                </div>
                {campaigns.length === 0 ? (
                  <Card className="bg-white text-center"><CardContent className="p-12">
                    <Flag size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">No campaigns yet</p>
                    <p className="text-sm text-slate-400">Click "Create Campaign" to get started</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              {campaign.brand_logo_url && (
                                <img src={campaign.brand_logo_url} alt={campaign.name} className="h-10 mb-2 object-contain" />
                              )}
                              <h3 className="font-bold text-lg text-slate-900">{campaign.name}</h3>
                              <p className="text-sm text-slate-500 font-mono">{campaign.code}</p>
                            </div>
                            <Badge className={campaign.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                              {campaign.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-blue-100 text-blue-700">Rp {campaign.fee_per_activation.toLocaleString()}</Badge>
                            <Badge className="bg-purple-100 text-purple-700">
                              <Camera size={12} className="mr-1" /> {campaign.required_evidence?.length || 0} Evidence
                            </Badge>
                            <Badge className="bg-rose-100 text-rose-700">
                              <Shield size={12} className="mr-1" /> {campaign.form_fields?.length || 0} Fields
                            </Badge>
                          </div>

                          <div className="flex justify-center gap-2">
                            <Button onClick={() => openCampaignEditor(campaign)} className="bg-gradient-to-r from-blue-600 to-blue-700">
                              <Pencil size={16} className="mr-1" /> Edit
                            </Button>
                            <Button variant="outline" onClick={() => deleteCampaign(campaign.id)} className="text-red-600 border-red-200">
                              <Trash size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SALES */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button onClick={() => openSimpleModal('sales')} className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Plus size={18} className="mr-2" /> Add Sales
                  </Button>
                </div>
                {salesList.length === 0 ? (
                  <Card className="bg-white text-center"><CardContent className="p-12">
                    <User size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No sales data</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {salesList.map((sales) => (
                      <Card key={sales.id} className="bg-white border-slate-200 shadow-sm text-center">
                        <CardContent className="p-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">
                            {sales.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <h3 className="font-semibold text-slate-900">{sales.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center justify-center gap-1"><Phone size={12} /> {sales.phone || '-'}</p>
                          <Badge className={sales.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-slate-100 text-slate-500 mt-2'}>
                            {sales.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex justify-center gap-1 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => openSimpleModal('sales', sales)}><Pencil size={14} /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteItem('sales', sales.id)} className="text-red-600"><Trash size={14} /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PICS */}
            {activeTab === 'pics' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button onClick={() => openSimpleModal('pic')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus size={18} className="mr-2" /> Add PIC
                  </Button>
                </div>
                {picsList.length === 0 ? (
                  <Card className="bg-white text-center"><CardContent className="p-12">
                    <UserCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No PIC data</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {picsList.map((pic) => (
                      <Card key={pic.id} className="bg-white border-slate-200 shadow-sm text-center">
                        <CardContent className="p-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">
                            {pic.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <h3 className="font-semibold text-slate-900">{pic.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center justify-center gap-1"><Phone size={12} /> {pic.phone || '-'}</p>
                          <Badge className={pic.is_active ? 'bg-emerald-100 text-emerald-700 mt-2' : 'bg-slate-100 text-slate-500 mt-2'}>
                            {pic.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex justify-center gap-1 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => openSimpleModal('pic', pic)}><Pencil size={14} /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteItem('pics', pic.id)} className="text-red-600"><Trash size={14} /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <Card className="bg-white text-center">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center justify-center gap-2"><Gear size={20} className="text-slate-600" /> System Settings</h2>
                    <div className="space-y-4 max-w-lg mx-auto text-left">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Shield size={18} className="text-blue-600" /> Fraud Detection v2</h3>
                        <p className="text-sm text-slate-600 mt-1">Fraud rules are configured per campaign in the Campaign Editor</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><ImageIcon size={18} className="text-purple-600" /> Storage</h3>
                        <p className="text-sm text-slate-600 mt-1">Screenshots uploaded to Supabase Storage 'screenshots' bucket</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><UserCircle size={18} className="text-emerald-600" /> Master Data</h3>
                        <p className="text-sm text-slate-600 mt-1">Sales and PIC data managed in their respective tabs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* Simple Modal */}
      {showSimpleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSimpleModal(false)}>
          <Card className="bg-white max-w-md w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {modalType === 'sales' ? (editingSales?.id ? 'Edit Sales' : 'Add Sales') : (editingPic?.id ? 'Edit PIC' : 'Add PIC')}
              </h2>
              {modalType === 'sales' && editingSales && (
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-slate-700">Name *</label>
                    <Input value={editingSales.name} onChange={(e) => setEditingSales({ ...editingSales, name: e.target.value })} placeholder="Full name" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-slate-700">Phone</label>
                    <Input value={editingSales.phone} onChange={(e) => setEditingSales({ ...editingSales, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
                  </div>
                  <Toggle
                    checked={editingSales.is_active}
                    onChange={(v) => setEditingSales({ ...editingSales, is_active: v })}
                    label="Active"
                  />
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowSimpleModal(false)} className="flex-1">Cancel</Button>
                    <Button onClick={saveSales} isLoading={isSaving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">Save</Button>
                  </div>
                </div>
              )}
              {modalType === 'pic' && editingPic && (
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-slate-700">Name *</label>
                    <Input value={editingPic.name} onChange={(e) => setEditingPic({ ...editingPic, name: e.target.value })} placeholder="Full name" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-slate-700">Phone</label>
                    <Input value={editingPic.phone} onChange={(e) => setEditingPic({ ...editingPic, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
                  </div>
                  <Toggle
                    checked={editingPic.is_active}
                    onChange={(v) => setEditingPic({ ...editingPic, is_active: v })}
                    label="Active"
                  />
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowSimpleModal(false)} className="flex-1">Cancel</Button>
                    <Button onClick={savePic} isLoading={isSaving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">Save</Button>
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
