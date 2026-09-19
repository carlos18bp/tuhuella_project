import type { User } from '@/lib/types';

export type EcosystemAccess = 'public' | 'authenticated' | 'shelter_applicant' | 'shelter_admin' | 'veterinarian' | 'web_manager' | 'admin';
export type EcosystemIcon = 'globe' | 'paw' | 'heart' | 'home' | 'user' | 'medical' | 'shield' | 'book' | 'bell' | 'people' | 'chart' | 'mail' | 'network';

export type EcosystemView = {
  route: string;
  /** Safe entry point: never contains a record placeholder or invented ID. */
  destination: string | null;
  access: EcosystemAccess;
  notice?: 'selection' | 'demo' | 'alias' | 'handoff';
};

export type EcosystemRelation = { from: string; to: string; label: string };
export type EcosystemNode = {
  id: string;
  kind: 'root' | 'space' | 'module' | 'view';
  icon: EcosystemIcon;
  children: EcosystemNode[];
  relations: EcosystemRelation[];
  view?: EcosystemView;
  processIds?: string[];
};

export type EcosystemUser = Pick<User, 'role' | 'is_staff'> | null | undefined;
