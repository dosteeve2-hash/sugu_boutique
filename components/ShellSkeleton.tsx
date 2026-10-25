export default function ShellSkeleton() {
  const bloc = (hauteur: number, largeur: string): React.CSSProperties => ({
    height: hauteur,
    width: largeur,
    borderRadius: 12,
    background: '#263F30',
    border: '1px solid #496653',
  })
  return (
    <div role="status" aria-label="Chargement de SUGU" style={{ minHeight: '100vh', background: '#1F3A2B' }}>
      <div
        style={{
          height: 56,
          background: '#1F3A2B',
          borderBottom: '1px solid #496653',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '0.75rem',
        }}
      >
        <span style={{ color: '#E3A00F', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.05em' }}>SUGU</span>
        <span style={{ color: '#D9DEC9', fontSize: '0.9rem' }}>Chargement…</span>
      </div>
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={bloc(72, '100%')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={bloc(92, '100%')} />
          <div style={bloc(92, '100%')} />
        </div>
        <div style={bloc(180, '100%')} />
      </div>
    </div>
  )
}
