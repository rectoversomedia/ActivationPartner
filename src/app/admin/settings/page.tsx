'use client';

import * as React from 'react';
import { Gear, Bell, Shield, Key, Users, Trophy, FileText, Database, Palette, Check } from '@phosphor-icons/react';
import { Button, Card, CardContent, Badge, Input, Label, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

const mockSettings = {
  general: {
    organization_name: 'Rectoverso Media',
    organization_code: 'RECTOVERSO',
    timezone: 'Asia/Jakarta',
    date_format: 'DD/MM/YYYY',
    currency: 'IDR',
  },
  notifications: {
    email_on_submission: true,
    email_on_qc_decision: true,
    email_on_payment: true,
    slack_webhook: '',
    push_notifications: true,
  },
  fraud: {
    auto_hold_threshold: 60,
    auto_escalate_threshold: 80,
    duplicate_phone_window: 7,
    suspicious_velocity_threshold: 5,
    suspicious_time_window: 10,
  },
  security: {
    require_2fa: false,
    session_timeout: 30,
    password_min_length: 8,
    ip_whitelist_enabled: false,
    ip_whitelist: '',
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState(mockSettings);
  const [activeTab, setActiveTab] = React.useState('general');
  const [saved, setSaved] = React.useState(false);
  const [showApiKey, setShowApiKey] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (section: string, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Konfigurasi sistem</p>
          </div>
          <Button onClick={handleSave}>
            <Check size={18} className="mr-2" />Save Changes
          </Button>
        </div>
      </header>

      {saved && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-500 text-white rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <Check size={20} />Settings saved successfully
        </div>
      )}

      <div className="px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Gear },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'fraud', label: 'Fraud Detection', icon: Shield },
                    { id: 'security', label: 'Security', icon: Key },
                    { id: 'campaigns', label: 'Campaign Defaults', icon: Trophy },
                    { id: 'integrations', label: 'Integrations', icon: Database },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <tab.icon size={20} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <Gear size={20} className="text-blue-500" />General Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Organization Name</Label>
                        <Input
                          value={settings.general.organization_name}
                          onChange={(e) => updateSetting('general', 'organization_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Organization Code</Label>
                        <Input value={settings.general.organization_code} disabled className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select value={settings.general.timezone} onValueChange={(v) => updateSetting('general', 'timezone', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Jakarta">Asia/Jakarta (GMT+7)</SelectItem>
                            <SelectItem value="Asia/Makassar">Asia/Makassar (GMT+8)</SelectItem>
                            <SelectItem value="Asia/Jayapura">Asia/Jayapura (GMT+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date Format</Label>
                        <Select value={settings.general.date_format} onValueChange={(v) => updateSetting('general', 'date_format', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <FileText size={20} className="text-purple-500" />System Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Version</span>
                        <span className="font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Environment</span>
                        <Badge variant="info">Production</Badge>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Database</span>
                        <span className="font-medium">Supabase</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Last Backup</span>
                        <span className="font-medium">Today, 03:00 AM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-amber-500" />Notification Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-500">Receive email when new submission is created</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', 'email_on_submission', !settings.notifications.email_on_submission)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative',
                          settings.notifications.email_on_submission ? 'bg-blue-500' : 'bg-slate-300'
                        )}
                      >
                        <div className={cn(
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                          settings.notifications.email_on_submission ? 'translate-x-7' : 'translate-x-1'
                        )} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">QC Decision Notifications</p>
                        <p className="text-sm text-slate-500">Receive email when QC makes a decision</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', 'email_on_qc_decision', !settings.notifications.email_on_qc_decision)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative',
                          settings.notifications.email_on_qc_decision ? 'bg-blue-500' : 'bg-slate-300'
                        )}
                      >
                        <div className={cn(
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                          settings.notifications.email_on_qc_decision ? 'translate-x-7' : 'translate-x-1'
                        )} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">Payment Notifications</p>
                        <p className="text-sm text-slate-500">Receive email when payments are processed</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', 'email_on_payment', !settings.notifications.email_on_payment)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative',
                          settings.notifications.email_on_payment ? 'bg-blue-500' : 'bg-slate-300'
                        )}
                      >
                        <div className={cn(
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                          settings.notifications.email_on_payment ? 'translate-x-7' : 'translate-x-1'
                        )} />
                      </button>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-200">
                      <Label>Slack Webhook URL (Optional)</Label>
                      <Input
                        placeholder="https://hooks.slack.com/services/..."
                        value={settings.notifications.slack_webhook}
                        onChange={(e) => updateSetting('notifications', 'slack_webhook', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'fraud' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-red-500" />Fraud Detection Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Auto-Hold Threshold (Risk Score)</Label>
                        <Input
                          type="number"
                          value={settings.fraud.auto_hold_threshold}
                          onChange={(e) => updateSetting('fraud', 'auto_hold_threshold', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-slate-500">Submissions with risk score above this will be auto-held</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Auto-Escalate Threshold (Risk Score)</Label>
                        <Input
                          type="number"
                          value={settings.fraud.auto_escalate_threshold}
                          onChange={(e) => updateSetting('fraud', 'auto_escalate_threshold', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-slate-500">Submissions above this will be escalated for fraud review</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Duplicate Phone Window (Days)</Label>
                        <Input
                          type="number"
                          value={settings.fraud.duplicate_phone_window}
                          onChange={(e) => updateSetting('fraud', 'duplicate_phone_window', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-slate-500">Days to check for duplicate phone numbers</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Suspicious Velocity Threshold</Label>
                        <Input
                          type="number"
                          value={settings.fraud.suspicious_velocity_threshold}
                          onChange={(e) => updateSetting('fraud', 'suspicious_velocity_threshold', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-slate-500">Max submissions per partner in time window</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <Key size={20} className="text-purple-500" />Security Settings
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                          <p className="text-sm text-slate-500">Require 2FA for all admin users</p>
                        </div>
                        <button
                          onClick={() => updateSetting('security', 'require_2fa', !settings.security.require_2fa)}
                          className={cn(
                            'w-12 h-6 rounded-full transition-colors relative',
                            settings.security.require_2fa ? 'bg-blue-500' : 'bg-slate-300'
                          )}
                        >
                          <div className={cn(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            settings.security.require_2fa ? 'translate-x-7' : 'translate-x-1'
                          )} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Session Timeout (Minutes)</Label>
                          <Select value={String(settings.security.session_timeout)} onValueChange={(v) => updateSetting('security', 'session_timeout', parseInt(v))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Minimum Password Length</Label>
                          <Select value={String(settings.security.password_min_length)} onValueChange={(v) => updateSetting('security', 'password_min_length', parseInt(v))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">6 characters</SelectItem>
                              <SelectItem value="8">8 characters</SelectItem>
                              <SelectItem value="12">12 characters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-6">API Keys</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-slate-700">Production API Key</p>
                          <Button variant="ghost" size="sm">Regenerate</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value="••••••••••••••••••••••••••••••••"
                            disabled
                            className="font-mono"
                          />
                          <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                            {showApiKey ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" />Campaign Default Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Fee per Activation</Label>
                      <Input type="number" placeholder="5000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>QC SLA (Hours)</Label>
                      <Input type="number" defaultValue="48" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Submissions per Day</Label>
                      <Input type="number" defaultValue="50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'integrations' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Database size={20} className="text-cyan-500" />Integrations
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Supabase', status: 'connected', description: 'Database & Authentication' },
                      { name: 'Slack', status: 'not_connected', description: 'Team notifications' },
                      { name: 'Twilio', status: 'not_connected', description: 'SMS notifications' },
                      { name: 'Google Sheets', status: 'not_connected', description: 'Export data' },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-900">{integration.name}</p>
                          <p className="text-sm text-slate-500">{integration.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={integration.status === 'connected' ? 'success' : 'outline'}>
                            {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                          </Badge>
                          <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                            {integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
