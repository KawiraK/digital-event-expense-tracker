// Minimal inline SVG icons (no external icon library).
// Each accepts size + color props.
const wrap = (children) => function Icon({ size = 20, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  )
}

export const IconDashboard = wrap(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>)
export const IconCalendar = wrap(<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>)
export const IconTag = wrap(<><path d="M3 7v6l8 8 8-8-8-8H5a2 2 0 0 0-2 2z" /><circle cx="7.5" cy="10.5" r="1.2" /></>)
export const IconBell = wrap(<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>)
export const IconChart = wrap(<><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" rx="1" /><rect x="12" y="7" width="3" height="10" rx="1" /><rect x="17" y="13" width="3" height="4" rx="1" /></>)
export const IconLogout = wrap(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>)
export const IconSearch = wrap(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>)
export const IconPlus = wrap(<><path d="M12 5v14M5 12h14" /></>)
export const IconWallet = wrap(<><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 14h2" /></>)
export const IconMoney = wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5a2.5 2 0 0 1 2.5-1.5c1.4 0 2.5.7 2.5 1.7s-1 1.5-2.5 1.8-2.5.9-2.5 1.8 1.1 1.7 2.5 1.7a2.5 2 0 0 0 2.5-1.5" /></>)
export const IconCoins = wrap(<><ellipse cx="9" cy="6" rx="6" ry="3" /><path d="M3 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3" /><path d="M15 9c2.7.3 6 1.5 6 3.5 0 1.7-2.7 3-6 3" /><path d="M21 12.5V18c0 1.7-2.7 3-6 3-1.3 0-2.5-.2-3.5-.6" /></>)
export const IconEye = wrap(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>)
export const IconEyeOff = wrap(<><path d="M9.9 4.2A9.5 9.5 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 11s3.5 7 10 7a9.5 9.5 0 0 0 4.2-1" /><path d="m2 2 20 20M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>)
export const IconTrash = wrap(<><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" /></>)
export const IconEdit = wrap(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>)
export const IconCheck = wrap(<><path d="M20 6 9 17l-5-5" /></>)
export const IconWarn = wrap(<><path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>)
export const IconArrowLeft = wrap(<><path d="M19 12H5M12 19l-7-7 7-7" /></>)
export const IconUpload = wrap(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v12" /></>)
export const IconFile = wrap(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>)
