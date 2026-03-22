'use client';

import { useAuthStore } from '@/lib/stores/authStore';

export default function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <p className="text-stone-400">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Mi Perfil</h1>

      <div className="mt-8 max-w-lg space-y-4">
        <div className="rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500">Nombre</p>
          <p className="text-sm font-medium text-stone-700 mt-1">{user.first_name} {user.last_name}</p>
        </div>
        <div className="rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500">Email</p>
          <p className="text-sm font-medium text-stone-700 mt-1">{user.email}</p>
        </div>
        <div className="rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500">Rol</p>
          <p className="text-sm font-medium text-stone-700 mt-1 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
      </div>
    </div>
  );
}
