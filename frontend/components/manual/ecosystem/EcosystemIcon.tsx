import { BookOpen, Building2, ChartNoAxesCombined, Globe, Heart, Mail, Network, PawPrint, ShieldCheck, Stethoscope, UserRound, UsersRound, Bell } from 'lucide-react';
import type { EcosystemIcon as IconName } from '@/lib/manual/ecosystemTypes';

const icons = { globe: Globe, paw: PawPrint, heart: Heart, home: Building2, user: UserRound, medical: Stethoscope, shield: ShieldCheck, book: BookOpen, bell: Bell, people: UsersRound, chart: ChartNoAxesCombined, mail: Mail, network: Network };

export default function EcosystemIcon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
