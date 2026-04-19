import type { LucideIcon } from 'lucide-react';

export type ManualLocale = 'es' | 'en';

export type ManualAudience =
  | 'public'
  | 'adopter'
  | 'shelter_admin'
  | 'veterinarian'
  | 'web_manager'
  | 'admin'
  | 'cross';

export type LocalizedText = { es: string; en: string };
export type LocalizedList = { es: string[]; en: string[] };

export type ManualProcess = {
  id: string;
  audience: ManualAudience;
  title: LocalizedText;
  summary: LocalizedText;
  why: LocalizedText;
  steps: LocalizedList;
  route?: string;
  endpoints?: string[];
  tips?: LocalizedList;
  keywords: string[];
};

export type ManualSection = {
  id: string;
  title: LocalizedText;
  icon: LucideIcon;
  audience: ManualAudience;
  highlight?: boolean;
  processes: ManualProcess[];
};

export type ManualSearchHit = {
  process: ManualProcess;
  section: ManualSection;
  score: number;
};
