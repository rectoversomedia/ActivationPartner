'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeSlash, Envelope, Lock } from '@phosphor-icons/react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/30 mb-4">
            <Image
              src="/images/logo-rectoverso.svg"
              alt="Rectoverso"
              width={48}
              height={48}
              className="object-contain brightness-0 invert"
            />
          </div>
          <<h1 className="text-3xl font-bold text-white">RECTOVERSO</h1>
          <p className="text-white/60">Activation System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <CardContent className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Masuk</h2>
              <p className="text-slate-500 text-sm">Masukkan kredensial Anda untuk melanjutkan</p>
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
                    className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white"
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
                    className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 focus:bg-white"
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
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                isLoading={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center mb-3">Demo accounts:</p>
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
                    className="p-2.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-slate-700"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/40 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          &copy; 2026 Rectoverso Media. All rights reserved.
        </p>
      </div>
    </div>
  );
}
