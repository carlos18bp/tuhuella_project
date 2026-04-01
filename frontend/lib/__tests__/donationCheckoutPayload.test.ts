import { describe, it, expect } from '@jest/globals';

import { buildDonationCheckoutPayload } from '../donationCheckoutPayload';

describe('buildDonationCheckoutPayload', () => {
  it('returns campaign destination when campaign id is valid', () => {
    expect(buildDonationCheckoutPayload(50_000, 'hola', 3)).toEqual({
      destination: 'campaign',
      campaign: 3,
      amount: 50_000,
      message: 'hola',
    });
  });

  it('returns platform destination when campaign id is null', () => {
    expect(buildDonationCheckoutPayload(10_000, '', null)).toEqual({
      destination: 'platform',
      amount: 10_000,
      message: undefined,
    });
  });

  it('trims message and omits when empty', () => {
    expect(buildDonationCheckoutPayload(5000, '  ', 1).message).toBeUndefined();
  });
});
