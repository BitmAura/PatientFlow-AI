/**
 * Design System Tokens
 * Centralized design constants for consistent UI/UX across the dashboard
 */

export const designTokens = {
  // Spacing scale (4px base)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  // Typography styles as TailwindCSS class strings
  typography: {
    pageTitle: 'text-3xl font-bold leading-9 text-slate-900 dark:text-white',
    sectionTitle: 'text-xl font-semibold leading-7 text-slate-900 dark:text-white',
    subsectionTitle: 'text-base font-semibold leading-6 text-slate-900 dark:text-white',
    body: 'text-sm leading-6 text-slate-600 dark:text-slate-400',
    bodySmall: 'text-xs leading-5 text-slate-500 dark:text-slate-500',
    label: 'text-sm font-medium text-slate-700 dark:text-slate-300',
  },

  // Colors - semantic usage
  colors: {
    primary: 'var(--color-medical-500)',      // Medical brand color
    secondary: 'var(--color-trust-500)',       // Trust/accent
    success: 'hsl(142 72% 29%)',              // Green
    danger: 'hsl(0 84% 60%)',                 // Red
    warning: 'hsl(38 92% 50%)',               // Amber
    info: 'hsl(73 100% 47%)',                 // Cyan
    muted: 'hsl(210 40% 96%)',                // Light gray
    mutedDark: 'hsl(212 32% 8%)',             // Dark gray
  },

  // Container classes
  containers: {
    // Standard page card
    card: 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow',
    
    // Without hover
    cardStatic: 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm',
    
    // Elevated (used for modals, dropdowns)
    cardElevated: 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg',
    
    // Table row
    tableRow: 'hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors',
    
    // Form group
    formGroup: 'space-y-2',
  },

  // Button variants
  buttons: {
    primary: 'bg-medical-500 hover:bg-medical-600 text-white rounded-md px-4 py-2 font-medium transition-colors',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-md px-4 py-2 font-medium transition-colors',
    danger: 'bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 font-medium transition-colors',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-md px-4 py-2 font-medium transition-colors',
  },

  // Input states
  inputs: {
    base: 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-medical-500',
    error: 'border-red-500 focus:ring-red-500',
    disabled: 'bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-50',
  },

  // Transitions
  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },

  // Responsive breakpoints (match Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

// Helper functions
export const cn = (...classes: any[]): string => {
  return classes
    .flat()
    .map((cls) => {
      if (!cls) return '';
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .map(([key, value]) => (value ? key : ''))
          .filter(Boolean)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
};

/**
 * Build responsive class string for mobile-first design
 * Example: responsive('p-4', 'md:p-6', 'lg:p-8')
 */
export const responsive = (...classes: string[]) => classes.join(' ');
