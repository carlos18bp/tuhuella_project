'use client';

import React from 'react';

type Section = {
  heading?: string;
  content?: string;
  list?: string[];
  subsections?: Array<{ title: string; description: string }>;
  timeline?: Array<{ step: string; description: string }>;
  examples?: string[];
  image?: { url: string; alt?: string; credit?: string; credit_url?: string };
  quote?: { text: string; author?: string };
  callout?: { type?: string; title?: string; text: string };
  video?: { url: string; title?: string };
  key_takeaways?: string[];
  faq?: Array<{ question: string; answer: string }>;
};

type ContentJSON = {
  intro?: string;
  sections?: Section[];
  conclusion?: string;
  cta?: string;
};

type Props = {
  contentJson?: ContentJSON | Record<string, unknown> | null;
  contentHtml?: string;
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

function CalloutIcon({ type }: { type?: string }) {
  switch (type) {
    case 'warning':
      return <span className="text-amber-500 text-lg">⚠️</span>;
    case 'info':
      return <span className="text-blue-500 text-lg">ℹ️</span>;
    case 'note':
      return <span className="text-stone-500 text-lg">📝</span>;
    default:
      return <span className="text-teal-500 text-lg">💡</span>;
  }
}

function calloutBorder(type?: string) {
  switch (type) {
    case 'warning':
      return 'border-amber-400 bg-amber-50';
    case 'info':
      return 'border-blue-400 bg-blue-50';
    case 'note':
      return 'border-stone-400 bg-stone-50';
    default:
      return 'border-teal-400 bg-teal-50';
  }
}

function RenderSection({ section, index }: { section: Section; index: number }) {
  return (
    <div key={index} className="mb-10">
      {section.heading && (
        <h2 className="text-2xl font-semibold text-stone-800 mb-4">{section.heading}</h2>
      )}

      {section.content && (
        <p className="text-stone-600 leading-relaxed mb-4">{section.content}</p>
      )}

      {section.list && section.list.length > 0 && (
        <ul className="list-disc pl-6 space-y-2 mb-4">
          {section.list.map((item, i) => (
            <li key={i} className="text-stone-600 leading-relaxed">{item}</li>
          ))}
        </ul>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <div className="space-y-4 mb-4">
          {section.subsections.map((sub, i) => (
            <div key={i} className="pl-4 border-l-2 border-teal-200">
              <h3 className="font-medium text-stone-800 mb-1">{sub.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{sub.description}</p>
            </div>
          ))}
        </div>
      )}

      {section.timeline && section.timeline.length > 0 && (
        <div className="relative pl-8 mb-4">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-teal-200" />
          {section.timeline.map((step, i) => (
            <div key={i} className="relative mb-6 last:mb-0">
              <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-100" />
              <h4 className="font-medium text-stone-800 mb-1">{step.step}</h4>
              <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      )}

      {section.examples && section.examples.length > 0 && (
        <div className="bg-stone-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Ejemplos</p>
          <ul className="space-y-2">
            {section.examples.map((ex, i) => (
              <li key={i} className="flex gap-2 text-stone-600 text-sm">
                <span className="text-teal-500 mt-0.5">→</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.image && (
        <figure className="mb-4">
          <img
            src={section.image.url}
            alt={section.image.alt || ''}
            className="w-full rounded-xl object-cover max-h-[500px]"
            loading="lazy"
          />
          {section.image.credit && (
            <figcaption className="text-xs text-stone-400 mt-2 text-center">
              {section.image.credit_url ? (
                <a
                  href={section.image.credit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-600 transition-colors"
                >
                  {section.image.credit}
                </a>
              ) : (
                section.image.credit
              )}
            </figcaption>
          )}
        </figure>
      )}

      {section.quote && (
        <blockquote className="border-l-4 border-teal-400 pl-6 py-3 mb-4 bg-teal-50/50 rounded-r-lg">
          <p className="text-stone-700 italic text-lg leading-relaxed">
            &ldquo;{section.quote.text}&rdquo;
          </p>
          {section.quote.author && (
            <cite className="block mt-2 text-sm text-stone-500 not-italic">
              — {section.quote.author}
            </cite>
          )}
        </blockquote>
      )}

      {section.callout && (
        <div className={`border-l-4 rounded-r-xl p-4 mb-4 ${calloutBorder(section.callout.type)}`}>
          <div className="flex items-start gap-3">
            <CalloutIcon type={section.callout.type} />
            <div>
              {section.callout.title && (
                <p className="font-semibold text-stone-800 mb-1">{section.callout.title}</p>
              )}
              <p className="text-stone-600 text-sm leading-relaxed">{section.callout.text}</p>
            </div>
          </div>
        </div>
      )}

      {section.video && (() => {
        const embedUrl = getYouTubeEmbedUrl(section.video.url);
        return embedUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
            <iframe
              src={embedUrl}
              title={section.video.title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : null;
      })()}

      {section.key_takeaways && section.key_takeaways.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
            <span>🎯</span> Puntos clave
          </h3>
          <ul className="space-y-2">
            {section.key_takeaways.map((item, i) => (
              <li key={i} className="flex gap-2 text-teal-700 text-sm">
                <span className="text-teal-500 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.faq && section.faq.length > 0 && (
        <div className="space-y-3 mb-4">
          {section.faq.map((item, i) => (
            <details key={i} className="group bg-stone-50 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer font-medium text-stone-800 hover:bg-stone-100 transition-colors flex items-center justify-between">
                <span>{item.question}</span>
                <svg
                  className="w-5 h-5 text-stone-400 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-stone-600 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogContentRenderer({ contentJson, contentHtml }: Props) {
  const json = contentJson as ContentJSON | null | undefined;

  if (json && json.intro && json.sections) {
    return (
      <article className="prose-custom max-w-none">
        {json.intro && (
          <p className="text-lg text-stone-600 leading-relaxed mb-8 font-light">
            {json.intro}
          </p>
        )}

        {json.sections?.map((section, i) => (
          <RenderSection key={i} section={section as Section} index={i} />
        ))}

        {json.conclusion && (
          <div className="mt-10 pt-8 border-t border-stone-200">
            <p className="text-stone-600 leading-relaxed">{json.conclusion}</p>
          </div>
        )}

        {json.cta && (
          <div className="mt-6 p-6 bg-teal-50 rounded-xl text-center">
            <p className="text-teal-800 font-medium">{json.cta}</p>
          </div>
        )}
      </article>
    );
  }

  if (contentHtml) {
    return (
      <article
        className="prose prose-stone max-w-none prose-headings:font-semibold prose-a:text-teal-600"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  return (
    <div className="text-stone-400 text-center py-12">
      No hay contenido disponible.
    </div>
  );
}
