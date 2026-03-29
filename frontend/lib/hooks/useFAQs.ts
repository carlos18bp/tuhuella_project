'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { FAQItem } from '@/components/ui/FAQAccordion';

type FAQTopicResponse = {
  id: number;
  slug: string;
  display_name: string;
  items: FAQItem[];
};

export function useFAQsByTopic(topicSlug: string) {
  const locale = useLocale();
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API_ENDPOINTS.FAQS_BY_TOPIC(topicSlug), { params: { lang: locale } })
      .then((res) => setItems(res.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [topicSlug, locale]);

  return { items, loading };
}

export function useAllFAQs() {
  const locale = useLocale();
  const [topics, setTopics] = useState<FAQTopicResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API_ENDPOINTS.FAQS_ALL, { params: { lang: locale } })
      .then((res) => setTopics(res.data || []))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [locale]);

  return { topics, loading };
}
