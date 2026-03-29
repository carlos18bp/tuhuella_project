import { Link } from '@/i18n/navigation';
import { Megaphone, ImageIcon } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Campaign } from '@/lib/types';

type CampaignCardProps = {
  campaign: Campaign;
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={ROUTES.CAMPAIGN_DETAIL(campaign.id)}
      className="group h-full flex flex-col rounded-2xl border border-border-primary/80 bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-border-secondary/80 transition-all duration-300 card-amber"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-amber-50 to-stone-100 relative overflow-hidden">
        {campaign.cover_image_url ? (
          <img
            src={campaign.cover_image_url}
            alt={campaign.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <Megaphone className="h-12 w-12" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <Megaphone className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-xs text-amber-600 font-medium">{campaign.shelter_name}</p>
        </div>
        <h3 className="mt-2.5 font-semibold text-text-primary group-hover:text-amber-700 transition-colors">{campaign.title}</h3>
        {campaign.description && (
          <p className="mt-2 text-sm text-text-tertiary line-clamp-2">{campaign.description}</p>
        )}
        <div className="mt-auto pt-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-amber-700">{campaign.progress_percentage}%</span>
            <span className="text-text-quaternary">
              ${Number(campaign.raised_amount).toLocaleString()} / ${Number(campaign.goal_amount).toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              data-testid="progress-bar-fill"
              className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full transition-all progress-shine"
              style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
