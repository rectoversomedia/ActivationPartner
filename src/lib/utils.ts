import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency to Indonesian Rupiah
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Format date to Indonesian format
export function formatDate(date: string | Date, formatStr: string = 'dd MMMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: id });
}

// Format datetime to Indonesian format
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMMM yyyy, HH:mm', { locale: id });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

// Phone number normalization (Indonesian)
export function normalizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Convert 08xx to +62xx
  if (normalized.startsWith('0')) {
    normalized = '+62' + normalized.slice(1);
  }

  // Add + if not present
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  return normalized;
}

// Mask phone number
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 8) {
    return digits.slice(0, 4) + '****' + digits.slice(-4);
  }
  return phone;
}

// Generate unique code
export function generateCode(prefix: string, length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Status color mapping
export const statusColors = {
  // User status
  invited: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  suspended: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },

  // Campaign status
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  upcoming: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  archived: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },

  // Submission status
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  under_automated_check: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  pending_qc: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  need_revision: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  resubmitted: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  valid: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  non_valid: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  suspected_fraud: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
  confirmed_fraud: { bg: 'bg-red-200', text: 'text-red-800', dot: 'bg-red-600' },
  duplicate: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  included_in_batch: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  paid: { bg: 'bg-green-200', text: 'text-green-800', dot: 'bg-green-600' },

  // Fraud risk
  low: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },

  // Payment status
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  partially_paid: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
} as const;

// Status labels
export const statusLabels = {
  invited: 'Diundang',
  active: 'Aktif',
  suspended: 'Ditangguhkan',
  inactive: 'Tidak Aktif',
  draft: 'Draft',
  upcoming: 'Akan Datang',
  paused: 'Dijeda',
  completed: 'Selesai',
  archived: 'Diarsipkan',
  submitted: 'Terkirim',
  under_automated_check: 'Dicek Otomatis',
  pending_qc: 'Menunggu QC',
  need_revision: 'Perlu Revisi',
  resubmitted: 'Dikirim Ulang',
  valid: 'Valid',
  non_valid: 'Tidak Valid',
  suspected_fraud: 'Dicurigai',
  confirmed_fraud: 'Kecurangan',
  duplicate: 'Duplikat',
  cancelled: 'Dibatalkan',
  included_in_batch: 'Dalam Pembayaran',
  paid: 'Dibayar',
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
  processing: 'Diproses',
  failed: 'Gagal',
  partially_paid: 'Sebagian',
} as const;

// Role colors
export const roleColors = {
  super_admin: { bg: 'bg-purple-500', text: 'text-white', icon: '🎯' },
  campaign_manager: { bg: 'bg-blue-500', text: 'text-white', icon: '📊' },
  pic: { bg: 'bg-emerald-500', text: 'text-white', icon: '👥' },
  qc_reviewer: { bg: 'bg-amber-500', text: 'text-white', icon: '✅' },
  partner: { bg: 'bg-cyan-500', text: 'text-white', icon: '🤝' },
} as const;

// Device OS colors
export const deviceOsColors = {
  android: { bg: 'bg-green-100', text: 'text-green-700', icon: '🤖' },
  ios: { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🍎' },
} as const;

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone (Indonesian)
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Slugify
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Calculate fraud risk level from score
export function getFraudRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'critical';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Allowed file types for evidence
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
  'application/pdf',
];

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
