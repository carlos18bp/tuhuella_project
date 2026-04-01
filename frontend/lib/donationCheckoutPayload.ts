import type { DonationCreatePayload } from '@/lib/types';

/**
 * Construye el cuerpo para POST /donations/create/ según el flujo de checkout (campaña vs plataforma).
 */
export function buildDonationCheckoutPayload(
  amountNum: number,
  message: string,
  campaignId: number | null,
): DonationCreatePayload {
  const messageOpt = message.trim() || undefined;
  if (campaignId != null && Number.isFinite(campaignId) && campaignId > 0) {
    return {
      destination: 'campaign',
      campaign: campaignId,
      amount: amountNum,
      message: messageOpt,
    };
  }
  return { destination: 'platform', amount: amountNum, message: messageOpt };
}
