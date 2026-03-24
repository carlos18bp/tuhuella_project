'use client';

import { User, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="h-8 animate-shimmer rounded w-1/4 mb-8" />
        <div className="max-w-lg space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-4 h-16 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-bold">
          {user.first_name?.[0]?.toUpperCase() ?? <User className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Mi Perfil</h1>
          <p className="text-sm text-stone-500">Información de tu cuenta</p>
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        <div className="rounded-xl border border-stone-200 border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-stone-400" />
            <p className="text-xs text-stone-500">Nombre</p>
          </div>
          <p className="text-sm font-medium text-stone-700 mt-1.5">{user.first_name} {user.last_name}</p>
        </div>
        <div className="rounded-xl border border-stone-200 border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-stone-400" />
            <p className="text-xs text-stone-500">Email</p>
          </div>
          <p className="text-sm font-medium text-stone-700 mt-1.5">{user.email}</p>
        </div>
        <div className="rounded-xl border border-stone-200 border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-stone-400" />
            <p className="text-xs text-stone-500">Rol</p>
          </div>
          <p className="text-sm font-medium text-stone-700 mt-1.5 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
      </div>
    </div>
  );
}
