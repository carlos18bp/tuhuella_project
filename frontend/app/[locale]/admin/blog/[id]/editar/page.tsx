'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';
import type { BlogPostAdmin } from '@/lib/types';

const CATEGORIES = [
  { slug: '', label: 'Sin categoría' },
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

const AUTHORS = [
  { slug: 'tuhuella-team', label: 'Mi Huella Team' },
  { slug: 'laura-blanco', label: 'Laura Blanco' },
];

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all';
const labelClass = 'block text-sm font-medium text-stone-700 mb-1';

export default function AdminBlogEditPage() {
  const params = useParams();
  const postId = Number(params?.id);
  const { adminPost, loading, fetchAdminPost, updatePost, uploadCoverImage } = useBlogStore();

  const [form, setForm] = useState<Partial<BlogPostAdmin>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [jsonEsText, setJsonEsText] = useState('');
  const [jsonEnText, setJsonEnText] = useState('');
  const [activeTab, setActiveTab] = useState<'fields' | 'json'>('fields');

  useEffect(() => {
    if (postId) fetchAdminPost(postId);
  }, [postId, fetchAdminPost]);

  useEffect(() => {
    if (adminPost) {
      setForm({ ...adminPost });
      setJsonEsText(JSON.stringify(adminPost.content_json_es || {}, null, 2));
      setJsonEnText(JSON.stringify(adminPost.content_json_en || {}, null, 2));
    }
  }, [adminPost]);

  const handleChange = useCallback((field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (activeTab === 'json') {
        try {
          payload.content_json_es = jsonEsText.trim() ? JSON.parse(jsonEsText) : {};
          payload.content_json_en = jsonEnText.trim() ? JSON.parse(jsonEnText) : {};
        } catch {
          setError('JSON inválido. Revisa el formato.');
          setSaving(false);
          return;
        }
      }
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.cover_image;
      delete payload.cover_image_display;

      await updatePost(postId, payload as Partial<BlogPostAdmin>);
      setSuccess(true);
      fetchAdminPost(postId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      await uploadCoverImage(postId, file);
      fetchAdminPost(postId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !adminPost) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminPost && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 text-center text-stone-500">
        Post no encontrado.
        <br />
        <Link href={ROUTES.ADMIN_BLOG} className="text-teal-600 text-sm">← Volver</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={ROUTES.ADMIN_BLOG} className="text-stone-400 hover:text-stone-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-stone-800">Editar Post</h1>
        {adminPost?.slug && (
          <Link href={ROUTES.BLOG_DETAIL(adminPost.slug)} className="ml-auto text-xs text-teal-600 hover:text-teal-700" target="_blank">Ver en el blog →</Link>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-6">{error}</div>}
      {success && <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-teal-700 text-sm mb-6">Post guardado correctamente.</div>}

      <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1 max-w-xs">
        <button type="button" className={`flex-1 px-4 py-2 text-sm rounded-lg transition-all ${activeTab === 'fields' ? 'bg-white shadow-sm font-medium text-stone-900' : 'text-stone-500'}`} onClick={() => setActiveTab('fields')}>Campos</button>
        <button type="button" className={`flex-1 px-4 py-2 text-sm rounded-lg transition-all ${activeTab === 'json' ? 'bg-white shadow-sm font-medium text-stone-900' : 'text-stone-500'}`} onClick={() => setActiveTab('json')}>JSON Content</button>
      </div>

      <div className="space-y-6">
        {activeTab === 'fields' && (
          <>
            <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
              <legend className="text-sm font-medium text-stone-700 px-2">Imagen de portada</legend>
              {adminPost?.cover_image_display && <img src={adminPost.cover_image_display} alt="Cover" className="w-full max-h-48 object-cover rounded-xl mb-3" />}
              <div><label className={labelClass}>Subir imagen</label><input type="file" accept="image/*" onChange={handleCoverUpload} className="text-sm text-stone-600" /></div>
              <div><label htmlFor="cover_url" className={labelClass}>O usar URL externa</label><input id="cover_url" type="url" value={form.cover_image_url || ''} onChange={(e) => handleChange('cover_image_url', e.target.value)} className={inputClass} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="cover_credit" className={labelClass}>Crédito</label><input id="cover_credit" type="text" value={form.cover_image_credit || ''} onChange={(e) => handleChange('cover_image_credit', e.target.value)} className={inputClass} placeholder="Photo by..." /></div>
                <div><label htmlFor="cover_credit_url" className={labelClass}>URL crédito</label><input id="cover_credit_url" type="url" value={form.cover_image_credit_url || ''} onChange={(e) => handleChange('cover_image_credit_url', e.target.value)} className={inputClass} /></div>
              </div>
            </fieldset>

            <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
              <legend className="text-sm font-medium text-stone-700 px-2">Español</legend>
              <div><label htmlFor="title_es" className={labelClass}>Título (ES)</label><input id="title_es" type="text" value={form.title_es || ''} onChange={(e) => handleChange('title_es', e.target.value)} className={inputClass} /></div>
              <div><label htmlFor="excerpt_es" className={labelClass}>Resumen (ES)</label><textarea id="excerpt_es" rows={2} value={form.excerpt_es || ''} onChange={(e) => handleChange('excerpt_es', e.target.value)} className={`${inputClass} resize-y`} /></div>
              <div><label htmlFor="content_es" className={labelClass}>Contenido HTML (ES)</label><textarea id="content_es" rows={8} value={form.content_es || ''} onChange={(e) => handleChange('content_es', e.target.value)} className={`${inputClass} resize-y font-mono`} /></div>
            </fieldset>

            <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
              <legend className="text-sm font-medium text-stone-700 px-2">English</legend>
              <div><label htmlFor="title_en" className={labelClass}>Title (EN)</label><input id="title_en" type="text" value={form.title_en || ''} onChange={(e) => handleChange('title_en', e.target.value)} className={inputClass} /></div>
              <div><label htmlFor="excerpt_en" className={labelClass}>Excerpt (EN)</label><textarea id="excerpt_en" rows={2} value={form.excerpt_en || ''} onChange={(e) => handleChange('excerpt_en', e.target.value)} className={`${inputClass} resize-y`} /></div>
              <div><label htmlFor="content_en" className={labelClass}>Content HTML (EN)</label><textarea id="content_en" rows={8} value={form.content_en || ''} onChange={(e) => handleChange('content_en', e.target.value)} className={`${inputClass} resize-y font-mono`} /></div>
            </fieldset>
          </>
        )}

        {activeTab === 'json' && (
          <>
            <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
              <legend className="text-sm font-medium text-stone-700 px-2">Contenido JSON (ES)</legend>
              <textarea rows={15} value={jsonEsText} onChange={(e) => setJsonEsText(e.target.value)} className={`${inputClass} font-mono resize-y`} />
            </fieldset>
            <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
              <legend className="text-sm font-medium text-stone-700 px-2">Content JSON (EN)</legend>
              <textarea rows={15} value={jsonEnText} onChange={(e) => setJsonEnText(e.target.value)} className={`${inputClass} font-mono resize-y`} />
            </fieldset>
          </>
        )}

        <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
          <legend className="text-sm font-medium text-stone-700 px-2">Metadatos</legend>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="slug" className={labelClass}>Slug</label><input id="slug" type="text" value={form.slug || ''} onChange={(e) => handleChange('slug', e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="category" className={labelClass}>Categoría</label><select id="category" value={form.category || ''} onChange={(e) => handleChange('category', e.target.value)} className={inputClass}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="author" className={labelClass}>Autor</label><select id="author" value={form.author || 'tuhuella-team'} onChange={(e) => handleChange('author', e.target.value)} className={inputClass}>{AUTHORS.map((a) => <option key={a.slug} value={a.slug}>{a.label}</option>)}</select></div>
            <div><label htmlFor="read_time" className={labelClass}>Tiempo de lectura (min)</label><input id="read_time" type="number" min={0} value={form.read_time_minutes || 0} onChange={(e) => handleChange('read_time_minutes', parseInt(e.target.value) || 0)} className={inputClass} /></div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={form.is_published || false} onChange={(e) => handleChange('is_published', e.target.checked)} className="rounded border-stone-300 text-teal-600 focus:ring-teal-500" />Publicado</label>
            <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={form.is_featured || false} onChange={(e) => handleChange('is_featured', e.target.checked)} className="rounded border-stone-300 text-teal-600 focus:ring-teal-500" />Destacado</label>
          </div>
        </fieldset>

        <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
          <legend className="text-sm font-medium text-stone-700 px-2">SEO</legend>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="meta_title_es" className={labelClass}>Meta título (ES)</label><input id="meta_title_es" type="text" value={form.meta_title_es || ''} onChange={(e) => handleChange('meta_title_es', e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="meta_title_en" className={labelClass}>Meta title (EN)</label><input id="meta_title_en" type="text" value={form.meta_title_en || ''} onChange={(e) => handleChange('meta_title_en', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="meta_desc_es" className={labelClass}>Meta descripción (ES)</label><textarea id="meta_desc_es" rows={2} value={form.meta_description_es || ''} onChange={(e) => handleChange('meta_description_es', e.target.value)} className={`${inputClass} resize-y`} /></div>
            <div><label htmlFor="meta_desc_en" className={labelClass}>Meta description (EN)</label><textarea id="meta_desc_en" rows={2} value={form.meta_description_en || ''} onChange={(e) => handleChange('meta_description_en', e.target.value)} className={`${inputClass} resize-y`} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="meta_kw_es" className={labelClass}>Keywords (ES)</label><input id="meta_kw_es" type="text" value={form.meta_keywords_es || ''} onChange={(e) => handleChange('meta_keywords_es', e.target.value)} className={inputClass} placeholder="adopción, mascotas, ..." /></div>
            <div><label htmlFor="meta_kw_en" className={labelClass}>Keywords (EN)</label><input id="meta_kw_en" type="text" value={form.meta_keywords_en || ''} onChange={(e) => handleChange('meta_keywords_en', e.target.value)} className={inputClass} placeholder="adoption, pets, ..." /></div>
          </div>
        </fieldset>

        <fieldset className="border border-stone-200 rounded-xl p-5 space-y-4">
          <legend className="text-sm font-medium text-stone-700 px-2">Fuentes</legend>
          <p className="text-xs text-stone-400">Formato JSON: [{'"name"'}: {'"..."'}, {'"url"'}: {'"..."'}]</p>
          <textarea
            rows={4}
            value={JSON.stringify(form.sources || [], null, 2)}
            onChange={(e) => { try { setForm((prev) => ({ ...prev, sources: JSON.parse(e.target.value) })); } catch { /* let user keep typing */ } }}
            className={`${inputClass} font-mono resize-y`}
          />
        </fieldset>

        <div className="flex justify-end gap-3 pt-4">
          <Link href={ROUTES.ADMIN_BLOG} className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">Cancelar</Link>
          <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </div>
    </div>
  );
}
