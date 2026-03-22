import { describe, it, expect } from '@jest/globals';

jest.mock('swiper/react', () => ({
  Swiper: () => null,
  SwiperSlide: () => null,
}));
jest.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {},
}));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});

import * as ui from '../index';

describe('components/ui barrel exports', () => {
  it('exports animal-related components', () => {
    expect(ui.AnimalCard).toBeDefined();
    expect(ui.AnimalFilters).toBeDefined();
    expect(ui.AnimalGallery).toBeDefined();
    expect(ui.AnimalGrid).toBeDefined();
  });

  it('exports card and badge components', () => {
    expect(ui.CampaignCard).toBeDefined();
    expect(ui.ShelterCard).toBeDefined();
    expect(ui.ApplicationStatusBadge).toBeDefined();
    expect(ui.StatusBadge).toBeDefined();
    expect(ui.VerifiedBadge).toBeDefined();
  });

  it('exports payment components', () => {
    expect(ui.DonationForm).toBeDefined();
    expect(ui.PaymentConfirmation).toBeDefined();
    expect(ui.PaymentMethodSelector).toBeDefined();
  });

  it('exports section components', () => {
    expect(ui.CTASection).toBeDefined();
    expect(ui.FAQAccordion).toBeDefined();
    expect(ui.Hero).toBeDefined();
    expect(ui.HowItWorks).toBeDefined();
  });

  it('exports utility display components', () => {
    expect(ui.EmptyState).toBeDefined();
    expect(ui.LoadingSpinner).toBeDefined();
    expect(ui.ProgressBar).toBeDefined();
    expect(ui.ShelterProfile).toBeDefined();
    expect(ui.StatsCounter).toBeDefined();
  });
});
