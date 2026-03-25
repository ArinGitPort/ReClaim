import React, { useState, useEffect } from "react"
import { Clock, ShieldCheck, Activity } from "lucide-react"

interface VMSHeaderProps {
  title: string
  subtitle: string
  statusLabel?: string
  pendingCount?: number
}

export function VMSHeader({ title, subtitle, statusLabel, pendingCount }: VMSHeaderProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1.25rem 0',
      backgroundColor: 'transparent',
      border: 'none',
      marginBottom: '0.5rem'
    }}>
      {/* Title Section */}
      <div>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 800, 
          color: '#0F172A', // Restored Black/Dark Slate
          letterSpacing: '-0.025em', 
          margin: 0 
        }}>
          {title}
        </h1>
        <p style={{ 
          color: '#64748B', 
          fontSize: '0.875rem', 
          fontWeight: 500, 
          marginTop: '0.25rem',
          margin: '0.25rem 0 0 0'
        }}>
          {subtitle}
        </p>
      </div>

      {/* Stats / Status Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {statusLabel && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#F0FDF4', 
            borderRadius: '9999px',
            border: '1px solid #DCFCE7'
          }}>
            <Activity style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: '#10B981',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {statusLabel}
            </span>
          </div>
        )}

        {pendingCount !== undefined && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#FFFBEB', 
            borderRadius: '9999px',
            border: '1px solid #FEF3C7'
          }}>
            <ShieldCheck style={{ width: '0.875rem', height: '0.875rem', color: '#D97706' }} />
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: '#D97706',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {pendingCount} Pending Reviews
            </span>
          </div>
        )}

        {/* Live Clock Pill */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.625rem', 
          padding: '0.5rem 1rem', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '0.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
        }}>
          <Clock style={{ width: '1rem', height: '1rem', color: '#1E2F85' }} />
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: 700, 
            color: '#0F172A', // Restored Black
            fontFamily: 'monospace'
          }}>
            {time.toLocaleTimeString([], { hour12: true })}
          </span>
        </div>
      </div>
    </div>
  )
}
