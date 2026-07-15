'use client';

import * as React from 'react';
import { cn, formatIDR, formatNumber } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui';
import {
  TrendUp,
  TrendDown,
  Lightning,
  Trophy,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  Target,
  Users,
  FileText,
  CurrencyCircleDollar,
  ChartLineUp,
  Pulse,
  ClipboardText,
} from '@phosphor-icons/react';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  format?: 'number' | 'currency' | 'percentage';
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-500',
  iconBg = 'bg-blue-50',
  trend,
  format = 'number',
  delay = 0,
}: StatCardProps) {
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
  const animatedValue = useAnimatedCounter(numericValue);

  const displayValue = React.useMemo(() => {
    if (format === 'currency') return formatIDR(animatedValue);
    if (format === 'percentage') return `${animatedValue}%`;
    return formatNumber(animatedValue);
  }, [animatedValue, format]);

  return (
    <Card className="relative overflow-hidden card-hover animate-fade-in-up group" style={{ animationDelay: `${delay}s` }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity" />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{displayValue}</h3>
              {subtitle && (
                <span className="text-sm text-slate-400">{subtitle}</span>
              )}
            </div>

            {/* Trend indicator */}
            {trend && (
              <div className="flex items-center gap-1.5 mt-3">
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                    trend.isPositive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendUp size={14} weight="bold" />
                  ) : (
                    <TrendDown size={14} weight="bold" />
                  )}
                  {trend.value}%
                </span>
                {trend.label && (
                  <span className="text-xs text-slate-400">{trend.label}</span>
                )}
              </div>
            )}
          </div>

          {/* Icon */}
          <div className={cn('p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110', iconBg)}>
            <Icon size={28} weight="duotone" className={iconColor} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Grid
interface QuickStatsGridProps {
  stats: StatCardProps[];
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}

// Status Card (for partner dashboard)
interface StatusCardProps {
  status: string;
  count: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay?: number;
}

export function StatusCard({ status, count, icon: Icon, color, bgColor, delay = 0 }: StatusCardProps) {
  const animatedCount = useAnimatedCounter(count);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={cn('p-3 rounded-xl', bgColor)}>
        <Icon size={24} weight="fill" className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{status}</p>
        <p className="text-xl font-bold text-slate-900">{animatedCount}</p>
      </div>
    </div>
  );
}

// Earnings Card
interface EarningsCardProps {
  validActivations: number;
  feePerActivation: number;
  paidAmount: number;
  unpaidAmount: number;
  delay?: number;
}

export function EarningsCard({
  validActivations,
  feePerActivation,
  paidAmount,
  unpaidAmount,
  delay = 0,
}: EarningsCardProps) {
  const totalUnpaid = validActivations * feePerActivation;

  return (
    <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border-0 overflow-hidden animate-fade-in-up relative" style={{ animationDelay: `${delay}s` }}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Estimasi Earnings</p>
            <h3 className="text-3xl font-bold text-white">{formatIDR(totalUnpaid)}</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Wallet size={28} weight="fill" className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-emerald-100 text-xs">Aktivasi Valid</p>
            <p className="text-white font-bold">{formatNumber(validActivations)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-emerald-100 text-xs">Fee/Aktivasi</p>
            <p className="text-white font-bold">{formatIDR(feePerActivation)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-100">Sudah Dibayar</span>
            <span className="text-white font-semibold">{formatIDR(paidAmount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-emerald-100">Belum Dibayar</span>
            <span className="text-white font-semibold">{formatIDR(unpaidAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Progress Card
interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  icon: React.ElementType;
  color: string;
  unit?: string;
  delay?: number;
}

export function ProgressCard({
  title,
  current,
  target,
  icon: Icon,
  color,
  unit = '',
  delay = 0,
}: ProgressCardProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('p-2.5 rounded-xl', color)}>
            <Icon size={20} weight="bold" className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xs text-slate-400">
              Target: {formatNumber(target)} {unit}
            </p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-slate-900">{formatNumber(current)} {unit}</span>
            <span className="text-slate-500">{percentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000 ease-out', color.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').replace('-600', '-500 to-'))}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Card
interface ActivityItem {
  id: string;
  type: 'submission' | 'qc' | 'payment' | 'fraud';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  delay?: number;
}

export function RecentActivityCard({ activities, delay = 0 }: RecentActivityCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return FileText;
      case 'qc':
        return CheckCircle;
      case 'payment':
        return CurrencyCircleDollar;
      case 'fraud':
        return Warning;
      default:
        return Pulse;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'submission':
        return { bg: 'bg-blue-50', text: 'text-blue-500' };
      case 'qc':
        return { bg: 'bg-emerald-50', text: 'text-emerald-500' };
      case 'payment':
        return { bg: 'bg-amber-50', text: 'text-amber-500' };
      case 'fraud':
        return { bg: 'bg-red-50', text: 'text-red-500' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-500' };
    }
  };

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Aktivitas Terbaru</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lihat Semua</button>
        </div>

        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            const colors = getColor(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer animate-fade-in"
                style={{ animationDelay: `${(delay + 0.1 + index * 0.05)}s` }}
              >
                <div className={cn('p-2 rounded-lg', colors.bg)}>
                  <Icon size={18} weight="fill" className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{activity.timestamp}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Leaderboard Card
interface LeaderboardItem {
  rank: number;
  name: string;
  value: number;
  avatar?: string;
}

interface LeaderboardCardProps {
  title: string;
  items: LeaderboardItem[];
  unit?: string;
  icon?: React.ElementType;
  delay?: number;
}

export function LeaderboardCard({
  title,
  items,
  unit = '',
  icon: Icon = Trophy,
  delay = 0,
}: LeaderboardCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white';
      case 2:
        return 'bg-gradient-to-br from-slate-300 to-slate-400 text-white';
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
            <Icon size={20} weight="fill" className="text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <div
              key={item.rank}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors animate-fade-in"
              style={{ animationDelay: `${(delay + 0.1 + index * 0.05)}s` }}
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', getRankColor(item.rank))}>
                {item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
              </div>
              <span className="text-sm font-bold text-slate-700">
                {formatNumber(item.value)} {unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// QC Queue Summary Card
interface QcQueueSummaryProps {
  pending: number;
  valid: number;
  invalid: number;
  needRevision: number;
  avgTimeHours: number;
  delay?: number;
}

export function QcQueueSummary({
  pending,
  valid,
  invalid,
  needRevision,
  avgTimeHours,
  delay = 0,
}: QcQueueSummaryProps) {
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
            <ClipboardText size={20} weight="fill" className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">QC Summary</h3>
            <p className="text-xs text-slate-500">Avg. turnaround: {avgTimeHours}h</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatusCard
            status="Pending"
            count={pending}
            icon={Clock}
            color="text-amber-500"
            bgColor="bg-amber-50"
            delay={delay + 0.1}
          />
          <StatusCard
            status="Valid"
            count={valid}
            icon={CheckCircle}
            color="text-emerald-500"
            bgColor="bg-emerald-50"
            delay={delay + 0.15}
          />
          <StatusCard
            status="Invalid"
            count={invalid}
            icon={XCircle}
            color="text-red-500"
            bgColor="bg-red-50"
            delay={delay + 0.2}
          />
          <StatusCard
            status="Revision"
            count={needRevision}
            icon={FileText}
            color="text-orange-500"
            bgColor="bg-orange-50"
            delay={delay + 0.25}
          />
        </div>
      </CardContent>
    </Card>
  );
}
