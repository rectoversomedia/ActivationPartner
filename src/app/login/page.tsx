'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeSlash, Envelope, Lock, Lightning, Users } from '@phosphor-icons/react';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (email.includes('partner')) {
        router.push('/partner/dashboard');
      } else if (email.includes('pic')) {
        router.push('/pic/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch {
      setError('Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="absolute top-32 right-32 animate-float">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Lightning size={32} weight="fill" className="text-white" />
          </div>
        </div>
        <div className="absolute bottom-40 left-40 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Users size={32} weight="fill" className="text-white" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl">
                <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={80} height={40} className="object-contain brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">RECTOVERSO</h1>
                <p className="text-white/70">Activation System</p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Kelola Aktivasi Kampanye<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Dengan Lebih Pintar
            </span>
          </h2>

          <p className="text-lg text-white/80 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Sistem manajemen aktivasi terpusat untuk tim Rectoverso dengan fraud detection, QC workflow, dan pembayaran otomatis.
          </p>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              'Multi-campaign support',
              'Real-time fraud detection',
              'Automated payment calculation',
              'Mobile-first submission form',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400/30 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4">
              <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={80} height={40} className="object-contain brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">RECTOVERSO</h1>
            <p className="text-slate-500">Activation System</p>
          </div>

          <Card className="shadow-2xl border-0 animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <Image src="/images/logo-rectoverso.svg" alt="Rectoverso" width={160} height={60} className="object-contain mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Masuk</h2>
                <p className="text-slate-500">Masukkan kredensial Anda untuk melanjutkan</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" required>Email</Label>
                  <div className="relative">
                    <Envelope size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@rectoverso.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" required>Password</Label>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center mb-4">Demo accounts:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Admin', email: 'admin@rectoverso.id' },
                    { label: 'PIC', email: 'pic1@rectoverso.id' },
                    { label: 'Partner', email: 'partner1@rectoverso.id' },
                  ].map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => setEmail(demo.email)}
                      className="p-2 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            &copy; 2026 Rectoverso Media. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
