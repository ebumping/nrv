import React, { useState, useEffect } from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// NERV ALERT SYSTEM - Emergency state management
// When angels attack, everything goes RED
// ═══════════════════════════════════════════════════════════════════════════════

export type AlertLevel = 'normal' | 'elevated' | 'warning' | 'danger' | 'critical';

interface AlertState {
  level: AlertLevel;
  message?: string;
  messageJa?: string;
  timestamp?: Date;
}

// Alert context for global state
export const AlertContext = React.createContext<{
  state: AlertState;
  setAlert: (level: AlertLevel, message?: string, messageJa?: string) => void;
  clearAlert: () => void;
}>({
  state: { level: 'normal' },
  setAlert: () => {},
  clearAlert: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({ level: 'normal' });
  
  const setAlert = (level: AlertLevel, message?: string, messageJa?: string) => {
    setState({ level, message, messageJa, timestamp: new Date() });
  };
  
  const clearAlert = () => {
    setState({ level: 'normal' });
  };
  
  return (
    <AlertContext.Provider value={{ state, setAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT BANNER - Top of screen warning strip
// ═══════════════════════════════════════════════════════════════════════════════

interface AlertBannerProps {
  level: AlertLevel;
  message: string;
  messageJa?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AlertBanner({ 
  level, 
  message, 
  messageJa, 
  dismissible = false,
  onDismiss 
}: AlertBannerProps) {
  const levelConfig = {
    normal: { color: NERVColors.phosphorGreen, flash: false, prefix: 'STATUS' },
    elevated: { color: NERVColors.amber, flash: false, prefix: 'NOTICE' },
    warning: { color: NERVColors.amber, flash: true, prefix: 'WARNING' },
    danger: { color: NERVColors.crimson, flash: true, prefix: 'DANGER' },
    critical: { color: NERVColors.emergency, flash: true, prefix: 'CRITICAL' },
  };
  
  const config = levelConfig[level];
  const flashAnimation = config.flash ? 'nerv-alert-flash 0.3s step-end infinite' : 'none';
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: config.color,
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    fontFamily: "'Courier New', monospace",
    borderBottom: `2px solid ${level === 'critical' ? '#FF0000' : 'transparent'}`,
    animation: flashAnimation,
  };
  
  const prefixStyle: React.CSSProperties = {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 3,
  };
  
  const messageStyle: React.CSSProperties = {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  };
  
  const jaStyle: React.CSSProperties = {
    color: '#000000',
    fontSize: 10,
    opacity: 0.8,
  };
  
  return (
    <div style={containerStyle}>
      <span style={prefixStyle}>▲ {config.prefix} ▲</span>
      <span style={messageStyle}>{message}</span>
      {messageJa && <span style={jaStyle}>// {messageJa}</span>}
      {dismissible && (
        <button 
          onClick={onDismiss}
          style={{
            background: 'none',
            border: '1px solid #000',
            color: '#000',
            cursor: 'pointer',
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            padding: '2px 8px',
            marginLeft: 8,
          }}
        >
          ACK
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT PANEL WRAPPER - Panel that changes appearance based on alert level
// ═══════════════════════════════════════════════════════════════════════════════

interface AlertPanelProps {
  children: React.ReactNode;
  title?: string;
  titleJa?: string;
  alertLevel?: AlertLevel;
  flashOnAlert?: boolean;
  criticalContent?: React.ReactNode; // Show different content when critical
}

export function AlertPanel({
  children,
  title,
  titleJa,
  alertLevel = 'normal',
  flashOnAlert = true,
  criticalContent,
}: AlertPanelProps) {
  const [flashPhase, setFlashPhase] = useState(false);
  
  // Flash animation for danger/critical
  useEffect(() => {
    if (alertLevel === 'danger' || alertLevel === 'critical') {
      const interval = setInterval(() => {
        setFlashPhase(p => !p);
      }, alertLevel === 'critical' ? 150 : 300);
      return () => clearInterval(interval);
    }
  }, [alertLevel]);
  
  const levelColors = {
    normal: { border: NERVColors.borderMid, title: NERVColors.crimsonDark, accent: NERVColors.amber },
    elevated: { border: NERVColors.amber, title: NERVColors.amberDim, accent: NERVColors.amber },
    warning: { border: NERVColors.amber, title: NERVColors.amber, accent: NERVColors.amber },
    danger: { border: flashPhase && flashOnAlert ? NERVColors.crimson : NERVColors.borderMid, title: NERVColors.crimson, accent: NERVColors.crimson },
    critical: { border: flashPhase && flashOnAlert ? NERVColors.emergency : NERVColors.crimsonDark, title: NERVColors.emergency, accent: NERVColors.emergency },
  };
  
  const colors = levelColors[alertLevel];
  
  const containerStyle: React.CSSProperties = {
    border: `2px solid ${colors.border}`,
    backgroundColor: NERVColors.panelDark,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Courier New', 'MS Gothic', monospace",
    transition: 'border-color 0.1s ease',
  };
  
  const titleBarStyle: React.CSSProperties = {
    backgroundColor: colors.title,
    padding: '6px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `2px solid ${colors.accent}`,
  };
  
  const titleStyle: React.CSSProperties = {
    color: alertLevel === 'danger' || alertLevel === 'critical' ? '#000000' : colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadow: alertLevel === 'danger' || alertLevel === 'critical' ? 'none' : `0 0 4px ${colors.accent}`,
  };
  
  const titleJaStyle: React.CSSProperties = {
    color: alertLevel === 'danger' || alertLevel === 'critical' ? '#000000' : NERVColors.phosphorGreen,
    fontSize: 9,
    letterSpacing: 2,
  };
  
  const contentStyle: React.CSSProperties = {
    padding: 12,
    flex: 1,
    backgroundColor: (alertLevel === 'critical' && flashPhase) ? 'rgba(255, 0, 0, 0.05)' : 'transparent',
  };
  
  // Show critical content if provided and in critical state
  const displayContent = criticalContent && (alertLevel === 'danger' || alertLevel === 'critical')
    ? criticalContent
    : children;
  
  return (
    <div style={containerStyle}>
      {title && (
        <div style={titleBarStyle}>
          <span style={titleStyle}>
            {alertLevel === 'danger' || alertLevel === 'critical' ? '⚠ ' : ''}{title}
          </span>
          {titleJa && <span style={titleJaStyle}>{titleJa}</span>}
        </div>
      )}
      <div style={contentStyle}>{displayContent}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMERGENCY OVERLAY - Full screen alert when things go really wrong
// ═══════════════════════════════════════════════════════════════════════════════

interface EmergencyOverlayProps {
  active: boolean;
  message?: string;
  messageJa?: string;
  subMessage?: string;
}

export function EmergencyOverlay({ 
  active, 
  message = 'SYSTEM CONTAMINATION DETECTED',
  messageJa = 'システム汚染検出',
  subMessage = 'AT FIELD COMPROMISED'
}: EmergencyOverlayProps) {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setFrame(f => f + 1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [active]);
  
  if (!active) return null;
  
  const flash = frame % 10 < 5;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: flash ? 'rgba(139, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      fontFamily: "'Courier New', monospace",
      border: `4px solid ${flash ? NERVColors.emergency : NERVColors.crimson}`,
      transition: 'background-color 0.05s ease',
    }}>
      {/* Warning triangles */}
      <div style={{
        fontSize: 48,
        color: flash ? NERVColors.emergency : 'transparent',
        marginBottom: 20,
        textShadow: `0 0 20px ${NERVColors.emergency}`,
      }}>
        ▲ ▲ ▲
      </div>
      
      <div style={{
        color: flash ? NERVColors.emergency : NERVColors.crimson,
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 8,
        textShadow: `0 0 15px ${NERVColors.emergency}`,
        textAlign: 'center',
      }}>
        {message}
      </div>
      
      <div style={{
        color: flash ? NERVColors.emergency : NERVColors.crimson,
        fontSize: 18,
        marginTop: 12,
        letterSpacing: 4,
        opacity: 0.8,
      }}>
        {messageJa}
      </div>
      
      {subMessage && (
        <div style={{
          color: NERVColors.textDim,
          fontSize: 14,
          marginTop: 24,
          letterSpacing: 2,
        }}>
          {subMessage}
        </div>
      )}
      
      {/* Animated border */}
      <div style={{
        position: 'absolute',
        inset: 10,
        border: `1px solid ${flash ? NERVColors.emergency : 'transparent'}`,
        pointerEvents: 'none',
      }} />
      
      {/* Corner markers */}
      {[[0, 0], ['right', 0], [0, 'bottom'], ['right', 'bottom']].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: pos[0] === 0 ? 20 : 'auto',
          right: pos[0] === 'right' ? 20 : 'auto',
          top: pos[1] === 0 ? 20 : 'auto',
          bottom: pos[1] === 'bottom' ? 20 : 'auto',
          width: 30,
          height: 30,
          borderTop: pos[1] === 0 ? `2px solid ${NERVColors.emergency}` : 'none',
          borderBottom: pos[1] === 'bottom' ? `2px solid ${NERVColors.emergency}` : 'none',
          borderLeft: pos[0] === 0 ? `2px solid ${NERVColors.emergency}` : 'none',
          borderRight: pos[0] === 'right' ? `2px solid ${NERVColors.emergency}` : 'none',
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTAMINATION INDICATOR - Mental pollution gauge
// ═══════════════════════════════════════════════════════════════════════════════

interface ContaminationGaugeProps {
  value: number; // 0-100
  warningThreshold?: number;
  dangerThreshold?: number;
}

export function ContaminationGauge({ 
  value, 
  warningThreshold = 30, 
  dangerThreshold = 60 
}: ContaminationGaugeProps) {
  const getStatus = (): { color: string; label: string; labelJa: string } => {
    if (value >= dangerThreshold) {
      return { color: NERVColors.emergency, label: 'CRITICAL', labelJa: '危険' };
    } else if (value >= warningThreshold) {
      return { color: NERVColors.amber, label: 'ELEVATED', labelJa: '上昇' };
    }
    return { color: NERVColors.phosphorGreen, label: 'NOMINAL', labelJa: '正常' };
  };
  
  const status = getStatus();
  
  const containerStyle: React.CSSProperties = {
    fontFamily: "'Courier New', monospace",
    padding: 8,
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
  };
  
  const labelStyle: React.CSSProperties = {
    color: NERVColors.textDim,
    fontSize: 9,
    letterSpacing: 1,
  };
  
  const valueStyle: React.CSSProperties = {
    color: status.color,
    fontSize: 11,
    fontWeight: 'bold',
    textShadow: `0 0 4px ${status.color}`,
    animation: value >= dangerThreshold ? 'nerv-alert-flash 0.3s step-end infinite' : 'none',
  };
  
  const barContainerStyle: React.CSSProperties = {
    height: 8,
    backgroundColor: NERVColors.borderMid,
    position: 'relative',
    marginBottom: 4,
  };
  
  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${value}%`,
    backgroundColor: status.color,
    transition: 'width 0.3s ease',
    boxShadow: `0 0 8px ${status.color}`,
  };
  
  // Threshold markers
  const markers = [
    { pos: warningThreshold, color: NERVColors.amber },
    { pos: dangerThreshold, color: NERVColors.crimson },
  ];
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>CONTAMINATION // 精神汚染</span>
        <span style={valueStyle}>{value.toFixed(1)}% {status.label}</span>
      </div>
      
      <div style={barContainerStyle}>
        <div style={fillStyle} />
        {markers.map((m, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              left: `${m.pos}%`,
              top: -2,
              bottom: -2,
              width: 1,
              backgroundColor: m.color,
            }}
          />
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: NERVColors.textDim }}>
        <span>0%</span>
        <span style={{ color: NERVColors.amber }}>{warningThreshold}%</span>
        <span style={{ color: NERVColors.crimson }}>{dangerThreshold}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default AlertPanel;
