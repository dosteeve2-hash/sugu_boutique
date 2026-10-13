export default function ShellSkeleton() {
  const bloc = (hauteur: number, largeur: string): React.CSSProperties => ({
    height: hauteur,
    width: largeur,
    borderRadius: 12,
    background: '#0c1528',
    border: '1px solid #16233d',
  })
  return (
    <div role="status" aria-label="Chargement de SUGU" style={{ minHeight: '100vh', background: '#0A1628' }}>
      <div
        style={{
          height: 56,
          background: '#070e1f',
          borderBottom: '1px solid #16233d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '0.75rem',
        }}
      >
        <span style={{ color: '#D4AF37', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.05em' }}>SUGU</span>
        <span style={{ color: '#9ba8c4', fontSize: '0.9rem' }}>Chargement…</span>
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
