'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';

const AUTHORS: Record<string, { name: string; role: string; avatar: string }> = {
  'tuhuella-team': { name: 'Mi Huella Team', role: 'Equipo editorial', avatar: '🐾' },
  'laura-blanco': { name: 'Laura Blanco', role: 'Veterinaria', avatar: '👩‍⚕️' },
};

const CATEGORIES: Record<string, string> = {
  'adopcion': 'Adopción',
  'cuidado-animal': 'Cuidado Animal',
  'salud-animal': 'Salud Animal',
  'historias': 'Historias',
  'consejos': 'Consejos',
  'eventos': 'Eventos',
  'voluntariado': 'Voluntariado',
  'nutricion': 'Nutrición',
  'entrenamiento': 'Entrenamiento',
  'legislacion': 'Legislación',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ShareButton({ title, slug }: { title: string; slug: string }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-sm text-stone-600 hover:bg-stone-100 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Compartir
    </button>
  );
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { post, loading, error, fetchPost, clearPost } = useBlogStore();

  useEffect(() => {
    if (slug) {
      fetchPost(slug, 'es');
    }
    return () => clearPost();
  }, [slug, fetchPost, clearPost]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <p className="text-stone-500">{error || 'Artículo no encontrado.'}</p>
        <Link
          href={ROUTES.BLOG}
          className="text-teal-600 hover:text-teal-700 text-sm font-medium"
        >
          ← Volver al blog
        </Link>
      </div>
    );
  }

  const author = AUTHORS[post.author] || AUTHORS['tuhuella-team'];
  const categoryLabel = CATEGORIES[post.category] || post.category;

  return (
    <div className="min-h-screen bg-stone-50">
      <ReadingProgressBar readTimeMinutes={post.read_time_minutes} lang="es" />

      {/* Header */}
      <section className="bg-gradient-to-b from-teal-50 to-stone-50 pt-12 pb-8">
        <div className="mx-auto max-w-[800px] px-6">
          <Link
            href={ROUTES.BLOG}
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Blog
          </Link>

          {categoryLabel && (
            <span className="inline-block text-xs font-medium text-teal-600 uppercase tracking-wider mb-3">
              {categoryLabel}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-stone-500 mb-6">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{author.avatar}</span>
              <div>
                <p className="font-medium text-stone-700">{author.name}</p>
                <p className="text-xs text-stone-400">{author.role}</p>
              </div>
            </div>
            <span className="hidden sm:inline text-stone-300">·</span>
            <span>{formatDate(post.published_at)}</span>
            {post.read_time_minutes > 0 && (
              <>
                <span className="hidden sm:inline text-stone-300">·</span>
                <span>{post.read_time_minutes} min de lectura</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mx-auto max-w-[1000px] px-6 -mt-2 mb-10">
          <figure>
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full rounded-2xl object-cover max-h-[500px] shadow-lg"
            />
            {post.cover_image_credit && (
              <figcaption className="text-xs text-stone-400 mt-2 text-center">
                {post.cover_image_credit_url ? (
                  <a
                    href={post.cover_image_credit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-600 transition-colors"
                  >
                    {post.cover_image_credit}
                  </a>
                ) : (
                  post.cover_image_credit
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-[800px] px-6 pb-16">
        <BlogContentRenderer
          contentJson={post.content_json}
          contentHtml={post.content}
        />

        {/* Sources */}
        {post.sources && post.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-stone-200">
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-3">
              Fuentes
            </h3>
            <ul className="space-y-1">
              {post.sources.map((source, i) => (
                <li key={i} className="text-sm">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Share + Nav */}
        <div className="mt-12 pt-8 border-t border-stone-200 flex items-center justify-between">
          <ShareButton title={post.title} slug={post.slug} />
          <Link
            href={ROUTES.BLOG}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Ver todos los artículos →
          </Link>
        </div>
      </div>
    </div>
  );
}
