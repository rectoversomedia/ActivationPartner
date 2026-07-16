'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Flag, UserCircle, User, Envelope, Phone, Camera, Check,
  DeviceMobile, MapPin, Clock, Fingerprint
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

// Master data (from admin)
const masterData = {
  sales: [
    { id: '1', name: 'Ahmad Fauzi' },
    { id: '2', name: 'Budi Santoso' },
    { id: '3', name: 'Citra Dewi' },
    { id: '4', name: 'Dian Pratama' },
    { id: '5', name: 'Eko Wijaya' },
  ],
  pics: [
    { id: '1', name: 'Budi Santoso' },
    { id: '2', name: 'Ani Wijaya' },
    { id: '3', name: 'Dewi Lestari' },
  ],
  campaigns: [
    { id: '1', name: 'FIFGO Campaign' },
    { id: '2', name: 'Rectoverso Promo' },
  ],
};

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
  gps_lat: string;
  gps_lng: string;
  screenshot_download: string | null;
  screenshot_register: string | null;
  screenshot_rating: string | null;
}

export default function SubmitPage() {
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

  const updateFormData = (field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmissionCode(generateCode());
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const isFormValid = formData.date && formData.time && formData.sales_id &&
                      formData.pic_id && formData.campaign_id &&
                      formData.customer_name && formData.customer_phone &&
                      formData.screenshot_download &&
                      formData.screenshot_register && formData.screenshot_rating;

  // Get selected names
  const selectedSales = masterData.sales.find(s => s.id === formData.sales_id)?.name || '';
  const selectedPic = masterData.pics.find(p => p.id === formData.pic_id)?.name || '';
  const selectedCampaign = masterData.campaigns.find(c => c.id === formData.campaign_id)?.name || '';

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
                {masterData.sales.map(s => (
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
                {masterData.pics.map(p => (
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
                {masterData.campaigns.map(c => (
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
                  'p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                  formData.screenshot_download
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-dashed border-slate-300 hover:border-blue-400'
                )}
                onClick={() => updateFormData('screenshot_download', formData.screenshot_download ? null : 'uploaded')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.screenshot_download ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_download ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bukti Screenshot Download</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_download && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Register */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                  formData.screenshot_register
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-dashed border-slate-300 hover:border-blue-400'
                )}
                onClick={() => updateFormData('screenshot_register', formData.screenshot_register ? null : 'uploaded')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.screenshot_register ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_register ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bukti Screenshot Registrasi</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_register && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                  formData.screenshot_rating
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-dashed border-slate-300 hover:border-blue-400'
                )}
                onClick={() => updateFormData('screenshot_rating', formData.screenshot_rating ? null : 'uploaded')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    formData.screenshot_rating ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_rating ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Bukti Screenshot Review & Rating</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_rating && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
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
                  <p>• Campaign: {selectedCampaign}</p>
                  <p>• Customer: {formData.customer_name}</p>
                  <p>• Device: {formData.device_info}</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowSuccess(false);
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
