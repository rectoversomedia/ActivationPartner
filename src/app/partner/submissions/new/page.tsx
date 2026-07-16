'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CaretLeft, Calendar, MapPin, User, Phone, DeviceMobile, Check, CloudArrowUp, X, Warning } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Label, Checkbox, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FormData {
  activation_date: string;
  activation_city: string;
  activation_location: string;
  customer_name: string;
  customer_phone: string;
  device_os: 'android' | 'ios';
  fifgo_downloaded: boolean;
  fifgo_registered: boolean;
  user_tried_app: boolean;
  rating_submitted: boolean;
  declaration_accepted: boolean;
}

export default function NewSubmissionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<FormData>({
    activation_date: new Date().toISOString().split('T')[0],
    activation_city: '',
    activation_location: '',
    customer_name: '',
    customer_phone: '',
    device_os: 'android',
    fifgo_downloaded: false,
    fifgo_registered: false,
    user_tried_app: false,
    rating_submitted: false,
    declaration_accepted: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.declaration_accepted) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const steps = [
    { id: 1, title: 'Info Aktivasi' },
    { id: 2, title: 'Data Customer' },
    { id: 3, title: 'Verifikasi FIFGO' },
    { id: 4, title: 'Deklarasi' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/partner/submissions"><Button variant="ghost" size="icon-sm"><CaretLeft size={20} /></Button></Link>
            <div><h1 className="text-xl font-bold text-slate-900">Submission Baru</h1><p className="text-sm text-slate-500">FIFGO Campaign</p></div>
          </div>
        </div>
        <div className="px-4 md:px-8 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm', currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500')}>
                    {currentStep > step.id ? <Check size={18} /> : step.id}
                  </div>
                  <p className={cn('text-xs mt-2 hidden sm:block', currentStep >= step.id ? 'text-blue-600' : 'text-slate-400')}>{step.title}</p>
                </div>
                {index < steps.length - 1 && <div className={cn('flex-1 h-1 mx-2 rounded-full', currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200')} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card><CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50"><Calendar size={24} className="text-blue-600" /></div>
                <div><h2 className="font-semibold text-slate-900">Informasi Aktivasi</h2><p className="text-sm text-slate-500">Waktu dan lokasi aktivasi</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label required>Tanggal Aktivasi</Label><Input type="date" value={formData.activation_date} onChange={(e) => updateFormData('activation_date', e.target.value)} /></div>
                <div className="space-y-2"><Label required>Kota</Label>
                  <Select value={formData.activation_city} onValueChange={(v) => updateFormData('activation_city', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
                    <SelectContent><SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem><SelectItem value="Jawa Barat">Jawa Barat</SelectItem><SelectItem value="Jawa Timur">Jawa Timur</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2"><Label required>Lokasi Spesifik</Label><Input placeholder="Contoh: Mall Grand Indonesia Lantai 3" value={formData.activation_location} onChange={(e) => updateFormData('activation_location', e.target.value)} /></div>
              </div>
            </CardContent></Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Card><CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50"><User size={24} className="text-purple-600" /></div>
                <div><h2 className="font-semibold text-slate-900">Data Customer</h2><p className="text-sm text-slate-500">Informasi pelanggan</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2"><Label required>Nama Lengkap</Label><Input placeholder="Nama customer" value={formData.customer_name} onChange={(e) => updateFormData('customer_name', e.target.value)} /></div>
                <div className="space-y-2"><Label required>Nomor Telepon</Label><Input type="tel" placeholder="08xxxxxxxxxx" value={formData.customer_phone} onChange={(e) => updateFormData('customer_phone', e.target.value)} /></div>
              </div>
            </CardContent></Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <Card><CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50"><DeviceMobile size={24} className="text-emerald-600" /></div>
                <div><h2 className="font-semibold text-slate-900">Verifikasi FIFGO</h2><p className="text-sm text-slate-500">Tahapan yang dilakukan customer</p></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200"><Checkbox checked={formData.fifgo_downloaded} onCheckedChange={(v) => updateFormData('fifgo_downloaded', !!v)} /><span>FIFGO Downloaded</span>{formData.fifgo_downloaded && <Check size={24} className="ml-auto text-emerald-500" />}</div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200"><Checkbox checked={formData.fifgo_registered} onCheckedChange={(v) => updateFormData('fifgo_registered', !!v)} /><span>FIFGO Registered</span>{formData.fifgo_registered && <Check size={24} className="ml-auto text-emerald-500" />}</div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200"><Checkbox checked={formData.user_tried_app} onCheckedChange={(v) => updateFormData('user_tried_app', !!v)} /><span>Tried App Features</span>{formData.user_tried_app && <Check size={24} className="ml-auto text-emerald-500" />}</div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200"><Checkbox checked={formData.rating_submitted} onCheckedChange={(v) => updateFormData('rating_submitted', !!v)} /><span>Rating Submitted</span>{formData.rating_submitted && <Check size={24} className="ml-auto text-emerald-500" />}</div>
              </div>
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-blue-400 transition-colors">
                <CloudArrowUp size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="font-medium text-slate-900">Klik untuk upload foto</p>
                <p className="text-sm text-slate-500 mt-1">PNG, JPG, HEIC - Max 10MB</p>
              </div>
            </CardContent></Card>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <Card><CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50"><Warning size={24} className="text-amber-600" /></div>
                <div><h2 className="font-semibold text-slate-900">Deklarasi & Persetujuan</h2><p className="text-sm text-slate-500">Baca dan setujui sebelum submit</p></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                <p className="text-sm text-slate-600">1. Saya menyatakan bahwa aktivasi yang saya submit adalah valid dan benar.</p>
                <p className="text-sm text-slate-600 mt-2">2. Saya telah melakukan verifikasi data customer sesuai prosedur.</p>
                <p className="text-sm text-slate-600 mt-2">3. Foto bukti yang saya lampirkan adalah foto asli dan tidak dimanipulasi.</p>
                <p className="text-sm text-slate-600 mt-2">4. Saya memahami bahwa submission palsu akan mengakibatkan penalti.</p>
              </div>
              <div className={cn('flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer', formData.declaration_accepted ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200')} onClick={() => updateFormData('declaration_accepted', !formData.declaration_accepted)}>
                <Checkbox checked={formData.declaration_accepted} onCheckedChange={(v) => updateFormData('declaration_accepted', !!v)} />
                <div><p className="font-medium text-slate-900">Saya telah membaca dan menyetujui seluruh syarat & ketentuan</p></div>
              </div>
            </CardContent></Card>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Ringkasan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-400">Tanggal</p><p className="font-medium">{formData.activation_date}</p></div>
                  <div><p className="text-slate-400">Customer</p><p className="font-medium">{formData.customer_name || '-'}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={() => setCurrentStep(p => Math.max(1, p - 1))} disabled={currentStep === 1}>Kembali</Button>
          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(p => Math.min(4, p + 1))}>Lanjut</Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!formData.declaration_accepted} className="bg-emerald-600 hover:bg-emerald-700">Submit Aktivasi</Button>
          )}
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Check size={40} className="text-emerald-600" /></div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Submission Berhasil!</h2>
            <p className="text-slate-500 mb-6">Submission Anda telah berhasil disubmit.</p>
            <Button onClick={() => router.push('/partner/submissions')} className="w-full">Lihat Submission Saya</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
