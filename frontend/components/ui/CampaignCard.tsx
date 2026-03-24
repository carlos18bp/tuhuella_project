import { Link } from '@/i18n/navigation';
import { Megaphone } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Campaign } from '@/lib/types';

type CampaignCardProps = {
  campaign: Campaign;
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={ROUTES.CAMPAIGN_DETAIL(campaign.id)}
      className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center gap-2">
        <Megaphone className="h-3.5 w-3.5 text-amber-500" />
        <p className="text-xs text-amber-600 font-medium">{campaign.shelter_name}</p>
      </div>
      <h3 className="mt-2.5 font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">{campaign.title}</h3>
      {campaign.description && (
        <p className="mt-2 text-sm text-stone-500 line-clamp-2">{campaign.description}</p>
      )}
      <div className="mt-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold text-amber-700">{campaign.progress_percentage}%</span>
          <span className="text-stone-400">
            ${Number(campaign.raised_amount).toLocaleString()} / ${Number(campaign.goal_amount).toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            data-testid="progress-bar-fill"
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
            style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
