import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useAuthStore } from '@/lib/stores/authStore';
import { useRoleProfileData, type RoleProfileData } from '@/lib/hooks/useRoleProfileData';

jest.mock('@/lib/hooks/useRoleProfileData', () => ({
  useRoleProfileData: jest.fn(),
}));

jest.mock('@/components/ui/ShelterAdminProfileSection', () => ({
  __esModule: true,
  default: () => <div data-testid="shelter-admin-section" />,
}));

jest.mock('@/components/ui/AdminProfileSection', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-section" />,
}));

import MiPerfilPage from '../page';

const mockUseRoleProfileData = useRoleProfileData as unknown as jest.Mock;

const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Juan',
  last_name: 'Pérez',
  phone: '+57 300 1234567',
  city: 'Bogotá',
  role: 'adopter' as const,
  is_staff: false,
  date_joined: '2025-03-15T10:00:00Z',
};

const mockStats = {
  applications: { total: 3, by_status: { submitted: 1, reviewing: 1, approved: 1, rejected: 0, interview: 0 } },
  sponsorships: { active_count: 2, total_count: 3 },
  donations: { total_amount: '150.00', count: 5 },
  favorites: { count: 7, preview: [{ id: 1, name: 'Luna', species: 'dog', thumbnail_url: null }] },
  adopter_intent: { status: 'active', visibility: 'public' },
  shelter_invites: { pending_count: 0 },
};

const EMPTY_ROLE_DATA: RoleProfileData = {
  shelter: null,
  shelterStats: null,
  adminStats: null,
  loading: false,
};

const SHELTER_ROLE_DATA: Partial<RoleProfileData> = {
  shelter: { name: 'Refugio Uno', verification_status: 'verified' } as RoleProfileData['shelter'],
  shelterStats: { animals_count: 5, pending_applications: 4, active_campaigns: 2 },
};

const ADMIN_ROLE_DATA: Partial<RoleProfileData> = {
  adminStats: { total_users: 10, total_shelters: 5, total_animals: 20, pending_verifications: 3 },
};

function setRoleData(overrides: Partial<RoleProfileData> = {}) {
  mockUseRoleProfileData.mockReturnValue({ ...EMPTY_ROLE_DATA, ...overrides });
}

describe('MiPerfilPage', () => {
  const fetchProfileStatsMock = jest.fn();
  const fetchActivityMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setRoleData();
    useAuthStore.setState({
      user: null,
      profileStats: null,
      activity: [],
      profileLoading: false,
      fetchProfileStats: fetchProfileStatsMock,
      fetchActivity: fetchActivityMock,
    });
  });

  it('renders loading skeleton when user is null', () => {
    render(<MiPerfilPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders user profile when user is set', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Juan Pérez');
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders member since date', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Miembro desde/)).toBeInTheDocument();
  });

  it('renders profile completeness bar', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    // adopter: name(15) + email(15) + phone(20) + city(20) = 70%, no intent
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders edit profile link in profile card', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    const editLinks = screen.getAllByRole('link', { name: /Editar perfil/ });
    expect(editLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders activity cards with stats when profileStats loaded', () => {
    useAuthStore.setState({ user: mockUser, profileStats: mockStats });

    render(<MiPerfilPage />);
    expect(screen.getByText(/3 solicitudes/)).toBeInTheDocument();
    expect(screen.getByText(/\$150\.00 donados/)).toBeInTheDocument();
    expect(screen.getByText(/Apadrinando 2 animales/)).toBeInTheDocument();
    expect(screen.getByText(/7 animales guardados/)).toBeInTheDocument();
  });

  it('renders shelter invite banner when pending invites exist', () => {
    useAuthStore.setState({
      user: mockUser,
      profileStats: { ...mockStats, shelter_invites: { pending_count: 2 } },
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/2 invitación/)).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByText('Actividad reciente')).toBeInTheDocument();
  });

  it('renders activity timeline events', () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.UTC(2026, 2, 28, 12, 0, 0));

    useAuthStore.setState({
      user: mockUser,
      activity: [
        { type: 'application', animal_name: 'Luna', status: 'submitted', date: '2026-03-28T12:00:00.000Z' },
        { type: 'favorite', animal_name: 'Max', date: '2026-03-28T12:00:00.000Z' },
      ],
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Aplicaste para adoptar a Luna/)).toBeInTheDocument();
    expect(screen.getByText(/Agregaste a Max a favoritos/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('renders edit profile link', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByRole('link', { name: /Editar perfil/ })).toHaveAttribute('href', '/my-profile/edit');
  });

  it('renders favorite preview thumbnails', () => {
    useAuthStore.setState({ user: mockUser, profileStats: mockStats });

    render(<MiPerfilPage />);
    expect(screen.getAllByText('L').length).toBeGreaterThanOrEqual(1);
  });

  it('renders red completeness bar when completeness < 50%', () => {
    const incompleteUser = { ...mockUser, phone: '', city: '' };
    useAuthStore.setState({ user: incompleteUser });

    render(<MiPerfilPage />);
    // adopter: name(15) + email(15) = 30%
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders 100% completeness with intent', () => {
    useAuthStore.setState({ user: mockUser, profileStats: mockStats });

    render(<MiPerfilPage />);
    // adopter: name(15) + email(15) + phone(20) + city(20) + intent(30) = 100
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Perfil completo')).toBeInTheDocument();
  });

  it('renders donation and sponsorship activity events', () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.UTC(2026, 2, 28, 12, 0, 0));

    useAuthStore.setState({
      user: mockUser,
      activity: [
        { type: 'donation', amount: '50000', shelter_name: 'Patitas', date: '2026-03-27T12:00:00.000Z' },
        { type: 'sponsorship', animal_name: 'Rocky', date: '2026-01-15T12:00:00.000Z' },
      ],
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Donaste \$50000/)).toBeInTheDocument();
    expect(screen.getByText(/Comenzaste a apadrinar a Rocky/)).toBeInTheDocument();
    expect(screen.getByText('Ayer')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('renders +N indicator when favorites exceed preview limit', () => {
    const manyFavStats = {
      ...mockStats,
      favorites: {
        count: 8,
        preview: [
          { id: 1, name: 'Luna', species: 'dog', thumbnail_url: null },
          { id: 2, name: 'Max', species: 'dog', thumbnail_url: null },
          { id: 3, name: 'Rocky', species: 'dog', thumbnail_url: null },
          { id: 4, name: 'Milo', species: 'cat', thumbnail_url: null },
          { id: 5, name: 'Nala', species: 'cat', thumbnail_url: null },
        ],
      },
    };
    useAuthStore.setState({ user: mockUser, profileStats: manyFavStats });

    render(<MiPerfilPage />);
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  describe('role adaptation', () => {
    it('renders ShelterAdminProfileSection and hides adopter cards for shelter_admin', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'shelter_admin' } });
      setRoleData(SHELTER_ROLE_DATA);

      render(<MiPerfilPage />);

      expect(screen.getByTestId('shelter-admin-section')).toBeInTheDocument();
      expect(screen.queryByText('Mis Solicitudes')).not.toBeInTheDocument();
      expect(screen.queryByText('Mis Apadrinamientos')).not.toBeInTheDocument();
      expect(screen.queryByText('Mi Intención de Adopción')).not.toBeInTheDocument();
      expect(screen.getByText('Responsabilidades del refugio')).toBeInTheDocument();
    });

    it('renders pending-applications widget with correct count and link for shelter_admin', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'shelter_admin' } });
      setRoleData({
        shelterStats: { animals_count: 0, pending_applications: 4, active_campaigns: 0 },
      });

      render(<MiPerfilPage />);

      expect(screen.getByText('4 solicitudes esperando tu revisión')).toBeInTheDocument();
      const widget = screen.getByText('4 solicitudes esperando tu revisión').closest('a');
      expect(widget).toHaveAttribute('href', '/shelter/applications');
    });

    it('shows empty-state widget copy when shelter has zero pending applications', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'shelter_admin' } });
      setRoleData({
        shelterStats: { animals_count: 0, pending_applications: 0, active_campaigns: 0 },
      });

      render(<MiPerfilPage />);
      expect(screen.getByText('No hay solicitudes pendientes')).toBeInTheDocument();
    });

    it('uses role-specific completeness formula for shelter_admin', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'shelter_admin' } });

      render(<MiPerfilPage />);
      // shelter_admin: name(30) + email(30) + phone(40) = 100
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Perfil completo')).toBeInTheDocument();
    });

    it('renders AdminProfileSection and hides adopter cards for admin', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'admin' } });
      setRoleData({
        adminStats: { total_users: 10, total_shelters: 5, total_animals: 20, pending_verifications: 3 },
      });

      render(<MiPerfilPage />);

      expect(screen.getByTestId('admin-section')).toBeInTheDocument();
      expect(screen.queryByText('Mis Solicitudes')).not.toBeInTheDocument();
      expect(screen.queryByText('Mis Donaciones')).not.toBeInTheDocument();
      expect(screen.queryByText('Favoritos')).not.toBeInTheDocument();
      expect(screen.getByText('Responsabilidades de administrador')).toBeInTheDocument();
    });

    it('renders moderation-queue widget with correct count and link for admin', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'admin' } });
      setRoleData({
        adminStats: { total_users: 10, total_shelters: 5, total_animals: 20, pending_verifications: 3 },
      });

      render(<MiPerfilPage />);

      expect(screen.getByText('3 refugios por verificar')).toBeInTheDocument();
      const widget = screen.getByText('3 refugios por verificar').closest('a');
      expect(widget).toHaveAttribute('href', '/admin/dashboard');
    });

    it('does not render adopter timeline for shelter_admin or admin', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'admin' } });
      render(<MiPerfilPage />);
      expect(screen.queryByText('Actividad reciente')).not.toBeInTheDocument();
    });

    it('does not trigger fetchActivity/fetchProfileStats for non-adopter roles', () => {
      useAuthStore.setState({ user: { ...mockUser, role: 'admin' } });
      render(<MiPerfilPage />);
      expect(fetchActivityMock).not.toHaveBeenCalled();
      expect(fetchProfileStatsMock).not.toHaveBeenCalled();
    });

    it('hides shelter-invite banner for non-adopter even if payload includes it', () => {
      useAuthStore.setState({
        user: { ...mockUser, role: 'shelter_admin' },
        profileStats: { ...mockStats, shelter_invites: { pending_count: 5 } },
      });

      render(<MiPerfilPage />);
      expect(screen.queryByText(/5 invitación/)).not.toBeInTheDocument();
    });
  });
});
