'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';
import type { BlogPost } from '@/lib/types';

const CATEGORIES = [
  { slug: '', label: 'Todos' },
  { slug: 'adopcion', label: 'Adopción' },
  { slug: 'cuidado-animal', label: 'Cuidado Animal' },
  { slug: 'salud-animal', label: 'Salud Animal' },
  { slug: 'historias', label: 'Historias' },
  { slug: 'consejos', label: 'Consejos' },
  { slug: 'eventos', label: 'Eventos' },
  { slug: 'voluntariado', label: 'Voluntariado' },
  { slug: 'nutricion', label: 'Nutrición' },
  { slug: 'entrenamiento', label: 'Entrenamiento' },
  { slug: 'legislacion', label: 'Legislación' },
];

const AUTHORS: Record<string, { name: string; role: string }> = {
  'tuhuella-team': { name: 'Mi Huella Team', role: 'Equipo editorial' },
  'laura-blanco': { name: 'Laura Blanco', role: 'Veterinaria' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function PostCard({ post }: { post: BlogPost }) {
  const author = AUTHORS[post.author] || AUTHORS['tuhuella-team'];
  return (
    <Link
      href={ROUTES.BLOG_DETAIL(post.slug)}
      data-testid="post-card"
      className="group bg-surface-primary rounded-2xl border border-border-primary/60 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
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
          <span className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-2">
            {CATEGORIES.find((c) => c.slug === post.category)?.label || post.category}
          </span>
        )}
        <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-text-tertiary leading-relaxed mb-4 line-clamp-2 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-text-quaternary">
          <span>{author.name}</span>
          <div className="flex items-center gap-3">
            {post.read_time_minutes > 0 && <span>{post.read_time_minutes} min</span>}
            <span>{formatDate(post.published_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroPost({ post }: { post: BlogPost }) {
  const author = AUTHORS[post.author] || AUTHORS['tuhuella-team'];
  const categoryLabel = CATEGORIES.find((c) => c.slug === post.category)?.label || post.category;
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
          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center">
            <span className="text-6xl opacity-30">📝</span>
          </div>
        )}
      </div>
      <div className="p-5 md:p-8 flex flex-col justify-center">
        <span className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-3">
          {post.is_featured ? '⭐ ' : ''}{categoryLabel}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-teal-700 transition-colors">
          {post.title}
        </h2>
        <p className="text-text-tertiary leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-text-quaternary">
          <span>{author.name}</span>
          {post.read_time_minutes > 0 && <span>{post.read_time_minutes} min de lectura</span>}
          <span>{formatDate(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogListingPage() {
  const { posts, pagination, loading, error, fetchPosts } = useBlogStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadPosts = useCallback(
    (page = 1, category = '', search = '') => {
      fetchPosts({
        page,
        page_size: 7,
        lang: 'es',
        ...(category && { category }),
        ...(search && { search }),
      });
    },
    [fetchPosts],
  );

  // Fetch posts on category or search change (debounced for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadPosts(1, selectedCategory, searchQuery);
    }, searchQuery ? 300 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [selectedCategory, searchQuery, loadPosts]);

  // Determine the hero post: is_featured when showing all, first post when filtering
  const heroPost = !searchQuery && posts.length > 0
    ? (selectedCategory ? posts[0] : posts.find((p) => p.is_featured) || posts[0])
    : null;

  const gridPosts = heroPost
    ? posts.filter((p) => p.id !== heroPost.id)
    : posts;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-background pt-10 md:pt-16 pb-8 md:pb-12">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
            Blog Mi Huella
          </h1>
          <p className="text-base md:text-lg text-text-tertiary max-w-2xl mx-auto">
            Artículos sobre adopción, cuidado animal, historias inspiradoras y mucho más.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 pb-12 md:pb-20">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative w-full max-w-xl">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-quaternary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-surface-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-teal-600 text-white'
                    : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div role="status" className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-8">
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : !heroPost ? (
              <div className="text-center py-16 text-text-quaternary">
                No se encontraron artículos.
              </div>
            ) : null}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => loadPosts(pagination.page - 1, selectedCategory, searchQuery)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-border-primary hover:bg-surface-hover disabled:opacity-40 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-text-tertiary px-3">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadPosts(pagination.page + 1, selectedCategory, searchQuery)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-border-primary hover:bg-surface-hover disabled:opacity-40 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
