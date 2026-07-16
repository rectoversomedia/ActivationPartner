'use client';

import * as React from 'react';
import { ChartLineUp, DownloadSimple, Calendar, Users, FileText, CheckCircle, CurrencyCircleDollar, TrendUp, TrendDown, Eye } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui';
import { cn, formatIDR, formatNumber, formatDate } from '@/lib/utils';

const weeklyData = [
  { day: 'Sen', submissions: 145, valid: 120 },
  { day: 'Sel', submissions: 168, valid: 138 },
  { day: 'Rab', submissions: 189, valid: 152 },
  { day: 'Kam', submissions: 156, valid: 128 },
  { day: 'Jum', submissions: 201, valid: 165 },
  { day: 'Sab', submissions: 178, valid: 145 },
  { day: 'Min', submissions: 210, valid: 108 },
];

const monthlyData = [
  { month: 'Jan', submissions: 3420, valid: 2890 },
  { month: 'Feb', submissions: 3680, valid: 3120 },
  { month: 'Mar', submissions: 4150, valid: 3560 },
  { month: 'Apr', submissions: 3890, valid: 3340 },
  { month: 'Mei', submissions: 4320, valid: 3780 },
  { month: 'Jun', submissions: 4650, valid: 4120 },
];

const cityData = [
  { city: 'Jakarta', submissions: 2340, valid: 2100, validRate: 89.7 },
  { city: 'Surabaya', submissions: 1890, valid: 1650, validRate: 87.3 },
  { city: 'Bandung', submissions: 1450, valid: 1280, validRate: 88.3 },
  { city: 'Medan', submissions: 980, valid: 845, validRate: 86.2 },
  { city: 'Semarang', submissions: 760, valid: 680, validRate: 89.5 },
];

const topPartners = [
  { rank: 1, name: 'Ahmad Fauzi', valid: 156, earnings: 780000 },
  { rank: 2, name: 'Budi Santoso', valid: 142, earnings: 710000 },
  { rank: 3, name: 'Citra Dewi', valid: 138, earnings: 690000 },
  { rank: 4, name: 'Dian Pratama', valid: 125, earnings: 625000 },
  { rank: 5, name: 'Eko Wijaya', valid: 118, earnings: 590000 },
  { rank: 6, name: 'Fitri Handayani', valid: 105, earnings: 525000 },
  { rank: 7, name: 'Gunawan Setiawan', valid: 98, earnings: 490000 },
  { rank: 8, name: 'Hendra Kusuma', valid: 92, earnings: 460000 },
  { rank: 9, name: 'Ika Wulandari', valid: 88, earnings: 440000 },
  { rank: 10, name: 'Joko Pramono', valid: 85, earnings: 425000 },
];

const fraudStats = [
  { type: 'Duplicate Phone', count: 45, percentage: 35 },
  { type: 'Suspicious Pattern', count: 32, percentage: 25 },
  { type: 'Manipulated Evidence', count: 26, percentage: 20 },
  { type: 'SOP Violation', count: 18, percentage: 14 },
  { type: 'Other', count: 8, percentage: 6 },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = React.useState('weekly');
  const [campaign, setCampaign] = React.useState('all');

  const maxWeekly = Math.max(...weeklyData.map(d => d.submissions));
  const maxMonthly = Math.max(...monthlyData.map(d => d.submissions));
  const totalSubmissions = weeklyData.reduce((sum, d) => sum + d.submissions, 0);
  const totalValid = weeklyData.reduce((sum, d) => sum + d.valid, 0);
  const validRate = ((totalValid / totalSubmissions) * 100).toFixed(1);
  const totalEarnings = topPartners.reduce((sum, p) => sum + p.earnings, 0);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-sm text-slate-500">Analisis performa campaign</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={campaign} onValueChange={setCampaign}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select campaign" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="fifgo">FIFGO Campaign</SelectItem>
                <SelectItem value="brandx">Brand X</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><DownloadSimple size={18} className="mr-2" />Export</Button>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Submissions</p>
                  <p className="text-3xl font-bold">{formatNumber(totalSubmissions)}</p>
                  <div className="flex items-center gap-1 mt-2 text-blue-100 text-sm">
                    <TrendUp size={14} />
                    <span>+12.5% vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl"><FileText size={28} weight="fill" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Valid Rate</p>
                  <p className="text-3xl font-bold text-emerald-600">{validRate}%</p>
                  <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
                    <TrendUp size={14} />
                    <span>+3.2%</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl"><CheckCircle size={28} className="text-emerald-500" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Active Partners</p>
                  <p className="text-3xl font-bold">15</p>
                  <div className="flex items-center gap-1 mt-2 text-slate-500 text-sm">
                    <Users size={14} />
                    <span>of 18 total</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl"><Users size={28} className="text-purple-500" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-amber-600">{formatIDR(totalEarnings)}</p>
                  <div className="flex items-center gap-1 mt-2 text-amber-600 text-sm">
                    <TrendUp size={14} />
                    <span>+8.3%</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl"><CurrencyCircleDollar size={28} className="text-amber-500" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submissions Trend */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Submission Trend</h3>
                  <p className="text-sm text-slate-500">{period === 'weekly' ? 'This week' : 'This month'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPeriod('weekly')}
                    className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', period === 'weekly' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100')}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setPeriod('monthly')}
                    className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', period === 'monthly' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100')}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-3">
                {(period === 'weekly' ? weeklyData : monthlyData).map((data, i) => {
                  const maxValue = period === 'weekly' ? maxWeekly : maxMonthly;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end gap-1 h-40">
                        <div className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700" style={{ height: `${(data.submissions / maxValue) * 100}%` }} />
                        <div className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-700" style={{ height: `${(data.valid / maxValue) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{data.day || data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-slate-500">Submissions</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-500">Valid</span></div>
              </div>
            </CardContent>
          </Card>

          {/* City Performance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Performance by City</h3>
                  <p className="text-sm text-slate-500">Top cities by submissions</p>
                </div>
              </div>
              <div className="space-y-4">
                {cityData.map((city, i) => (
                  <div key={city.city} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-medium text-slate-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{city.city}</span>
                        <span className="text-sm text-slate-500">{formatNumber(city.submissions)} ({city.validRate}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${(city.submissions / cityData[0].submissions) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Partners */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Top Partners Leaderboard</h3>
                  <p className="text-sm text-slate-500">Based on valid submissions</p>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Rank</th>
                      <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Partner</th>
                      <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase">Valid</th>
                      <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topPartners.slice(0, 8).map((partner) => (
                      <tr key={partner.rank}>
                        <td className="py-3">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', partner.rank <= 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600')}>
                            {partner.rank}
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-slate-900">{partner.name}</p>
                        </td>
                        <td className="py-3 text-right font-medium text-slate-700">{formatNumber(partner.valid)}</td>
                        <td className="py-3 text-right font-bold text-emerald-600">{formatIDR(partner.earnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Distribution */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Fraud Types</h3>
                  <p className="text-sm text-slate-500">Distribution this month</p>
                </div>
              </div>
              <div className="space-y-4">
                {fraudStats.map((stat) => (
                  <div key={stat.type} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-700">{stat.type}</span>
                        <span className="text-sm text-slate-500">{stat.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${stat.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>Total Fraud Cases:</strong> {fraudStats.reduce((sum, s) => sum + s.count, 0)} submissions
                </p>
                <p className="text-xs text-red-600 mt-1">Fraud Rate: 3.2% of total submissions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Download Reports</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Weekly Summary', icon: Calendar, format: 'PDF' },
                { label: 'Partner Performance', icon: Users, format: 'Excel' },
                { label: 'Fraud Analysis', icon: ChartLineUp, format: 'PDF' },
                { label: 'Payment Report', icon: CurrencyCircleDollar, format: 'Excel' },
              ].map((report) => (
                <button key={report.label} className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="p-3 bg-slate-100 rounded-xl"><report.icon size={24} className="text-slate-500" /></div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">{report.label}</p>
                    <p className="text-xs text-slate-400">{report.format}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
