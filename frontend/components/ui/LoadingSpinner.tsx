type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        data-testid="spinner"
        className={`${sizeClasses[size]} animate-spin rounded-full border-[2.5px] border-stone-200/60 border-t-teal-600`}
      />
    </div>
  );
}
