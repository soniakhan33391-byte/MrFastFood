import React, { useState, useEffect } from 'react'
import { useStore } from '../store/Store'
import { LayoutDashboard, Utensils, Package, Users, Receipt, BarChart3, Gift, Settings, LogOut, ShoppingCart, HardDrive, Smartphone, QrCode, Menu, X } from 'lucide-react'

const items = [
  { key: 'pos', label: 'POS / Tables', icon: ShoppingCart, roles: ['admin','cashier'] },
  { key: 'mobile', label: 'Mobile Order', icon: Smartphone, roles: ['admin','cashier'] },
  { key: 'qrscan', label: 'QR Scanner', icon: QrCode, roles: ['admin','cashier'] },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { key: 'menu', label: 'Menu & Prices', icon: Utensils, roles: ['admin'] },
  { key: 'inventory', label: 'Stock & Supplier', icon: Package, roles: ['admin'] },
  { key: 'customers', label: 'Customers', icon: Users, roles: ['admin'] },
  { key: 'expenses', label: 'Expenses', icon: Receipt, roles: ['admin'] },
  { key: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
  { key: 'offers', label: 'Offers & WhatsApp', icon: Gift, roles: ['admin'] },
  { key: 'users', label: 'Users', icon: Settings, roles: ['admin'] },
  { key: 'backup', label: 'Backup & Restore', icon: HardDrive, roles: ['admin'] },
]

export default function Sidebar({ active, setActive }) {
  const { user, logout } = useStore()
  const currentRole = user?.role || 'admin'
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(()=>{
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if(mobile) setCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    // Desktop pe 3 sec baad auto slide
    const timer = setTimeout(()=>{ if(window.innerWidth >= 768) setCollapsed(true) }, 3000)
    return ()=>{ window.removeEventListener('resize', check); clearTimeout(timer) }
  },[])

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={()=>setCollapsed(!collapsed)}
        className="fixed top-3 left-3 z-50 bg-orange-600 text-white p-2 rounded-lg shadow-lg md:hidden"
      >
        {collapsed ? <Menu size={20}/> : <X size={20}/>}
      </button>

      {/* Overlay for mobile */}
      {!collapsed && isMobile && (
        <div onClick={()=>setCollapsed(true)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>
      )}

      <aside 
        onMouseEnter={()=>!isMobile && setCollapsed(false)}
        onMouseLeave={()=>!isMobile && setCollapsed(true)}
        className={`
          ${collapsed ? 'w-[68px]' : 'w-56'} 
          ${isMobile ? (collapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'}
          bg-gray-900 text-white flex flex-col h-screen no-print
          fixed md:relative z-40 transition-all duration-300 ease-in-out
          shadow-2xl
        `}
      >
        <div className="p-4 border-b border-gray-700 flex items-center gap-3 overflow-hidden">
          <div className="bg-orange-600 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">M</div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-[15px] text-orange-400 whitespace-nowrap">Mr Fast Food</h2>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">Mardan POS</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {items.filter(i => i.roles.includes(currentRole)).map(i => {
            const Icon = i.icon
            return (
              <button key={i.key} onClick={() => { setActive(i.key); if(isMobile) setCollapsed(true) }}
                className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13px] transition-all whitespace-nowrap overflow-hidden ${active === i.key ? 'bg-orange-600 text-white shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
                <Icon size={18} className="flex-shrink-0" /> 
                {!collapsed && <span className="truncate">{i.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-700 overflow-hidden">
          {!collapsed ? (
            <>
              <div className="text-[11px] text-gray-400 mb-2 truncate">{user?.name} ({currentRole}) - {currentRole==='admin' ? 'Full Control' : 'Only Sale'}</div>
              <button onClick={logout} className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <button onClick={logout} className="w-full flex justify-center text-red-400 hover:text-red-300">
              <LogOut size={18}/>
            </button>
          )}
        </div>
      </aside>

      {/* Desktop Toggle Button - Corner me */}
      <button
        onClick={()=>setCollapsed(!collapsed)}
        className="hidden md:flex fixed top-4 left-3 z-50 bg-gray-900 border border-gray-700 text-white w-8 h-8 rounded-full items-center justify-center shadow-lg hover:bg-orange-600 transition-all"
        style={{left: collapsed ? '76px' : '224px'}}
      >
        <span className="text-xs">{collapsed ? '→' : '←'}</span>
      </button>
    </>
  )
}