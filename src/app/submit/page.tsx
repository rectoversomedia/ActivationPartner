'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Flag, UserCircle, User, Envelope, Phone, Camera, Check } from '@phosphor-icons/react';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FormData {
  date: string;
  campaign_id: string;
  pic_id: string;
  sales_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  screenshot_download: string | null;
  screenshot_register: string | null;
  screenshot_rating: string | null;
}

export default function SubmitPage() {
  const [formData, setFormData] = React.useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    campaign_id: '',
    pic_id: '',
    sales_name: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    screenshot_download: null,
    screenshot_register: null,
    screenshot_rating: null,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [submissionCode, setSubmissionCode] = React.useState('');

  const pics = [
    { id: '1', name: 'Budi Santoso' },
    { id: '2', name: 'Ani Wijaya' },
    { id: '3', name: 'Dewi Lestari' },
  ];

  const campaigns = [
    { id: '1', name: 'FIFGO Campaign' },
    { id: '2', name: 'Rectoverso Promo' },
  ];

  const updateFormData = (field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const isFormValid = formData.date && formData.campaign_id && formData.pic_id &&
                      formData.sales_name && formData.customer_name &&
                      formData.customer_phone && formData.screenshot_download &&
                      formData.screenshot_register && formData.screenshot_rating;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Logo */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Logo */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">R</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-center">RECTOVERSO</h1>
          <p className="text-sm text-slate-500 text-center">Activation System</p>
        </div>
      </header>

      {/* Report Sales Title */}
      <div className="max-w-md mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-slate-900">Report Sales</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 pb-8">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 space-y-5">
            {/* Date */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* Campaign */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <Flag size={18} className="text-purple-500" />
                Campaign
              </Label>
              <select
                value={formData.campaign_id}
                onChange={(e) => updateFormData('campaign_id', e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">Pilih Campaign</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* PIC */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <UserCircle size={18} className="text-emerald-500" />
                PIC
              </Label>
              <select
                value={formData.pic_id}
                onChange={(e) => updateFormData('pic_id', e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">Pilih PIC</option>
                {pics.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Sales */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <User size={18} className="text-amber-500" />
                Sales
              </Label>
              <Input
                placeholder="Nama sales"
                value={formData.sales_name}
                onChange={(e) => updateFormData('sales_name', e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />
            <p className="text-sm font-medium text-slate-900">Data Customer</p>

            {/* Nama Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700">Nama Customer</Label>
              <Input
                placeholder="Nama lengkap customer"
                value={formData.customer_name}
                onChange={(e) => updateFormData('customer_name', e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* Email Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <Envelope size={18} className="text-blue-500" />
                Email Customer
              </Label>
              <Input
                type="email"
                placeholder="email@domain.com"
                value={formData.customer_email}
                onChange={(e) => updateFormData('customer_email', e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* No Tlp Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <Phone size={18} className="text-green-500" />
                No Tlp Customer
              </Label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.customer_phone}
                onChange={(e) => updateFormData('customer_phone', e.target.value)}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4" />
            <p className="text-sm font-medium text-slate-900">Bukti Screenshot</p>

            {/* Screenshots */}
            <div className="space-y-3">
              {/* Download */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all cursor-pointer',
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
                    <p className="font-medium text-slate-900">Bukti Screenshot Download</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_download && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Register */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all cursor-pointer',
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
                    <p className="font-medium text-slate-900">Bukti Screenshot Registrasi</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_register && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all cursor-pointer',
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
                    <p className="font-medium text-slate-900">Bukti Screenshot Review & Rating</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_rating && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            disabled={!isFormValid}
            isLoading={isSubmitting}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
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
          <Card className="bg-white max-w-sm w-full animate-scale-in">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Berhasil!</h2>
              <p className="text-slate-500 mb-4">Submission berhasil disimpan</p>

              <div className="p-4 rounded-xl bg-slate-50 mb-6">
                <p className="text-xs text-slate-500 mb-1">Kode Aktivasi</p>
                <p className="text-xl font-mono font-bold text-blue-600">{submissionCode}</p>
              </div>

              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    campaign_id: '',
                    pic_id: '',
                    sales_name: '',
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    screenshot_download: null,
                    screenshot_register: null,
                    screenshot_rating: null,
                  });
                }}
                className="w-full"
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
