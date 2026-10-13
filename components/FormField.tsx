'use client'

import { cloneElement, isValidElement, useId } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#070e1f',
  border: '1px solid #16233d',
  borderRadius: 8,
  padding: '0.6rem 0.75rem',
  color: '#f5f0e8',
  fontSize: '1rem',
  minHeight: 48,
  outline: 'none',
  boxSizing: 'border-box',
}

export function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const id = useId()
  const champ =
    isValidElement<{ id?: string }>(children) && !children.props.id ? cloneElement(children, { id }) : children
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={id} style={{ display: 'block', color: '#9ba8c4', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
        {label}
      </label>
      {champ}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />
}

export function SubmitRow({ onCancel, submitLabel = 'Enregistrer' }: { onCancel: () => void; submitLabel?: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          flex: 1,
          background: 'transparent',
          border: '1px solid #16233d',
          color: '#9ba8c4',
          borderRadius: 8,
          padding: '0.65rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Annuler
      </button>
      <button
        type="submit"
        style={{
          flex: 1,
          background: '#D4AF37',
          border: 'none',
          color: '#0A1628',
          borderRadius: 8,
          padding: '0.65rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        {submitLabel}
      </button>
    </div>
  )
}
