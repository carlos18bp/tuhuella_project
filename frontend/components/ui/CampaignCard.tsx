import Link from 'next/link';

import { ROUTES } from '@/lib/constants';
import type { Campaign } from '@/lib/types';

type CampaignCardProps = {
  campaign: Campaign;
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={ROUTES.CAMPAIGN_DETAIL(campaign.id)}
      className="rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow"
    >
      <p className="text-xs text-amber-600 font-medium">{campaign.shelter_name}</p>
      <h3 className="mt-2 font-semibold text-stone-800">{campaign.title}</h3>
      {campaign.description && (
        <p className="mt-2 text-sm text-stone-500 line-clamp-2">{campaign.description}</p>
      )}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-stone-500 mb-1">
          <span>{campaign.progress_percentage}%</span>
          <span>
            ${Number(campaign.raised_amount).toLocaleString()} / ${Number(campaign.goal_amount).toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
