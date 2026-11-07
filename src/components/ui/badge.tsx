import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function Badge({
  className = '',
  variant = 'default',
  style,
  ...props
}: BadgeProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    transition: 'all 0.2s ease',
    ...(variant === 'outline'
      ? {
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#065f46',
        }
      : variant === 'secondary'
        ? {
            border: '1px solid transparent',
            background: '#ecfdf5',
            color: '#047857',
          }
        : {
            border: '1px solid transparent',
            background: '#059669',
            color: '#ffffff',
          }),
    ...style,
  }

  return <div className={className} style={baseStyle} {...props} />
}
