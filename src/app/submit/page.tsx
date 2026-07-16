'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Flag, UserCircle, User, Envelope, Phone, Camera, Check,
  DeviceMobile, MapPin, Clock, Fingerprint, X, Upload, Spinner
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

// Interface for Campaign (with fraud rules)
interface Campaign {
  id: string;
  name: string;
  code: string;
  fee_per_activation: number;
  fraud_rules: {
    require_screenshot_download: boolean;
    require_screenshot_register: boolean;
    require_screenshot_rating: boolean;
    require_gps: boolean;
  };
  required_evidence: string[];
  is_active: boolean;
}

interface SalesPerson {
  id: string;
  name: string;
  phone: string;
}

interface PIC {
  id: string;
  name: string;
  phone: string;
}

interface FormData {
  date: string;
  time: string;
  sales_id: string;
  pic_id: string;
  campaign_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_info: string;
  ip_address: string;
  gps_lat: string;
  gps_lng: string;
  screenshot_download: File | null;
  screenshot_register: File | null;
  screenshot_rating: File | null;
}

export default function SubmitPage() {
  // Master data from API
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [salesList, setSalesList] = React.useState<SalesPerson[]>([]);
  const [picsList, setPicsList] = React.useState<PIC[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = React.useState(true);

  const [formData, setFormData] = React.useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    sales_id: '',
    pic_id: '',
    campaign_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    device_info: '',
    ip_address: '',
    gps_lat: '',
    gps_lng: '',
    screenshot_download: null,
    screenshot_register: null,
    screenshot_rating: null,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [submissionCode, setSubmissionCode] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [previews, setPreviews] = React.useState<Record<string, string>>({});

  // Get selected campaign for fraud rules
  const selectedCampaign = campaigns.find(c => c.id === formData.campaign_id);

  // Fetch master data on mount
  React.useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [campaignsRes, masterRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/master-data'),
        ]);

        const campaignsData = await campaignsRes.json();
        const masterData = await masterRes.json();

        if (campaignsData.data) {
          // Filter only active campaigns
          setCampaigns(campaignsData.data.filter((c: Campaign) => c.is_active));
        }

        if (masterData.sales) {
          setSalesList(masterData.sales.filter((s: SalesPerson) => s.is_active));
        }

        if (masterData.pics) {
          setPicsList(masterData.pics.filter((p: PIC) => p.is_active));
        }
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      } finally {
        setIsLoadingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  const updateFormData = (field: keyof FormData, value: string | null | File) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
  };

  // Handle file selection with preview
  const handleFileChange = (field: 'screenshot_download' | 'screenshot_register' | 'screenshot_rating', file: File | null) => {
    if (file) {
      updateFormData(field, file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [field]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      updateFormData(field, null);
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[field];
        return newPreviews;
      });
    }
  };

  // Get device fingerprint
  React.useEffect(() => {
    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let device = 'Unknown';
      if (ua.includes('iPhone')) device = 'iOS-iPhone';
      else if (ua.includes('iPad')) device = 'iOS-iPad';
      else if (ua.includes('Android')) {
        if (ua.includes('Samsung')) device = 'Android-Samsung';
        else if (ua.includes('Xiaomi')) device = 'Android-Xiaomi';
        else if (ua.includes('OPPO')) device = 'Android-OPPO';
        else device = 'Android-Other';
      }
      updateFormData('device_info', device);
    };
    getDeviceInfo();
  }, []);

  // Get GPS
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFormData('gps_lat', position.coords.latitude.toFixed(6));
          updateFormData('gps_lng', position.coords.longitude.toFixed(6));
        },
        () => {
          // Silently fail - GPS is optional
        }
      );
    }
  }, []);

  // Get IP Address
  React.useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        updateFormData('ip_address', data.ip);
      } catch {
        // IP capture optional
      }
    };
    getIP();
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ACT-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get selected names
      const selectedSalesName = salesList.find(s => s.id === formData.sales_id)?.name || '';
      const selectedPicName = picsList.find(p => p.id === formData.pic_id)?.name || '';
      const selectedCampaignName = campaigns.find(c => c.id === formData.campaign_id)?.name || '';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('sales_id', formData.sales_id);
      formDataToSend.append('sales_name', selectedSalesName);
      formDataToSend.append('pic_id', formData.pic_id);
      formDataToSend.append('pic_name', selectedPicName);
      formDataToSend.append('campaign_id', formData.campaign_id);
      formDataToSend.append('campaign_name', selectedCampaignName);
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_email', formData.customer_email);
      formDataToSend.append('customer_phone', formData.customer_phone);
      formDataToSend.append('device_info', formData.device_info);
      formDataToSend.append('ip_address', formData.ip_address);
      formDataToSend.append('gps_lat', formData.gps_lat);
      formDataToSend.append('gps_lng', formData.gps_lng);

      // Append files if they exist
      if (formData.screenshot_download) {
        formDataToSend.append('screenshot_download', formData.screenshot_download);
      }
      if (formData.screenshot_register) {
        formDataToSend.append('screenshot_register', formData.screenshot_register);
      }
      if (formData.screenshot_rating) {
        formDataToSend.append('screenshot_rating', formData.screenshot_rating);
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setSubmissionCode(result.submissionCode);
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal submit. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.date && formData.time && formData.sales_id &&
                      formData.pic_id && formData.campaign_id &&
                      formData.customer_name && formData.customer_phone &&
                      formData.screenshot_download &&
                      formData.screenshot_register &&
                      formData.screenshot_rating;


  // Get selected names from API data
  const selectedSales = salesList.find(s => s.id === formData.sales_id)?.name || '';
  const selectedPic = picsList.find(p => p.id === formData.pic_id)?.name || '';
  const selectedCampaignName = selectedCampaign?.name || '';

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="bg-white">
        <div className="max-w-md mx-auto px-4 pt-8 pb-4">
          <div className="flex flex-col items-center">
            <div className="w-[200px] h-auto mb-4">
              <Image
                src="/Logo Rectoverso.png"
                alt="RECTOVERSO"
                width={200}
                height={80}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Report Sales Title */}
      <div className="max-w-md mx-auto px-4 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          Report Sales
        </h2>
      </div>

      {/* Form */}
      {isLoadingMaster ? (
        <div className="max-w-md mx-auto px-4">
          <Card><CardContent className="p-8 text-center">Loading data...</CardContent></Card>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 pb-8">
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-5">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData('date', e.target.value)}
                  className="border-slate-200 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-purple-500" />
                  Time
                </Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateFormData('time', e.target.value)}
                  className="border-slate-200 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Sales Dropdown */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <User size={18} className="text-amber-500" />
                Sales
              </Label>
              <select
                value={formData.sales_id}
                onChange={(e) => updateFormData('sales_id', e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
              >
                <option value="">Pilih Sales</option>
                {salesList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* PIC Dropdown */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <UserCircle size={18} className="text-emerald-500" />
                PIC
              </Label>
              <select
                value={formData.pic_id}
                onChange={(e) => updateFormData('pic_id', e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
              >
                <option value="">Pilih PIC</option>
                {picsList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Campaign Dropdown */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <Flag size={18} className="text-pink-500" />
                Campaign
              </Label>
              <select
                value={formData.campaign_id}
                onChange={(e) => updateFormData('campaign_id', e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
              >
                <option value="">Pilih Campaign</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />
            <p className="text-sm font-bold text-slate-900">Data Customer</p>

            {/* Nama Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Nama Customer</Label>
              <Input
                placeholder="Nama lengkap customer"
                value={formData.customer_name}
                onChange={(e) => updateFormData('customer_name', e.target.value)}
                required
                className="border-slate-200 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Email Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <Envelope size={18} className="text-blue-500" />
                Email Customer
              </Label>
              <Input
                type="email"
                placeholder="email@domain.com"
                value={formData.customer_email}
                onChange={(e) => updateFormData('customer_email', e.target.value)}
                className="border-slate-200 focus:border-blue-500 bg-white"
              />
            </div>

            {/* No Tlp Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <Phone size={18} className="text-green-500" />
                No Tlp Customer
              </Label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.customer_phone}
                onChange={(e) => updateFormData('customer_phone', e.target.value)}
                required
                className="border-slate-200 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />
            <p className="text-sm font-bold text-slate-900">Bukti Screenshot</p>

            {/* Screenshots */}
            <div className="space-y-3">
              {/* Download */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200',
                  formData.screenshot_download
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-dashed border-slate-300'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.screenshot_download ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_download ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bukti Screenshot Download</p>
                    <p className="text-xs text-slate-500">PNG, JPG, HEIC - Max 5MB</p>
                  </div>
                </div>

                {previews.screenshot_download ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={previews.screenshot_download} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => handleFileChange('screenshot_download', null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={16} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all">
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Tap to upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('screenshot_download', e.target.files?.[0] || null)} className="hidden" />
                  </label>
                )}
              </div>

              {/* Register */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200',
                  formData.screenshot_register
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-dashed border-slate-300'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.screenshot_register ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_register ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bukti Screenshot Registrasi</p>
                    <p className="text-xs text-slate-500">PNG, JPG, HEIC - Max 5MB</p>
                  </div>
                </div>

                {previews.screenshot_register ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={previews.screenshot_register} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => handleFileChange('screenshot_register', null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={16} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all">
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Tap to upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('screenshot_register', e.target.files?.[0] || null)} className="hidden" />
                  </label>
                )}
              </div>

              {/* Rating */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200',
                  formData.screenshot_rating
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-dashed border-slate-300'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.screenshot_rating ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_rating ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bukti Screenshot Review & Rating</p>
                    <p className="text-xs text-slate-500">PNG, JPG, HEIC - Max 5MB</p>
                  </div>
                </div>

                {previews.screenshot_rating ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={previews.screenshot_rating} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => handleFileChange('screenshot_rating', null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={16} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all">
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Tap to upload</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('screenshot_rating', e.target.files?.[0] || null)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Advanced Info (Auto-captured) */}
            <div className="border-t border-slate-100 my-4" />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <Fingerprint size={18} />
              Device Info (Auto-captured)
              <span className="text-xs text-slate-400 ml-auto">
                {showAdvanced ? '▲' : '▼'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 rounded-xl bg-slate-50 space-y-3">
                <div className="flex items-center gap-3">
                  <DeviceMobile size={20} className="text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Device</p>
                    <p className="text-sm font-medium text-slate-700">{formData.device_info || 'Detecting...'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-purple-500" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">GPS Location</p>
                    <p className="text-sm font-medium text-slate-700">
                      {formData.gps_lat && formData.gps_lng
                        ? `${formData.gps_lat}, ${formData.gps_lng}`
                        : 'Location unavailable'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Timestamp</p>
                    <p className="text-sm font-medium text-slate-700">{formData.date} {formData.time}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            disabled={!isFormValid}
            isLoading={isSubmitting}
            className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Submit Report'}
          </Button>
        </div>

        {/* Dashboard Link */}
        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
            Lihat Dashboard →
          </Link>
        </div>
      </form>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-sm w-full shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Berhasil!</h2>
              <p className="text-slate-500 mb-6">Submission berhasil disimpan</p>

              <div className="p-4 rounded-xl bg-slate-50 mb-6">
                <p className="text-xs text-slate-500 mb-1">Kode Aktivasi</p>
                <p className="text-xl font-mono font-bold text-blue-600">{submissionCode}</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 text-left mb-6">
                <p className="text-xs text-blue-600 font-semibold mb-2">Data Submitted:</p>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• Sales: {selectedSales}</p>
                  <p>• PIC: {selectedPic}</p>
                  <p>• Campaign: {selectedCampaignName}</p>
                  <p>• Customer: {formData.customer_name}</p>
                  <p>• Device: {formData.device_info}</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setPreviews({});
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5),
                    sales_id: '',
                    pic_id: '',
                    campaign_id: '',
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    device_info: formData.device_info,
                    gps_lat: formData.gps_lat,
                    gps_lng: formData.gps_lng,
                    screenshot_download: null,
                    screenshot_register: null,
                    screenshot_rating: null,
                  });
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Submit Lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
