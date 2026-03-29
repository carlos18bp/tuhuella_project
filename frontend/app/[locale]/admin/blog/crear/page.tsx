'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useBlogStore } from '@/lib/stores/blogStore';
import { ROUTES } from '@/lib/constants';

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

type FormData = {
  title_es: string;
  title_en: string;
  excerpt_es: string;
  excerpt_en: string;
  content_es: string;
  content_en: string;
  category: string;
  author: string;
  read_time_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  cover_image_url: string;
  cover_image_credit: string;
  cover_image_credit_url: string;
  meta_title_es: string;
  meta_title_en: string;
  meta_description_es: string;
  meta_description_en: string;
  meta_keywords_es: string;
  meta_keywords_en: string;
};

const initialForm: FormData = {
  title_es: '', title_en: '',
  excerpt_es: '', excerpt_en: '',
  content_es: '', content_en: '',
  category: '', author: 'tuhuella-team',
  read_time_minutes: 0, is_featured: false, is_published: false,
  cover_image_url: '', cover_image_credit: '', cover_image_credit_url: '',
  meta_title_es: '', meta_title_en: '',
  meta_description_es: '', meta_description_en: '',
  meta_keywords_es: '', meta_keywords_en: '',
};

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border-primary text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all';
const labelClass = 'block text-sm font-medium text-text-secondary mb-1';

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const { createPost, createPostFromJSON, fetchJsonTemplate } = useBlogStore();
  const [mode, setMode] = useState<'manual' | 'json'>('manual');
  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [jsonText, setJsonText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const post = await createPost(form);
      router.push(ROUTES.ADMIN_BLOG_EDIT(post.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el post');
    } finally {
      setSaving(false);
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = JSON.parse(jsonText);
      const post = await createPostFromJSON(data);
      router.push(ROUTES.ADMIN_BLOG_EDIT(post.id));
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError('JSON inválido. Revisa el formato.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al crear desde JSON');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const template = await fetchJsonTemplate();
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blog-post-template.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar template');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={ROUTES.ADMIN_BLOG} className="text-text-quaternary hover:text-text-secondary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Blog Post</h1>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-tertiary rounded-xl p-1 max-w-xs">
        <button type="button" className={`flex-1 px-4 py-2 text-sm rounded-lg transition-all ${mode === 'manual' ? 'bg-surface-primary shadow-sm font-medium text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`} onClick={() => setMode('manual')}>Manual</button>
        <button type="button" className={`flex-1 px-4 py-2 text-sm rounded-lg transition-all ${mode === 'json' ? 'bg-surface-primary shadow-sm font-medium text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`} onClick={() => setMode('json')}>Importar JSON</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-6">{error}</div>}

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <fieldset className="border border-border-primary rounded-xl p-5 space-y-4">
            <legend className="text-sm font-medium text-text-secondary px-2">Español</legend>
            <div><label htmlFor="title_es" className={labelClass}>Título (ES)</label><input id="title_es" type="text" required value={form.title_es} onChange={(e) => handleChange('title_es', e.target.value)} className={inputClass} placeholder="Título del artículo en español" /></div>
            <div><label htmlFor="excerpt_es" className={labelClass}>Resumen (ES)</label><textarea id="excerpt_es" rows={2} required value={form.excerpt_es} onChange={(e) => handleChange('excerpt_es', e.target.value)} className={`${inputClass} resize-y`} placeholder="Resumen corto en español" /></div>
            <div><label htmlFor="content_es" className={labelClass}>Contenido HTML (ES)</label><textarea id="content_es" rows={8} value={form.content_es} onChange={(e) => handleChange('content_es', e.target.value)} className={`${inputClass} resize-y font-mono`} placeholder="<h2>Subtítulo</h2><p>Contenido...</p>" /></div>
          </fieldset>

          <fieldset className="border border-border-primary rounded-xl p-5 space-y-4">
            <legend className="text-sm font-medium text-text-secondary px-2">English</legend>
            <div><label htmlFor="title_en" className={labelClass}>Title (EN)</label><input id="title_en" type="text" required value={form.title_en} onChange={(e) => handleChange('title_en', e.target.value)} className={inputClass} placeholder="Article title in English" /></div>
            <div><label htmlFor="excerpt_en" className={labelClass}>Excerpt (EN)</label><textarea id="excerpt_en" rows={2} required value={form.excerpt_en} onChange={(e) => handleChange('excerpt_en', e.target.value)} className={`${inputClass} resize-y`} placeholder="Short summary in English" /></div>
            <div><label htmlFor="content_en" className={labelClass}>Content HTML (EN)</label><textarea id="content_en" rows={8} value={form.content_en} onChange={(e) => handleChange('content_en', e.target.value)} className={`${inputClass} resize-y font-mono`} placeholder="<h2>Subtitle</h2><p>Content...</p>" /></div>
          </fieldset>

          <fieldset className="border border-border-primary rounded-xl p-5 space-y-4">
            <legend className="text-sm font-medium text-text-secondary px-2">Metadatos</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="category" className={labelClass}>Categoría</label><select id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} className={inputClass}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></div>
              <div><label htmlFor="author" className={labelClass}>Autor</label><select id="author" value={form.author} onChange={(e) => handleChange('author', e.target.value)} className={inputClass}>{AUTHORS.map((a) => <option key={a.slug} value={a.slug}>{a.label}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="read_time" className={labelClass}>Tiempo de lectura (min)</label><input id="read_time" type="number" min={0} value={form.read_time_minutes} onChange={(e) => handleChange('read_time_minutes', parseInt(e.target.value) || 0)} className={inputClass} /></div>
              <div><label htmlFor="cover_url" className={labelClass}>URL imagen portada</label><input id="cover_url" type="url" value={form.cover_image_url} onChange={(e) => handleChange('cover_image_url', e.target.value)} className={inputClass} placeholder="https://..." /></div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={form.is_published} onChange={(e) => handleChange('is_published', e.target.checked)} className="rounded border-border-secondary text-teal-600 focus:ring-teal-500" />Publicado</label>
              <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} className="rounded border-border-secondary text-teal-600 focus:ring-teal-500" />Destacado</label>
            </div>
          </fieldset>

          <fieldset className="border border-border-primary rounded-xl p-5 space-y-4">
            <legend className="text-sm font-medium text-text-secondary px-2">SEO</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="meta_title_es" className={labelClass}>Meta título (ES)</label><input id="meta_title_es" type="text" value={form.meta_title_es} onChange={(e) => handleChange('meta_title_es', e.target.value)} className={inputClass} /></div>
              <div><label htmlFor="meta_title_en" className={labelClass}>Meta title (EN)</label><input id="meta_title_en" type="text" value={form.meta_title_en} onChange={(e) => handleChange('meta_title_en', e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="meta_desc_es" className={labelClass}>Meta descripción (ES)</label><textarea id="meta_desc_es" rows={2} value={form.meta_description_es} onChange={(e) => handleChange('meta_description_es', e.target.value)} className={`${inputClass} resize-y`} /></div>
              <div><label htmlFor="meta_desc_en" className={labelClass}>Meta description (EN)</label><textarea id="meta_desc_en" rows={2} value={form.meta_description_en} onChange={(e) => handleChange('meta_description_en', e.target.value)} className={`${inputClass} resize-y`} /></div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3">
            <Link href={ROUTES.ADMIN_BLOG} className="px-5 py-2.5 rounded-xl border border-border-primary text-sm text-text-secondary hover:bg-surface-hover transition-colors">Cancelar</Link>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">{saving ? 'Guardando...' : 'Crear Post'}</button>
          </div>
        </form>
      )}

      {mode === 'json' && (
        <form onSubmit={handleJsonSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-tertiary">Pega el JSON completo del post o descarga el template.</p>
            <button type="button" onClick={handleDownloadTemplate} className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">↓ Descargar template</button>
          </div>
          <textarea rows={20} value={jsonText} onChange={(e) => setJsonText(e.target.value)} className={`${inputClass} font-mono resize-y`} placeholder='{"title_es": "...", "title_en": "...", ...}' />
          <div className="flex justify-end gap-3">
            <Link href={ROUTES.ADMIN_BLOG} className="px-5 py-2.5 rounded-xl border border-border-primary text-sm text-text-secondary hover:bg-surface-hover transition-colors">Cancelar</Link>
            <button type="submit" disabled={saving || !jsonText.trim()} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">{saving ? 'Creando...' : 'Crear desde JSON'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
