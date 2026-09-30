/**
 * SwasthyaSetu AI — Public Health Resilience Design Tokens
 * Conforming to WCAG 2.2 AA (4.5:1 text, 3:1 graphical objects/large text)
 * Standardized on 8px spatial grid, 12-16px card radii, and calibrated semantic tiers.
 */

export const designTokens = {
  colors: {
    // Canvas & Neutral Structure
    canvas: {
      light: '#F8FAFC', // Slate 50
      dark: '#0B132B',   // Deep calm navy slate
      highContrast: '#000000',
    },
    surface: {
      light: '#FFFFFF',
      dark: '#162238',
      highContrast: '#0A0A0A',
    },
    surfaceSubtle: {
      light: '#F1F5F9', // Slate 100
      dark: '#1E2D4A',
      highContrast: '#171717',
    },
    border: {
      light: '#E2E8F0', // Slate 200
      dark: '#2A3C5E',
      highContrast: '#FFFFFF',
    },
    borderSubtle: {
      light: '#F1F5F9',
      dark: '#223252',
      highContrast: '#A3A3A3',
    },
    text: {
      primary: {
        light: '#0F172A', // Slate 900
        dark: '#F8FAFC',
        highContrast: '#FFFFFF',
      },
      secondary: {
        light: '#475569', // Slate 600
        dark: '#94A3B8',
        highContrast: '#E2E8F0',
      },
      muted: {
        light: '#64748B', // Slate 500
        dark: '#64748B',
        highContrast: '#CBD5E1',
      },
    },

    // Brand & Intent Accents (Calm GovTech Teal / Navy Blue)
    accent: {
      navy: '#10233F',
      primary: '#0D74CE', // Accessible 4.8:1 blue on white
      primaryHover: '#0B5FA8',
      teal: '#0F766E',
      tealLight: '#F0FDFA',
      tealDark: '#115E59',
    },

    // Strict Semantic Status Tiers (Paired with Icons and Explicit Text Labels)
    status: {
      critical: {
        base: '#D92D20', // WCAG accessible red
        bgLight: '#FEF2F2',
        borderLight: '#FECACA',
        textLight: '#991B1B',
        bgDark: '#450A0A',
        textDark: '#FCA5A5',
        label: 'Critical Shortage',
      },
      highRisk: {
        base: '#EA580C', // Amber-orange
        bgLight: '#FFF7ED',
        borderLight: '#FED7AA',
        textLight: '#9A3412',
        bgDark: '#431407',
        textDark: '#FDBA74',
        label: 'High Risk',
      },
      monitoring: {
        base: '#D97706', // Warm amber
        bgLight: '#FFFBEB',
        borderLight: '#FDE68A',
        textLight: '#92400E',
        bgDark: '#451A03',
        textDark: '#FCD34D',
        label: 'Monitoring',
      },
      safe: {
        base: '#16A34A', // Forest green
        bgLight: '#F0FDF4',
        borderLight: '#BBF7D0',
        textLight: '#166534',
        bgDark: '#052E16',
        textDark: '#86EFAC',
        label: 'Safe Buffer',
      },
      expiryRescue: {
        base: '#7C3AED', // Vivid purple for near-expiry value rescue
        bgLight: '#FAF5FF',
        borderLight: '#E9D5FF',
        textLight: '#6B21A8',
        bgDark: '#3B0764',
        textDark: '#D8B4FE',
        label: 'Expiry Rescue',
      },
      needsVerification: {
        base: '#64748B', // Cool slate grey
        bgLight: '#F8FAFC',
        borderLight: '#CBD5E1',
        textLight: '#334155',
        bgDark: '#1E293B',
        textDark: '#94A3B8',
        label: 'Needs Verification',
      },
    },

    // Data Trust Tiers (Fresh / Stale / Unreliable)
    trust: {
      fresh: {
        scoreRange: '85–100',
        color: '#16A34A',
        label: 'Fresh & Verified',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      },
      stale: {
        scoreRange: '60–84',
        color: '#D97706',
        label: 'Stale (>18h)',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      },
      unreliable: {
        scoreRange: '<60',
        color: '#DC2626',
        label: 'Unreliable — Paused',
        badgeBg: 'bg-red-50 text-red-800 border-red-200',
      },
    },
  },

  // 8px Spatial Scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  // Standard Card & Control Radii
  radius: {
    control: '8px',
    card: '14px',
    modal: '18px',
    pill: '9999px',
  },

  // Elevation Math (Single elevation depth as per constitution)
  shadows: {
    card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
    dropdown: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
    drawer: '-4px 0 24px -4px rgba(15, 23, 42, 0.15)',
  },

  // Strict Typographic Scale
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    monoFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    scale: {
      caption: '12px',
      bodySm: '14px',
      body: '16px',
      titleSm: '20px',
      titleLg: '28px',
      hero: '36px',
    },
  },
} as const;

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type LanguageCode = 'en' | 'hi';
