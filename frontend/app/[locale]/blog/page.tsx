'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';
import type { BlogPost } from '@/lib/types';

const CATEGORIES = [
  { slug: '', labelKey: 'catAll' as const },
  { slug: 'adopcion', labelKey: 'catAdopcion' as const },
  { slug: 'cuidado-animal', labelKey: 'catCuidado' as const },
  { slug: 'salud-animal', labelKey: 'catSalud' as const },
  { slug: 'historias', labelKey: 'catHistorias' as const },
  { slug: 'consejos', labelKey: 'catConsejos' as const },
  { slug: 'eventos', labelKey: 'catEventos' as const },
  { slug: 'voluntariado', labelKey: 'catVoluntariado' as const },
  { slug: 'nutricion', labelKey: 'catNutricion' as const },
  { slug: 'entrenamiento', labelKey: 'catEntrenamiento' as const },
  { slug: 'legislacion', labelKey: 'catLegislacion' as const },
];

const AUTHORS: Record<string, { name: string; role: string }> = {
  'tuhuella-team': { name: 'Mi Huella Team', role: 'Equipo editorial' },
  'laura-blanco': { name: 'Laura Blanco', role: 'Veterinaria' },
};

function formatPostDate(dateStr: string | null, locale: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function categoryLabel(slug: string, t: (key: string) => string) {
  const row = CATEGORIES.find((c) => c.slug === slug);
  return row ? t(row.labelKey) : slug;
}

function PostCard({ post }: { post: BlogPost }) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const author = AUTHORS[post.author] || AUTHORS['tuhuella-team'];
  return (
    <Link
      href={ROUTES.BLOG_DETAIL(post.slug)}
      data-testid="post-card"
      className="group bg-surface-primary rounded-2xl border border-border-primary/60 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col snap-start shrink-0 min-w-[min(100vw-3rem,320px)] sm:min-w-0"
    >
      {post.cover_image && (
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-tertiary">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <span className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">
            {categoryLabel(post.category, t)}
          </span>
        )}
        <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-text-tertiary leading-relaxed mb-4 line-clamp-2 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-text-quaternary gap-2">
          <span className="truncate">{author.name}</span>
          <div className="flex items-center gap-3 shrink-0">
            {post.read_time_minutes > 0 && <span>{t('readMinutes', { minutes: post.read_time_minutes })}</span>}
            <span>{formatPostDate(post.published_at, locale)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroPost({ post }: { post: BlogPost }) {
  const locale = useLocale();
  const t = useTranslations('blog');
  const author = AUTHORS[post.author] || AUTHORS['tuhuella-team'];
  const cat = categoryLabel(post.category, t);
  return (
    <Link
      href={ROUTES.BLOG_DETAIL(post.slug)}
      className="group relative bg-surface-primary rounded-2xl border border-border-primary/60 overflow-hidden hover:shadow-xl transition-all duration-300 grid md:grid-cols-2 gap-0"
    >
      <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-surface-tertiary">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-950/40 dark:to-teal-900/20 flex items-center justify-center">
            <span className="text-6xl opacity-30">📝</span>
          </div>
        )}
      </div>
      <div className="p-5 md:p-8 flex flex-col justify-center">
        <span className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3">
          {post.is_featured ? '⭐ ' : ''}{cat}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
          {post.title}
        </h2>
        <p className="text-text-tertiary leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-quaternary">
          <span>{author.name}</span>
          {post.read_time_minutes > 0 && <span>{t('readMinutesLong', { minutes: post.read_time_minutes })}</span>}
          <span>{formatPostDate(post.published_at, locale)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogListingPage() {
  const locale = useLocale();
  const t = useTranslations('blog');
  const { posts, pagination, loading, error, fetchPosts } = useBlogStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadPosts = useCallback(
    (page = 1, category = '', search = '') => {
      fetchPosts({
        page,
        page_size: 7,
        lang: locale === 'en' ? 'en' : 'es',
        ...(category && { category }),
        ...(search && { search }),
      });
    },
    [fetchPosts, locale],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadPosts(1, selectedCategory, searchQuery);
    }, searchQuery ? 300 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [selectedCategory, searchQuery, loadPosts]);

  const heroPost = !searchQuery && posts.length > 0
    ? (selectedCategory ? posts[0] : posts.find((p) => p.is_featured) || posts[0])
    : null;

  const gridPosts = heroPost
    ? posts.filter((p) => p.id !== heroPost.id)
    : posts;

  return (
    <div className="min-h-screen bg-surface-secondary min-w-0 overflow-x-hidden">
      <section className="bg-gradient-to-b from-teal-50 to-background dark:from-teal-950/30 dark:to-background pt-10 md:pt-16 pb-8 md:pb-12">
        <div className="mx-auto max-w-[1200px] px-6 text-center min-w-0">
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
            {t('title')}
          </h1>
          <p className="text-base md:text-lg text-text-tertiary max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 pb-12 md:pb-20 min-w-0">
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative w-full max-w-xl">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-quaternary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-11 pl-10 pr-4 py-2.5 rounded-xl border border-border-primary text-sm focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/25 focus:border-teal-500 dark:focus:border-teal-500/60 transition-all bg-surface-primary text-text-primary outline-none"
            />
          </div>
          <div className="-mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto pb-2 scrollbar-thin [scrollbar-width:thin]">
            <div className="flex flex-nowrap md:flex-wrap gap-2 w-max md:w-full min-w-0 snap-x snap-mandatory">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug || 'all'}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`snap-start shrink-0 px-3 py-2 md:py-1.5 rounded-full text-xs font-medium transition-colors min-h-11 md:min-h-0 ${
                    selectedCategory === cat.slug
                      ? 'bg-teal-600 text-white'
                      : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover'
                  }`}
                >
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div role="status" className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-8">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {heroPost && (
              <div className="mb-10">
                <HeroPost post={heroPost} />
              </div>
            )}

            {gridPosts.length > 0 ? (
              <div className="flex flex-nowrap gap-4 mb-10 overflow-x-auto pb-2 snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible sm:snap-none">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : !heroPost ? (
              <div className="text-center py-16 text-text-quaternary">
                {t('empty')}
              </div>
            ) : null}

            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-stretch sm:items-center gap-3 sm:flex-row sm:justify-center pt-4 pb-2 px-1 sm:px-0 border-t border-border-primary/40 sm:border-0">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => loadPosts(pagination.page - 1, selectedCategory, searchQuery)}
                  className="min-h-11 px-4 rounded-lg text-sm font-medium border border-border-primary bg-surface-primary hover:bg-surface-hover disabled:opacity-40 transition-colors w-full sm:w-auto"
                >
                  {t('previous')}
                </button>
                <span className="text-sm text-text-tertiary text-center order-first sm:order-none py-1">
                  {t('pageOfTotal', { page: pagination.page, total: pagination.totalPages })}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadPosts(pagination.page + 1, selectedCategory, searchQuery)}
                  className="min-h-11 px-4 rounded-lg text-sm font-medium border border-border-primary bg-surface-primary hover:bg-surface-hover disabled:opacity-40 transition-colors w-full sm:w-auto"
                >
                  {t('next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
