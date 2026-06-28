// Design tokens for the Digital Event Expense Tracker UI.
// Centralised so every page shares one visual language.

export const T = {
  // Sidebar / dark surfaces
  navy: '#0B1437',
  navy2: '#111C44',

  // Brand
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueSoft: '#EAF0FE',

  // Neutrals
  bg: '#F4F7FE',
  card: '#FFFFFF',
  ink: '#1B2559',   // headings
  body: '#2B3674',  // strong body text
  muted: '#8F9BBA', // secondary text
  line: '#E9EDF7',  // borders

  // Status
  green: '#05CD99',
  greenSoft: '#E6FAF5',
  orange: '#FFB547',
  orangeSoft: '#FFF6E5',
  red: '#EE5D50',
  redSoft: '#FDEEED',

  logout: '#EE5D50',

  radius: 16,
  radiusSm: 10,
  shadow: '0 18px 40px rgba(112, 144, 176, 0.12)',
  shadowSm: '0 4px 14px rgba(112, 144, 176, 0.10)',
};

// Category accent colours (used by donut + chips)
export const CATEGORY_COLORS = {
  venue: '#2563EB',
  catering: '#05CD99',
  decoration: '#FFB547',
  transport: '#6AD2FF',
  entertainment: '#A78BFA',
  contingency: '#EE5D50',
};

export const SERIES_COLORS = ['#2563EB', '#05CD99', '#FFB547', '#6AD2FF', '#A78BFA', '#EE5D50'];

export const formatKES = (n) => {
  const num = Number(n || 0);
  return 'KES ' + num.toLocaleString('en-KE', { maximumFractionDigits: 0 });
};

export const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Colour for a spend ratio (matches the progress bars in the mockup)
export const ratioColor = (ratio) => {
  const r = parseFloat(ratio);
  if (r >= 100) return T.red;
  if (r >= 90) return T.orange;
  if (r >= 75) return T.orange;
  return T.green;
};

// Shared inline-style primitives reused across pages.
export const ui = {
  card: {
    background: T.card,
    borderRadius: T.radius,
    boxShadow: T.shadowSm,
    border: `1px solid ${T.line}`,
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: T.ink,
    letterSpacing: '-0.4px',
  },
  pageSub: {
    margin: '6px 0 0 0',
    fontSize: 15,
    color: T.muted,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: T.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: T.body,
    marginBottom: 8,
    display: 'block',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: T.radiusSm,
    border: `1px solid ${T.line}`,
    background: '#F9FBFF',
    fontSize: 14,
    color: T.ink,
    outline: 'none',
  },
  primaryBtn: {
    background: T.blue,
    color: '#fff',
    border: 'none',
    borderRadius: T.radiusSm,
    padding: '12px 22px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(37, 99, 235, 0.28)',
  },
  ghostBtn: {
    background: '#fff',
    color: T.body,
    border: `1px solid ${T.line}`,
    borderRadius: T.radiusSm,
    padding: '12px 22px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  pill: (kind) => {
    const map = {
      paid: { bg: T.greenSoft, fg: '#03986F' },
      green: { bg: T.greenSoft, fg: '#03986F' },
      pending: { bg: T.orangeSoft, fg: '#B57417' },
      orange: { bg: T.orangeSoft, fg: '#B57417' },
      over: { bg: T.redSoft, fg: '#C23B30' },
      red: { bg: T.redSoft, fg: '#C23B30' },
      blue: { bg: T.blueSoft, fg: T.blueDark },
    };
    const c = map[kind] || map.blue;
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: c.bg,
      color: c.fg,
    };
  },
};
