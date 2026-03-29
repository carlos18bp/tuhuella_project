'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';

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

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-teal-500',
  scheduled: 'bg-blue-500',
  draft: 'bg-stone-400',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  scheduled: 'Programado',
  draft: 'Borrador',
};

export default function AdminBlogCalendarPage() {
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

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={ROUTES.ADMIN_BLOG} className="text-text-quaternary hover:text-text-secondary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Calendario del Blog</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={prevMonth} className="px-3 py-2 rounded-lg border border-border-primary text-sm hover:bg-surface-hover transition-colors">← Anterior</button>
        <h2 className="text-lg font-semibold text-text-primary capitalize">{formatMonth(year, month)}</h2>
        <button type="button" onClick={nextMonth} className="px-3 py-2 rounded-lg border border-border-primary text-sm hover:bg-surface-hover transition-colors">Siguiente →</button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-text-tertiary">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[key]}`} />
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
                <div key={day} className={`min-h-[100px] border-b border-r border-border-tertiary p-2 ${isToday ? 'bg-teal-50/50' : ''}`}>
                  <span className={`text-xs font-medium ${isToday ? 'text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-full' : 'text-text-quaternary'}`}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={ROUTES.ADMIN_BLOG_EDIT(post.id)}
                        className="block px-2 py-1 rounded-lg text-[11px] leading-tight truncate hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: post.calendar_status === 'published' ? '#ccfbf1' : post.calendar_status === 'scheduled' ? '#dbeafe' : '#f5f5f4',
                          color: post.calendar_status === 'published' ? '#0f766e' : post.calendar_status === 'scheduled' ? '#1d4ed8' : '#78716c',
                        }}
                        title={post.title_es}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_COLORS[post.calendar_status]}`} />
                        {post.title_es}
                      </Link>
                    ))}
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
