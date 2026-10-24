import React, { useState, useEffect } from 'react'
import { useStore } from './store/Store'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import POS from './components/POS'
import Dashboard from './components/Dashboard'
import MenuManager from './components/MenuManager'
import Inventory from './components/Inventory'
import Customers from './components/Customers'
import Expenses from './components/Expenses'
import Reports from './components/Reports'
import Offers from './components/Offers'
import Users from './components/Users'
import Backup from './components/Backup'
import MobileOrder from './components/MobileOrder'
import QRScanner from './components/QRScanner'

export default function App() {
  const { user, printData, settings } = useStore()
  const [tab, setTab] = useState('pos')

  useEffect(() => {
    if (user?.role === 'cashier') {
      setTab('pos')
    }
  }, [user])

  if (!user) return <Login />

  const renderTab = () => {
    if (user?.role === 'cashier') return <POS />
    switch (tab) {
      case 'pos': return <POS />
      case 'mobile': return <MobileOrder />
      case 'qrscan': return <QRScanner />
      case 'dashboard': return <Dashboard />
      case 'menu': return <MenuManager />
      case 'inventory': return <Inventory />
      case 'customers': return <Customers />
      case 'expenses': return <Expenses />
      case 'reports': return <Reports />
      case 'offers': return <Offers />
      case 'users': return <Users />
      case 'backup': return <Backup />
      default: return <POS />
    }
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Desktop pe fixed, Mobile pe top */}
      <Sidebar active={tab} setActive={setTab} />
      
      {/* Main Content - Mobile pe full width */}
      <main className="flex-1 overflow-auto w-full bg-white md:bg-gray-100">
        {renderTab()}
      </main>

      {/* Print Area - Thermal Printer ke liye */}
      <div className="hidden print:block">
        {printData?.type === 'kot' && (
          <div style={{padding:'10px', fontFamily:'monospace', fontSize:'13px', color:'black'}}>
            <div style={{textAlign:'center', fontWeight:'bold'}}>KOT - {settings?.shopName || 'Mr Fast Food Mardan'}</div>
            <div style={{textAlign:'center', fontSize:'11px'}}>{settings?.address || 'Mardan'}</div>
            <hr/>
            <div>Table: <b>{printData.table}</b></div>
            <div>Time: {new Date(printData.time).toLocaleString()}</div>
            <hr/>
            <table style={{width:'100%'}}><thead><tr><th align="left">Item</th><th>Qty</th></tr></thead>
              <tbody>{printData.items.map((i,idx)=><tr key={idx}><td>{i.name}</td><td align="center">{i.qty}</td></tr>)}</tbody>
            </table>
            <hr/><div style={{textAlign:'center'}}>--- Kitchen ---</div>
          </div>
        )}
        {printData?.type === 'bill' && printData.sale && (
          <div style={{padding:'10px', fontFamily:'monospace', fontSize:'12px', color:'black'}}>
            <div style={{textAlign:'center', fontWeight:'bold', fontSize:'16px'}}>{settings?.shopName || 'Mr Fast Food Mardan'}</div>
            <div style={{textAlign:'center', fontSize:'11px'}}>{settings?.address || 'Mardan'}</div>
            <hr/>
            <div>Date: {new Date(printData.sale.date).toLocaleString()}</div>
            <div>Bill No: <b>{printData.sale.billNo || printData.sale.id.slice(0,8).toUpperCase()}</b> | Table: {printData.sale.table}</div>
            {printData.sale.customerName && <div>Customer: {printData.sale.customerName}</div>}
            <hr/>
            <table style={{width:'100%'}}><thead><tr><th align="left">Item</th><th>Qty</th><th align="right">Price</th></tr></thead>
              <tbody>{printData.sale.items.map((i,idx)=><tr key={idx}><td>{i.name}</td><td align="center">{i.qty}</td><td align="right">{i.price*i.qty}</td></tr>)}</tbody>
            </table>
            <hr/>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Subtotal:</span><span>Rs {printData.sale.subtotal}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Discount:</span><span>Rs {printData.sale.discountAmount || 0}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'14px'}}><span>TOTAL:</span><span>Rs {printData.sale.total}</span></div>
            <div>Payment: {printData.sale.method} - {printData.sale.orderType || 'Dine-In'}</div>
            <hr/>
            <div style={{textAlign:'center', fontWeight:'bold'}}>Thank You! Visit Again ❤️</div>
          </div>
        )}
      </div>
    </div>
  )
}