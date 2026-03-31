'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import AdminAccessDenied from '@/components/ui/AdminAccessDenied';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatMonth(year: number, month: number) {
  return new Date(year, month).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

const STATUS_DOT: Record<string, string> = {
  published: 'bg-teal-500 dark:bg-teal-400',
  scheduled: 'bg-blue-500 dark:bg-blue-400',
  draft: 'bg-stone-400 dark:bg-stone-500',
};

const CALENDAR_LINK_CLASS: Record<string, string> = {
  published:
    'bg-teal-50 text-teal-800 ring-1 ring-teal-200/60 dark:bg-teal-950/40 dark:text-teal-200 dark:ring-teal-700/40',
  scheduled:
    'bg-blue-50 text-blue-800 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-700/40',
  draft:
    'bg-stone-100 text-stone-700 ring-1 ring-stone-200/60 dark:bg-stone-900/35 dark:text-stone-300 dark:ring-stone-600/40',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  scheduled: 'Programado',
  draft: 'Borrador',
};

export default function AdminBlogCalendarPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { calendarPosts, loading, fetchCalendarPosts } = useBlogStore();
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(0);

  useEffect(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setMounted(true);
  }, []);

  const loadMonth = useCallback(() => {
    const start = `${year}-${pad(month + 1)}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
    fetchCalendarPosts(start, end);
  }, [year, month, fetchCalendarPosts]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const { firstDay, daysInMonth } = useMemo(() => getMonthDays(year, month), [year, month]);

  const postsByDate = useMemo(() => {
    const map: Record<string, typeof calendarPosts> = {};
    for (const p of calendarPosts) {
      if (!map[p.date]) map[p.date] = [];
      map[p.date].push(p);
    }
    return map;
  }, [calendarPosts]);

  const today = useMemo(() => {
    if (!mounted) return '';
    return new Date().toISOString().slice(0, 10);
  }, [mounted]);

  if (user && user.role !== 'admin' && !user.is_staff) {
    return (
      <AdminAccessDenied maxWidthClass="max-w-[1200px]">
        Acceso denegado. Solo el equipo autorizado puede gestionar el blog.
      </AdminAccessDenied>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 min-w-0 overflow-x-hidden">
      <div className="flex items-center gap-4 mb-8">
        <Link href={ROUTES.ADMIN_BLOG} className="inline-flex items-center justify-center min-h-11 min-w-11 -ml-1 text-text-quaternary hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-surface-hover/80">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Calendario del Blog</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={prevMonth} className="inline-flex items-center justify-center min-h-11 px-3 py-2 rounded-lg border border-border-primary text-sm hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors">← Anterior</button>
        <h2 className="text-lg font-semibold text-text-primary capitalize">{formatMonth(year, month)}</h2>
        <button type="button" onClick={nextMonth} className="inline-flex items-center justify-center min-h-11 px-3 py-2 rounded-lg border border-border-primary text-sm hover:bg-surface-hover dark:hover:bg-surface-hover transition-colors">Siguiente →</button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-text-tertiary">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[key]}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-surface-primary rounded-xl border border-border-primary overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border-tertiary">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="px-2 py-3 text-center text-xs font-medium text-text-tertiary uppercase tracking-wider">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border-tertiary bg-surface-secondary/50" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayPosts = postsByDate[dateStr] || [];
              const isToday = dateStr === today;

              return (
                <div key={day} className={`min-h-[100px] border-b border-r border-border-tertiary p-2 ${isToday ? 'bg-teal-50/50 dark:bg-teal-950/25' : ''}`}>
                  <span className={`text-xs font-medium ${isToday ? 'text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/50 px-1.5 py-0.5 rounded-full' : 'text-text-quaternary'}`}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.map((post) => {
                      const linkCls = CALENDAR_LINK_CLASS[post.calendar_status] ?? CALENDAR_LINK_CLASS.draft;
                      const dotCls = STATUS_DOT[post.calendar_status] ?? STATUS_DOT.draft;
                      return (
                      <Link
                        key={post.id}
                        href={ROUTES.ADMIN_BLOG_EDIT(post.id)}
                        className={`block px-2 py-1 rounded-lg text-[11px] leading-tight truncate hover:opacity-90 dark:hover:opacity-95 transition-opacity ${linkCls}`}
                        title={post.title_es}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle ${dotCls}`} />
                        {post.title_es}
                      </Link>
                    );})}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
