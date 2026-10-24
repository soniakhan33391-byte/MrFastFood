export const STORAGE_KEYS = {
  users: 'mff_users',
  menu: 'mff_menu',
  stockEntries: 'mff_stock_entries',
  suppliers: 'mff_suppliers',
  tables: 'mff_tables',
  customers: 'mff_customers',
  expenses: 'mff_expenses',
  offers: 'mff_offers',
  settings: 'mff_settings',
  sales: 'mff_sales',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('save error', e)
  }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function money(n) {
  const v = Number(n) || 0
  return 'Rs. ' + v.toLocaleString('en-PK')
}

export function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function fmtDate(d) {
  if (!d) return ''
  const x = new Date(d)
  const dd = String(x.getDate()).padStart(2, '0')
  const mm = String(x.getMonth() + 1).padStart(2, '0')
  const yyyy = x.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
