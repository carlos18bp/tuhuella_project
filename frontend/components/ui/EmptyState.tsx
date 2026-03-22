type EmptyStateProps = {
  message: string;
  icon?: string;
};

export default function EmptyState({ message, icon = '🔍' }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <p className="text-stone-400">{message}</p>
    </div>
  );
}
