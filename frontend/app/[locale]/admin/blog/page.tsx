'use client';

import { useEffect, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isScheduled(post: { is_published: boolean; published_at: string | null }) {
  return !post.is_published && post.published_at && new Date(post.published_at) > new Date();
}

function statusLabel(post: { is_published: boolean; published_at: string | null }) {
  if (post.is_published) return 'Publicado';
  if (isScheduled(post)) return `Programado: ${formatDate(post.published_at)}`;
  return 'Borrador';
}

function statusBadgeClass(post: { is_published: boolean; published_at: string | null }) {
  if (post.is_published) return 'bg-teal-50 text-teal-700';
  if (isScheduled(post)) return 'bg-blue-50 text-blue-700';
  return 'bg-surface-tertiary text-text-secondary';
}

export default function AdminBlogListPage() {
  const { posts, adminPagination, loading, fetchAdminPosts, deletePost, duplicatePost } = useBlogStore();
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'duplicate'; id: number; title: string } | null>(null);

  useEffect(() => {
    fetchAdminPosts();
  }, [fetchAdminPosts]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > adminPagination.totalPages) return;
      fetchAdminPosts(page);
    },
    [fetchAdminPosts, adminPagination.totalPages],
  );

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete') {
      await deletePost(confirmAction.id);
    } else {
      await duplicatePost(confirmAction.id);
    }
    fetchAdminPosts(adminPagination.page);
    setConfirmAction(null);
  };

  const visiblePages = (() => {
    const total = adminPagination.totalPages;
    const current = adminPagination.page;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Confirm modal */}
      {confirmAction && (
        <div role="dialog" aria-label={confirmAction.type === 'delete' ? 'Eliminar post' : 'Duplicar post'} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-surface-primary rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {confirmAction.type === 'delete' ? 'Eliminar post' : 'Duplicar post'}
            </h3>
            <p className="text-sm text-text-tertiary mb-6">
              {confirmAction.type === 'delete'
                ? `¿Eliminar "${confirmAction.title}"? Esta acción no se puede deshacer.`
                : `¿Duplicar "${confirmAction.title}"?`}
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm rounded-lg border border-border-primary text-text-secondary hover:bg-surface-hover transition-colors">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm rounded-lg text-white transition-colors ${confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}
              >
                {confirmAction.type === 'delete' ? 'Eliminar' : 'Duplicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <Link href={ROUTES.ADMIN_BLOG_CALENDAR} className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-primary text-text-secondary rounded-xl font-medium text-sm hover:bg-surface-hover transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendario
          </Link>
          <Link href={ROUTES.ADMIN_BLOG_CREATE} className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium text-sm hover:bg-teal-700 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Post
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div role="status" className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface-primary rounded-xl shadow-sm border border-border-tertiary px-6 py-12 text-center text-text-quaternary text-sm">
          No hay posts aún. Crea el primero.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-surface-primary rounded-xl shadow-sm border border-border-tertiary p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link href={ROUTES.ADMIN_BLOG_EDIT(post.id)} className="text-sm font-medium text-text-primary hover:text-teal-600 transition-colors leading-tight">
                    {post.title}
                  </Link>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusBadgeClass(post)}`}>{statusLabel(post)}</span>
                </div>
                <p className="text-xs text-text-quaternary mb-3">{post.slug} · {formatDate(post.published_at || post.created_at)}</p>
                <div className="flex items-center gap-3">
                  <Link href={ROUTES.ADMIN_BLOG_EDIT(post.id)} className="text-xs text-teal-600 font-medium">Editar</Link>
                  <button type="button" className="text-xs text-text-tertiary hover:text-teal-600 transition-colors" onClick={() => setConfirmAction({ type: 'duplicate', id: post.id, title: post.title })}>Duplicar</button>
                  <button type="button" className="text-xs text-red-400 hover:text-red-600 transition-colors" onClick={() => setConfirmAction({ type: 'delete', id: post.id, title: post.title })}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-surface-primary rounded-xl shadow-sm border border-border-tertiary overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-tertiary text-left">
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tertiary">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <Link href={ROUTES.ADMIN_BLOG_EDIT(post.id)} className="text-sm font-medium text-text-primary hover:text-teal-600 transition-colors">{post.title}</Link>
                      <p className="text-xs text-text-quaternary mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadgeClass(post)}`}>{statusLabel(post)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-tertiary">{formatDate(post.published_at || post.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={ROUTES.ADMIN_BLOG_EDIT(post.id)} className="text-xs text-text-tertiary hover:text-teal-600 transition-colors">Editar</Link>
                        <button type="button" className="text-xs text-text-tertiary hover:text-teal-600 transition-colors" onClick={() => setConfirmAction({ type: 'duplicate', id: post.id, title: post.title })}>Duplicar</button>
                        <button type="button" className="text-xs text-red-400 hover:text-red-600 transition-colors" onClick={() => setConfirmAction({ type: 'delete', id: post.id, title: post.title })}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {adminPagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 mt-4">
              <span className="text-xs text-text-quaternary">{adminPagination.count} posts · Página {adminPagination.page} de {adminPagination.totalPages}</span>
              <div className="flex gap-1">
                <button type="button" disabled={adminPagination.page <= 1} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border-primary hover:bg-surface-hover disabled:opacity-40" onClick={() => goToPage(adminPagination.page - 1)}>← Anterior</button>
                {visiblePages.map((page) => (
                  <button key={page} type="button" className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${adminPagination.page === page ? 'bg-teal-600 text-white' : 'text-text-tertiary hover:bg-surface-hover'}`} onClick={() => goToPage(page)}>{page}</button>
                ))}
                <button type="button" disabled={adminPagination.page >= adminPagination.totalPages} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border-primary hover:bg-surface-hover disabled:opacity-40" onClick={() => goToPage(adminPagination.page + 1)}>Siguiente →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
