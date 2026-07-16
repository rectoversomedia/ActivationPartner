'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, Check, Camera, Download, Star, UserCirclePlus } from '@phosphor-icons/react';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FormData {
  date: string;
  sales_name: string;
  pic_id: string;
  campaign_id: string;
  screenshot_download: string | null;
  screenshot_register: string | null;
  screenshot_rating: string | null;
}

export default function SubmitPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    sales_name: '',
    pic_id: '',
    campaign_id: '',
    screenshot_download: null,
    screenshot_register: null,
    screenshot_rating: null,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [submissionCode, setSubmissionCode] = React.useState('');

  // Mock data
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmissionCode(generateCode());
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const steps = [
    { id: 1, title: 'Info' },
    { id: 2, title: 'Customer' },
    { id: 3, title: 'Screenshot' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Activation Submit</h1>
              <p className="text-white/50 text-sm">FIFGO Campaign</p>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  currentStep >= step.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-white/50'
                )}>
                  {currentStep > step.id ? <Check size={18} /> : step.id}
                </div>
                <p className={cn('text-xs mt-2', currentStep >= step.id ? 'text-white' : 'text-white/50')}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('flex-1 h-1 mx-2 rounded-full', currentStep > step.id ? 'bg-blue-500' : 'bg-white/20')} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4">
        {/* Step 1: Info */}
        {currentStep === 1 && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar size={24} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Informasi Aktivasi</h2>
                  <p className="text-sm text-white/50">Tanggal & Campaign</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Tanggal</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Campaign</Label>
                  <select
                    value={formData.campaign_id}
                    onChange={(e) => updateFormData('campaign_id', e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" className="bg-slate-900">Pilih Campaign</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Customer Data */}
        {currentStep === 2 && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <User size={24} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Data Customer</h2>
                  <p className="text-sm text-white/50">Nama Sales & PIC</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Nama Sales</Label>
                  <Input
                    placeholder="Masukkan nama sales"
                    value={formData.sales_name}
                    onChange={(e) => updateFormData('sales_name', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Nama PIC</Label>
                  <select
                    value={formData.pic_id}
                    onChange={(e) => updateFormData('pic_id', e.target.value)}
                    className="w-full h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" className="bg-slate-900">Pilih PIC</option>
                    {pics.map(p => (
                      <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Screenshots */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Camera size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Screenshot Bukti</h2>
                    <p className="text-sm text-white/50">Upload 3 screenshot</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Download Screenshot */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-emerald-500/50 transition-colors cursor-pointer"
                       onClick={() => updateFormData('screenshot_download', 'uploaded')}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/20">
                        <Download size={24} className="text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Screenshot Download</p>
                        <p className="text-sm text-white/50">Bukti download app</p>
                      </div>
                      {formData.screenshot_download && (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Register Screenshot */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors cursor-pointer"
                       onClick={() => updateFormData('screenshot_register', 'uploaded')}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <UserCirclePlus size={24} className="text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Screenshot Registrasi</p>
                        <p className="text-sm text-white/50">Bukti registrasi berhasil</p>
                      </div>
                      {formData.screenshot_register && (
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating Screenshot */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-amber-500/50 transition-colors cursor-pointer"
                       onClick={() => updateFormData('screenshot_rating', 'uploaded')}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/20">
                        <Star size={24} className="text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Screenshot Rating</p>
                        <p className="text-sm text-white/50">Bukti submit rating</p>
                      </div>
                      {formData.screenshot_rating && (
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-white">Ringkasan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Tanggal</p>
                    <p className="font-medium text-white">{formData.date || '-'}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Sales</p>
                    <p className="font-medium text-white">{formData.sales_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Campaign</p>
                    <p className="font-medium text-white">
                      {campaigns.find(c => c.id === formData.campaign_id)?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60">PIC</p>
                    <p className="font-medium text-white">
                      {pics.find(p => p.id === formData.pic_id)?.name || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
            disabled={currentStep === 1}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Kembali
          </Button>
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(p => Math.min(3, p + 1))}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Lanjut
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-white/20 max-w-sm w-full">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Berhasil!</h2>
              <p className="text-white/60 mb-6">Submission berhasil disimpan</p>

              <div className="p-4 rounded-xl bg-white/5 mb-6">
                <p className="text-white/60 text-sm mb-1">Kode Aktivasi</p>
                <p className="text-2xl font-mono font-bold text-emerald-400">{submissionCode}</p>
              </div>

              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    sales_name: '',
                    pic_id: '',
                    campaign_id: '',
                    screenshot_download: null,
                    screenshot_register: null,
                    screenshot_rating: null,
                  });
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
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
