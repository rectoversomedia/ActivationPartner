'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Flag, UserCircle, User, Envelope, Phone, Camera, Check,
  DeviceMobile, MapPin, Clock, Fingerprint, X, Upload, Spinner, ShieldCheck,
  Image as ImageIcon, Info, Download, Warning
} from '@phosphor-icons/react';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { generateDeviceFingerprint, isSuspiciousDevice } from '@/lib/fraud/fingerprint';
import { analyzeScreenshot } from '@/lib/fraud/screenshot-analyzer';

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

interface EvidenceItem {
  id: string;
  label: string;
  required: boolean;
}

interface Campaign {
  id: string;
  name: string;
  code: string;
  fee_per_activation: number;
  brand_logo_url?: string;
  download_url?: string;
  form_url?: string;
  assets_url?: string;
  redirect_url?: string;
  fraud_rules: {
    require_screenshot_download: boolean;
    require_screenshot_register: boolean;
    require_screenshot_rating: boolean;
    require_gps: boolean;
    max_image_size_mb?: number;
    resize_images?: boolean;
  };
  required_evidence: EvidenceItem[];
  form_fields: FormField[];
  is_active: boolean;
}

interface SalesPerson {
  id: string;
  name: string;
  phone: string;
  is_active?: boolean;
}

interface PIC {
  id: string;
  name: string;
  phone: string;
  is_active?: boolean;
}

// Image compression utility
const compressImage = async (
  file: File,
  maxSizeMB: number = 5,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if compression needed
            const currentSizeMB = blob.size / (1024 * 1024);
            if (currentSizeMB <= maxSizeMB) {
              resolve(new File([blob], file.name, { type: file.type }));
              return;
            }

            // Further compress if still too large
            let qualityLevel = quality;
            const reduceQuality = () => {
              if (qualityLevel <= 0.1) {
                resolve(new File([blob], file.name, { type: file.type }));
                return;
              }

              qualityLevel -= 0.1;
              canvas.toBlob(
                (smallerBlob) => {
                  if (!smallerBlob) {
                    resolve(new File([blob], file.name, { type: file.type }));
                    return;
                  }

                  if (smallerBlob.size / (1024 * 1024) <= maxSizeMB) {
                    resolve(new File([smallerBlob], file.name, { type: file.type }));
                  } else {
                    reduceQuality();
                  }
                },
                file.type,
                qualityLevel
              );
            };

            reduceQuality();
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function SubmitPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [salesList, setSalesList] = React.useState<SalesPerson[]>([]);
  const [picsList, setPicsList] = React.useState<PIC[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = React.useState(true);

  // Dynamic form data
  const [formData, setFormData] = React.useState<Record<string, any>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    device_info: '',
    ip_address: '',
    gps_lat: '',
    gps_lng: '',
  });

  // Dynamic evidence files
  const [evidenceFiles, setEvidenceFiles] = React.useState<Record<string, File | null>>({});
  const [evidencePreviews, setEvidencePreviews] = React.useState<Record<string, string>>({});
  const [evidenceAnalysis, setEvidenceAnalysis] = React.useState<Record<string, any>>({});
  const [evidenceSizes, setEvidenceSizes] = React.useState<Record<string, { original: number; compressed: number }>>({});
  const [isCompressing, setIsCompressing] = React.useState<Record<string, boolean>>({});

  // Device fingerprint & behavioral data
  const [deviceFingerprintHash, setDeviceFingerprintHash] = React.useState('');
  const [isSuspicious, setIsSuspicious] = React.useState(false);
  const [suspiciousReasons, setSuspiciousReasons] = React.useState<string[]>([]);
  const [timeOnPageStart, setTimeOnPageStart] = React.useState<number>(Date.now());
  const [fieldTimings, setFieldTimings] = React.useState<Record<string, number>>({});
  const [typingSpeeds, setTypingSpeeds] = React.useState<number[]>([]);
  const [currentFieldStart, setCurrentFieldStart] = React.useState<number>(Date.now());

  // Submission result
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [submissionCode, setSubmissionCode] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [fraudResult, setFraudResult] = React.useState<any>(null);

  const selectedCampaign = campaigns.find(c => c.id === formData.campaign_id);

  // Collect device fingerprint
  React.useEffect(() => {
    const collectFingerprint = async () => {
      try {
        const fingerprint = await generateDeviceFingerprint();
        setDeviceFingerprintHash(fingerprint.hash);
        setFormData(prev => ({ ...prev, device_info: fingerprint.deviceInfo }));

        const suspicious = isSuspiciousDevice();
        setIsSuspicious(suspicious.suspicious);
        setSuspiciousReasons(suspicious.reasons);
      } catch (error) {
        console.error('Failed to collect fingerprint:', error);
      }
    };
    collectFingerprint();
  }, []);

  // Track time on page
  React.useEffect(() => {
    setTimeOnPageStart(Date.now());
  }, []);

  // Fetch master data
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
      setFormData(prev => ({ ...prev, device_info: device }));
    };
    getDeviceInfo();
  }, []);

  // Get GPS
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            gps_lat: position.coords.latitude.toFixed(6),
            gps_lng: position.coords.longitude.toFixed(6),
          }));
        },
        () => {}
      );
    }
  }, []);

  // Get IP
  React.useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setFormData(prev => ({ ...prev, ip_address: data.ip }));
      } catch {}
    };
    getIP();
  }, []);

  // Generate file hash for duplicate detection
  const generateFileHash = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return Math.random().toString(36).substring(2);
    }
  };

  // Get max image size from campaign settings
  const getMaxImageSize = (): number => {
    if (selectedCampaign?.fraud_rules?.max_image_size_mb) {
      return selectedCampaign.fraud_rules.max_image_size_mb;
    }
    return 5; // Default 5MB
  };

  const shouldResizeImages = (): boolean => {
    return selectedCampaign?.fraud_rules?.resize_images ?? true;
  };

  // Get field value options based on source
  const getFieldOptions = (field: FormField) => {
    if (field.source === 'sales') {
      return salesList.map(s => ({ label: s.name, value: s.id }));
    }
    if (field.source === 'pics') {
      return picsList.map(p => ({ label: p.name, value: p.id }));
    }
    if (field.source === 'campaigns') {
      return campaigns.map(c => ({ label: c.name, value: c.id }));
    }
    return field.options || [];
  };

  // Handle file selection with compression and analysis
  const handleEvidenceChange = async (evidenceId: string, file: File | null) => {
    if (!file) {
      // Clear evidence
      const newFiles = { ...evidenceFiles };
      delete newFiles[evidenceId];
      setEvidenceFiles(newFiles);

      setEvidencePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[evidenceId];
        return newPreviews;
      });

      setEvidenceSizes(prev => {
        const newSizes = { ...prev };
        delete newSizes[evidenceId];
        return newSizes;
      });

      setEvidenceAnalysis(prev => {
        const newAnalysis = { ...prev };
        delete newAnalysis[evidenceId];
        return newAnalysis;
      });
      return;
    }

    setIsCompressing(prev => ({ ...prev, [evidenceId]: true }));

    try {
      let processedFile = file;
      const originalSize = file.size;

      // Check if file needs compression
      const maxSize = getMaxImageSize();
      const currentSizeMB = file.size / (1024 * 1024);

      if (currentSizeMB > maxSize && shouldResizeImages()) {
        // Compress image
        processedFile = await compressImage(file, maxSize);
      }

      // Update sizes
      setEvidenceSizes(prev => ({
        ...prev,
        [evidenceId]: { original: originalSize, compressed: processedFile.size }
      }));

      // Update file
      const newFiles = { ...evidenceFiles, [evidenceId]: processedFile };
      setEvidenceFiles(newFiles);

      // Create preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        setEvidencePreviews(prev => ({ ...prev, [evidenceId]: e.target?.result as string }));

        // Analyze screenshot
        try {
          const analysis = await analyzeScreenshot(processedFile);
          setEvidenceAnalysis(prev => ({ ...prev, [evidenceId]: analysis }));
        } catch (error) {
          console.error('Screenshot analysis failed:', error);
        }
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Failed to process image:', error);
      // Still use original file if compression fails
      const newFiles = { ...evidenceFiles, [evidenceId]: file };
      setEvidenceFiles(newFiles);

      const reader = new FileReader();
      reader.onload = async (e) => {
        setEvidencePreviews(prev => ({ ...prev, [evidenceId]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(prev => ({ ...prev, [evidenceId]: false }));
    }
  };

  // Track field focus for timing
  const handleFieldFocus = (fieldName: string) => {
    const now = Date.now();
    const prevTiming = fieldTimings[fieldName] || now;
    const timeOnField = now - prevTiming;

    // Track typing speed (if there's previous timing)
    if (timeOnField > 0 && timeOnField < 5000) {
      const fieldValue = formData[fieldName] || '';
      if (fieldValue.length > 0) {
        const charsPerSecond = fieldValue.length / (timeOnField / 1000);
        if (charsPerSecond > 1 && charsPerSecond < 50) {
          setTypingSpeeds(prev => [...prev, charsPerSecond]);
        }
      }
    }

    setCurrentFieldStart(now);
    setFieldTimings(prev => ({ ...prev, [fieldName]: now }));
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.date || !formData.time || !formData.campaign_id) return false;
    if (!selectedCampaign) return false;

    // Check required fields
    for (const field of selectedCampaign.form_fields) {
      if (field.required && !formData[field.name]) return false;
    }

    // Check required evidence
    for (const evidence of selectedCampaign.required_evidence) {
      if (evidence.required && !evidenceFiles[evidence.id]) return false;
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsSubmitting(true);

    try {
      // Build form data
      const formDataToSend = new FormData();
      formDataToSend.append('campaign_id', formData.campaign_id);
      formDataToSend.append('campaign_name', selectedCampaign.name);

      // Add all form fields
      for (const field of selectedCampaign.form_fields) {
        if (field.source === 'sales') {
          const sales = salesList.find(s => s.id === formData[field.name]);
          formDataToSend.append('sales_id', formData[field.name]);
          formDataToSend.append('sales_name', sales?.name || '');
        } else if (field.source === 'pics') {
          const pic = picsList.find(p => p.id === formData[field.name]);
          formDataToSend.append('pic_id', formData[field.name]);
          formDataToSend.append('pic_name', pic?.name || '');
        } else {
          formDataToSend.append(field.name, formData[field.name] || '');
        }
      }

      // Add device fingerprint & behavioral data
      formDataToSend.append('device_info', formData.device_info || '');
      formDataToSend.append('device_fingerprint_hash', deviceFingerprintHash || '');
      formDataToSend.append('ip_address', formData.ip_address || '');
      formDataToSend.append('gps_lat', formData.gps_lat || '');
      formDataToSend.append('gps_lng', formData.gps_lng || '');

      // Add behavioral data
      const timeOnPageMs = Date.now() - timeOnPageStart;
      formDataToSend.append('time_on_page_ms', timeOnPageMs.toString());
      formDataToSend.append('typing_speeds', JSON.stringify(typingSpeeds));

      // Add evidence files with hashes for duplicate detection
      const evidenceHashes: string[] = [];
      const evidenceTypes: string[] = [];

      for (const evidence of selectedCampaign.required_evidence) {
        const file = evidenceFiles[evidence.id];
        if (file) {
          formDataToSend.append(`evidence_${evidence.id}`, file);
          // Generate hash for duplicate detection
          const hash = await generateFileHash(file);
          evidenceHashes.push(hash);
          evidenceTypes.push(evidence.id);
        } else {
          evidenceHashes.push('pending');
          evidenceTypes.push(evidence.id);
        }
      }

      formDataToSend.append('evidence_hashes', JSON.stringify(evidenceHashes));
      formDataToSend.append('evidence_types', JSON.stringify(evidenceTypes));

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      setSubmissionCode(result.submissionCode);
      setFraudResult({
        fraudDecision: result.fraudDecision,
        fraudFlags: result.fraudFlags || [],
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal submit. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      campaign_id: '',
      device_info: formData.device_info,
      ip_address: formData.ip_address,
      gps_lat: formData.gps_lat,
      gps_lng: formData.gps_lng,
    });
    setEvidenceFiles({});
    setEvidencePreviews({});
    setEvidenceSizes({});
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      <div className="max-w-md mx-auto px-4 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Report Sales</h2>
      </div>

      {/* Form */}
      {isLoadingMaster ? (
        <div className="max-w-md mx-auto px-4">
          <Card><CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading...</p>
          </CardContent></Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 pb-8">
          {/* Brand Logo - Show when campaign is selected */}
          {selectedCampaign && (
            <div className="mb-6 flex justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-4 flex items-center gap-3 text-white">
                {selectedCampaign.brand_logo_url ? (
                  <img src={selectedCampaign.brand_logo_url} alt={selectedCampaign.name} className="h-10 w-auto object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">
                    {selectedCampaign.name[0]}
                  </div>
                )}
                <div>
                  <span className="font-bold text-sm">{selectedCampaign.name}</span>
                  <p className="text-xs text-white/80">{selectedCampaign.code} • Rp {selectedCampaign.fee_per_activation?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="border-slate-200 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Campaign Selection */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Flag size={18} className="text-pink-500" />
                  Campaign
                </Label>
                <select
                  value={formData.campaign_id || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, campaign_id: e.target.value }));
                    // Reset evidence when campaign changes
                    setEvidenceFiles({});
                    setEvidencePreviews({});
                    setEvidenceSizes({});
                  }}
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                >
                  <option value="">Pilih Campaign</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Form Fields */}
              {selectedCampaign && selectedCampaign.form_fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-slate-700 font-semibold flex items-center gap-2">
                    {field.type === 'select' ? <UserCircle size={18} className="text-emerald-500" /> : <User size={18} className="text-slate-500" />}
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      onFocus={() => handleFieldFocus(field.name)}
                      required={field.required}
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                    >
                      <option value="">{field.placeholder || `Pilih ${field.label}`}</option>
                      {getFieldOptions(field).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                        onFocus={() => handleFieldFocus(field.name)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600">{field.placeholder || 'Ya'}</span>
                    </label>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      onFocus={() => handleFieldFocus(field.name)}
                      required={field.required}
                      className="border-slate-200 focus:border-blue-500 bg-white"
                    />
                  )}
                </div>
              ))}

              {/* Dynamic Evidence Upload */}
              {selectedCampaign && selectedCampaign.required_evidence.length > 0 && (
                <>
                  <div className="border-t border-slate-100 my-4" />
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera size={18} className="text-purple-500" />
                    Bukti Screenshot
                    <span className="text-xs font-normal text-slate-500 ml-auto">
                      Max {getMaxImageSize()}MB per file
                    </span>
                  </p>

                  <div className="space-y-3">
                    {selectedCampaign.required_evidence.map((evidence) => (
                      <div
                        key={evidence.id}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all duration-200',
                          evidenceFiles[evidence.id]
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-dashed border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            'p-2 rounded-lg transition-colors',
                            evidenceFiles[evidence.id] ? 'bg-blue-500' : 'bg-slate-100'
                          )}>
                            {isCompressing[evidence.id] ? (
                              <Spinner size={20} className="text-white animate-spin" />
                            ) : (
                              <Camera size={20} className={evidenceFiles[evidence.id] ? 'text-white' : 'text-slate-500'} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{evidence.label}</p>
                            {evidence.required && <p className="text-xs text-red-500">Wajib</p>}
                          </div>

                          {/* File size indicator */}
                          {evidenceSizes[evidence.id] && (
                            <div className="text-right">
                              {evidenceSizes[evidence.id].original !== evidenceSizes[evidence.id].compressed ? (
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-slate-400 line-through">{formatFileSize(evidenceSizes[evidence.id].original)}</span>
                                  <ArrowRight size={10} className="text-emerald-500" />
                                  <span className="text-emerald-600 font-semibold">{formatFileSize(evidenceSizes[evidence.id].compressed)}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">{formatFileSize(evidenceSizes[evidence.id].original)}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {evidencePreviews[evidence.id] ? (
                          <div className="relative rounded-lg overflow-hidden">
                            <img src={evidencePreviews[evidence.id]} alt="Preview" className="w-full h-40 object-cover" />
                            <button
                              type="button"
                              onClick={() => handleEvidenceChange(evidence.id, null)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all">
                            {isCompressing[evidence.id] ? (
                              <>
                                <Spinner size={24} className="text-blue-500 animate-spin mb-2" />
                                <span className="text-sm text-slate-500">Processing...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={24} className="text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500">Tap to upload</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleEvidenceChange(evidence.id, e.target.files?.[0] || null)}
                              className="hidden"
                              disabled={isCompressing[evidence.id]}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Advanced Info */}
              <div className="border-t border-slate-100 my-4" />
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
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
                    <Warning size={20} className={isSuspicious ? 'text-amber-500' : 'text-emerald-500'} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Device Fingerprint</p>
                      <p className="text-sm font-medium text-slate-700">
                        {deviceFingerprintHash ? `Hash: ${deviceFingerprintHash.substring(0, 12)}...` : 'Generating...'}
                      </p>
                      {isSuspicious && suspiciousReasons.length > 0 && (
                        <p className="text-xs text-amber-600 mt-1">⚠️ {suspiciousReasons[0]}</p>
                      )}
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
              disabled={!isFormValid() || isSubmitting}
              isLoading={isSubmitting}
              className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Submit Report'}
            </Button>
          </div>

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
          <Card className="bg-white max-w-md w-full shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {fraudResult?.fraudDecision === 'fraud' ? 'Submission Terdetekai Fraud!' : 'Berhasil!'}
              </h2>
              <p className="text-slate-500 mb-4">
                {fraudResult?.fraudDecision === 'fraud'
                  ? 'Submission terblokir karena terdeteksi fraud'
                  : 'Submission berhasil disimpan'}
              </p>

              <div className="p-4 rounded-xl bg-slate-50 mb-6">
                <p className="text-xs text-slate-500 mb-1">Kode Aktivasi</p>
                <p className="text-xl font-mono font-bold text-blue-600">{submissionCode}</p>
              </div>

              {/* Fraud Result - Simple Mode */}
              {fraudResult && (
                <div className="p-4 rounded-xl bg-slate-50 mb-6 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-blue-500" />
                      Fraud Check Result
                    </p>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold',
                      fraudResult.fraudDecision === 'valid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {fraudResult.fraudDecision === 'valid' ? 'VALID' : 'FRAUD'}
                    </span>
                  </div>

                  {/* Flags/Reasons */}
                  {fraudResult.fraudFlags && fraudResult.fraudFlags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-semibold">Alasan:</p>
                      {fraudResult.fraudFlags.map((flag: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                          <span className="text-red-500 mt-0.5">⚠️</span>
                          <p className="text-xs text-red-700">{flag.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {fraudResult.fraudDecision === 'valid' && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-emerald-500">✓</span>
                      <p className="text-xs text-emerald-700">Tidak ada indikasi fraud - submission valid</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setFraudResult(null);
                  resetForm();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {fraudResult?.fraudDecision === 'fraud' ? 'OK' : 'Submit Lagi'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper component
const ArrowRight = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 3L13 8L8 13M3 8H13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
