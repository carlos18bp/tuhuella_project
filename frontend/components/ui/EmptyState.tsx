import { SearchX } from 'lucide-react';

type EmptyStateProps = {
  message: string;
  icon?: string;
};

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      {icon ? (
        <span className="text-4xl mb-4">{icon}</span>
      ) : (
        <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
          <SearchX className="h-7 w-7 text-stone-400" />
        </div>
      )}
      <p className="text-stone-400 max-w-sm">{message}</p>
    </div>
  );
}
