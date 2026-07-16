'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Flag, UserCircle, User, Envelope, Phone, Camera, Check, Sparkle } from '@phosphor-icons/react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header with Logo */}
      <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <h1
                className="relative text-4xl font-extrabold italic tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient"
                style={{
                  fontFamily: 'Arial Black, sans-serif',
                  textShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
                }}
              >
                rectoverso
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Sparkle size={16} className="text-amber-400 animate-bounce" />
              <p className="text-sm text-white/80 font-medium">Activation System</p>
              <Sparkle size={16} className="text-amber-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Report Sales Title */}
      <div className="relative max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <h2 className="text-2xl font-bold text-white text-center">
            Report Sales
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative max-w-md mx-auto px-4 pb-8">
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          {/* Gradient top border */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <CardContent className="p-6 space-y-5">
            {/* Date */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-100">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                className="border-slate-200 focus:border-blue-500 bg-slate-50"
              />
            </div>

            {/* Campaign */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <div className="p-1 rounded-md bg-purple-100">
                  <Flag size={16} className="text-purple-600" />
                </div>
                Campaign
              </Label>
              <select
                value={formData.campaign_id}
                onChange={(e) => updateFormData('campaign_id', e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50"
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
                <div className="p-1 rounded-md bg-emerald-100">
                  <UserCircle size={16} className="text-emerald-600" />
                </div>
                PIC
              </Label>
              <select
                value={formData.pic_id}
                onChange={(e) => updateFormData('pic_id', e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50"
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
                <div className="p-1 rounded-md bg-amber-100">
                  <User size={16} className="text-amber-600" />
                </div>
                Sales
              </Label>
              <Input
                placeholder="Nama sales"
                value={formData.sales_name}
                onChange={(e) => updateFormData('sales_name', e.target.value)}
                className="border-slate-200 focus:border-blue-500 bg-slate-50"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gradient-to-r from-blue-500 to-purple-500 my-4" />
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              Data Customer
            </p>

            {/* Nama Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700">Nama Customer</Label>
              <Input
                placeholder="Nama lengkap customer"
                value={formData.customer_name}
                onChange={(e) => updateFormData('customer_name', e.target.value)}
                className="border-slate-200 focus:border-blue-500 bg-slate-50"
              />
            </div>

            {/* Email Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-100">
                  <Envelope size={16} className="text-blue-600" />
                </div>
                Email Customer
              </Label>
              <Input
                type="email"
                placeholder="email@domain.com"
                value={formData.customer_email}
                onChange={(e) => updateFormData('customer_email', e.target.value)}
                className="border-slate-200 focus:border-blue-500 bg-slate-50"
              />
            </div>

            {/* No Tlp Customer */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2">
                <div className="p-1 rounded-md bg-green-100">
                  <Phone size={16} className="text-green-600" />
                </div>
                No Tlp Customer
              </Label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.customer_phone}
                onChange={(e) => updateFormData('customer_phone', e.target.value)}
                className="border-slate-200 focus:border-blue-500 bg-slate-50"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gradient-to-r from-blue-500 to-purple-500 my-4" />
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-pink-500" />
              Bukti Screenshot
            </p>

            {/* Screenshots */}
            <div className="space-y-3">
              {/* Download */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
                  formData.screenshot_download
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20'
                    : 'border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                )}
                onClick={() => updateFormData('screenshot_download', formData.screenshot_download ? null : 'uploaded')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg transition-all',
                    formData.screenshot_download ? 'bg-blue-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_download ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Bukti Screenshot Download</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_download && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center animate-bounce-in">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Register */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
                  formData.screenshot_register
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-500/20'
                    : 'border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/50'
                )}
                onClick={() => updateFormData('screenshot_register', formData.screenshot_register ? null : 'uploaded')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg transition-all',
                    formData.screenshot_register ? 'bg-purple-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_register ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Bukti Screenshot Registrasi</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_register && (
                    <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center animate-bounce-in">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
                  formData.screenshot_rating
                    ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-amber-50 shadow-lg shadow-pink-500/20'
                    : 'border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50/50'
                )}
                onClick={() => updateFormData('screenshot_rating', formData.screenshot_rating ? null : 'uploaded')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg transition-all',
                    formData.screenshot_rating ? 'bg-pink-500' : 'bg-slate-100'
                  )}>
                    <Camera size={20} className={formData.screenshot_rating ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Bukti Screenshot Review & Rating</p>
                    <p className="text-xs text-slate-500">Tap to mark as uploaded</p>
                  </div>
                  {formData.screenshot_rating && (
                    <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center animate-bounce-in">
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
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/30 disabled:opacity-50 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengirim...
              </>
            ) : (
              '🚀 Submit Report'
            )}
          </Button>
        </div>

        {/* Dashboard Link */}
        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-sm text-white/80 hover:text-white transition-colors inline-flex items-center gap-2">
            Lihat Dashboard →
          </Link>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-sm w-full shadow-2xl rounded-2xl overflow-hidden animate-scale-in">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardContent className="p-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full blur-xl opacity-50" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Check size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Berhasil!</h2>
              <p className="text-slate-500 mt-2">Submission berhasil disimpan</p>

              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 my-6">
                <p className="text-xs text-slate-500 mb-1">Kode Aktivasi</p>
                <p className="text-2xl font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{submissionCode}</p>
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Submit Lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
