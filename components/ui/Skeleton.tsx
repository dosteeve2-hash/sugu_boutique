interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-4 ${className}`}
      style={{ background: '#0D1E38', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-3">
        <Skeleton style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', flexShrink: 0 }} />
        <div className="flex flex-col gap-2" style={{ flex: 1 }}>
          <Skeleton style={{ height: '1rem', width: '50%' }} />
          <Skeleton style={{ height: '0.75rem', width: '33%' }} />
        </div>
      </div>
      <Skeleton style={{ height: '2rem', width: '66%' }} />
      <Skeleton style={{ height: '0.75rem', width: '100%' }} />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-3 animate-pulse py-2">
      <Skeleton style={{ width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0 }} />
      <Skeleton style={{ flex: 1, height: '1rem' }} />
      <Skeleton style={{ width: '6rem', height: '1rem' }} />
      <Skeleton style={{ width: '4rem', height: '1.5rem', borderRadius: '999px' }} />
    </div>
  );
}

/** Skeleton pour produits/ventes SUGU */
export function SkeletonProduit() {
  return (
    <div
      className="animate-pulse p-4 rounded-2xl flex flex-col gap-3"
      style={{ background: '#0D1E38', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <Skeleton style={{ height: '8rem', width: '100%', borderRadius: '0.75rem' }} />
      <Skeleton style={{ height: '1rem', width: '70%' }} />
      <Skeleton style={{ height: '0.75rem', width: '40%' }} />
      <Skeleton style={{ height: '2rem', width: '55%' }} />
    </div>
  );
}
