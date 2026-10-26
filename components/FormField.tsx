'use client'

import { cloneElement, isValidElement, useId } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1F3A2B',
  border: '1px solid #496653',
  borderRadius: 8,
  padding: '0.6rem 0.75rem',
  color: '#F2EBCF',
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
      <label htmlFor={id} style={{ display: 'block', color: '#D9DEC9', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
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
          border: '1px solid #496653',
          color: '#D9DEC9',
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
          background: '#E3A00F',
          border: 'none',
          color: '#1F3A2B',
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
