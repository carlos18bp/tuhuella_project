import { SearchX } from 'lucide-react';

type EmptyStateProps = {
  message: string;
  icon?: string;
};

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      {icon ? (
        <span className="text-4xl mb-4 animate-float">{icon}</span>
      ) : (
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 shadow-sm flex items-center justify-center mb-4">
          <SearchX className="h-7 w-7 text-stone-400 animate-float" />
        </div>
      )}
      <p className="text-stone-400 text-lg max-w-sm">{message}</p>
    </div>
  );
}
