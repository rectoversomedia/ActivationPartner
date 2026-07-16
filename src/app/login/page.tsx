'use client';

import * as React from 'react';
import Image from 'next/image';
import { Lock, Eye, EyeSlash } from '@phosphor-icons/react';
import { Button, Card, CardContent, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Redirect to superadmin
      window.location.href = '/superadmin';
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-[180px] h-auto">
              <Image
                src="/Logo Rectoverso.png"
                alt="RECTOVERSO"
                width={180}
                height={72}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Super Admin Login</h1>
          <p className="text-sm text-slate-500 text-center mb-8">
            Masukkan kredensial untuk mengakses panel admin
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rectoverso.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Lock size={12} /> Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              <p><span className="font-medium">Admin:</span> admin@rectoverso.id</p>
              <p><span className="font-medium">Password:</span> Admin123!</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600">
              ← Kembali ke Dashboard
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
