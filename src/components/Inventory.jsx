import React, { useState } from 'react'
import { useStore } from '../store/Store.jsx'
import { uid } from '../utils/storage.js'

export default function Inventory() {
  const { menu, updateMenuItem, stockEntries, addStockEntry, deleteStockEntry, suppliers, addSupplier, updateSupplier, deleteSupplier, paySupplier, damageReturns, addDamageReturn, deleteDamageReturn, productReturns, addProductReturn, deleteProductReturn } = useStore()
  
  const [selectedItem, setSelectedItem] = useState('')
  const [qtyPurchased, setQtyPurchased] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [contact, setContact] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyContact, setCompanyContact] = useState('')
  const [paySupplierId, setPaySupplierId] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0,10))
  const [showLedger, setShowLedger] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [damageItem, setDamageItem] = useState('')
  const [damageQty, setDamageQty] = useState('')
  const [damageReason, setDamageReason] = useState('Damage')
  const [damageDate, setDamageDate] = useState(new Date().toISOString().slice(0,10))
  const [showDamageHistory, setShowDamageHistory] = useState(false)
  const [returnItem, setReturnItem] = useState('')
  const [returnQty, setReturnQty] = useState('')
  const [returnReason, setReturnReason] = useState('Customer Return')
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0,10))

  const getCost = (item) => Number(item.cost ?? item.costPrice ?? item.companyPrice ?? 0)
  const getStock = (item) => Number(item.stock ?? item.stockQty ?? 0)
  const getQty = (e) => Number(e.qtyPurchased ?? e.qty ?? e.quantity ?? 0)

  const handleAddStock = () => {
    if (!selectedItem) return alert('Item select karo!')
    if (!qtyPurchased) return alert('Qty likho!')
    const menuItem = menu.find(m => m.id === selectedItem)
    const qty = Number(qtyPurchased)
    const pPrice = Number(purchasePrice) || getCost(menuItem)
    const oldStock = getStock(menuItem)
    const newStock = oldStock + qty
    updateMenuItem(menuItem.id, { stock: newStock, stockQty: newStock, cost: pPrice, costPrice: pPrice, companyPrice: pPrice })
    let supplier = suppliers.find(s => s.name.toLowerCase() === (supplierName||'').toLowerCase())
    if (supplierName && !supplier) {
      const newSup = { id: uid(), name: supplierName, contact: contact, totalSaman: 0, totalPaid: 0, payments: [] }
      addSupplier(newSup)
      supplier = newSup
    }
    if (supplier) updateSupplier(supplier.id, { totalSaman: (Number(supplier.totalSaman)||0) + (qty * pPrice) })
    addStockEntry({ id: uid(), menuId: menuItem.id, itemName: menuItem.name, qtyPurchased: qty, qty: qty, totalCost: qty * pPrice, purchasePrice: pPrice, supplierName: supplierName || 'Unknown', contact, date, oldStock, newStock })
    setSelectedItem(''); setQtyPurchased(''); setPurchasePrice(''); setSupplierName(''); setContact('')
  }

  const handleAddSupplier = () => {
    if (!companyName) return alert('Company name likho!')
    addSupplier({ id: uid(), name: companyName, contact: companyContact, totalSaman: 0, totalPaid: 0, payments: [] })
    setCompanyName(''); setCompanyContact('')
  }

  const handlePay = () => {
    if (!paySupplierId || !payAmount) return alert('Supplier aur Amount likho!')
    const sup = suppliers.find(s => s.id === paySupplierId)
    paySupplier(sup.id, Number(payAmount))
    const updatedPayments = [...(sup.payments||[]), { amount: Number(payAmount), date: payDate, id: uid() }]
    updateSupplier(sup.id, { payments: updatedPayments })
    setPayAmount('')
  }

  const handleDamage = () => {
    if (!damageItem) return alert('Item select karo!')
    if (!damageQty) return alert('Qty likho!')
    const menuItem = menu.find(m => m.id === damageItem)
    const qty = Number(damageQty)
    const oldStock = getStock(menuItem)
    const newStock = Math.max(0, oldStock - qty)
    updateMenuItem(menuItem.id, { stock: newStock, stockQty: newStock })
    const loss = qty * getCost(menuItem)
    addDamageReturn({ id: uid(), menuId: menuItem.id, itemName: menuItem.name, qty, reason: damageReason, date: damageDate, cost: loss, oldStock, newStock })
    setDamageItem(''); setDamageQty(''); setDamageReason('Damage')
    alert(`Damage Added! Stock ${oldStock} -> ${newStock} | Loss Rs ${loss}`)
  }

  const handleReturn = () => {
    if (!returnItem) return alert('Item select karo!')
    if (!returnQty) return alert('Qty likho!')
    const menuItem = menu.find(m => m.id === returnItem)
    const qty = Number(returnQty)
    const oldStock = getStock(menuItem)
    const newStock = oldStock + qty
    updateMenuItem(menuItem.id, { stock: newStock, stockQty: newStock })
    addProductReturn({ id: uid(), menuId: menuItem.id, itemName: menuItem.name, qty, reason: returnReason, date: returnDate, price: Number(menuItem.price||0)*qty })
    setReturnItem(''); setReturnQty('')
    alert(`Return Added! Stock ${oldStock} -> ${newStock}`)
  }

  const printOneSupplier = (supplier) => {
    const entries = stockEntries.filter(e => (e.supplierName||'').toLowerCase() === supplier.name.toLowerCase())
    const due = (Number(supplier.totalSaman||0) - Number(supplier.totalPaid||0))
    const w = window.open('', '_blank', 'width=420,height=700')
    if (!w) { alert('Popup blocked! Allow popup'); return; }
    w.document.write(`
      <html><head><title>Bill - ${supplier.name}</title><style>
        body{font-family:monospace; width:360px; margin:auto; padding:10px}
        .c{text-align:center} .b{font-weight:bold} .line{border-top:1px dashed #000; margin:8px 0}
        .row{display:flex; justify-content:space-between} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:4px; font-size:11px}
      </style></head><body>
        <div class="c"><div class="b" style="font-size:20px">Mr Fast Food</div><div class="b">SUPPLIER BILL</div><div>${new Date().toLocaleString()}</div></div>
        <div class="line"></div>
        <div class="row"><span>Company:</span><span class="b">${supplier.name}</span></div>
        <div class="row"><span>Contact:</span><span>${supplier.contact||'-'}</span></div>
        <div class="line"></div>
        <div class="row"><span>Total:</span><span>Rs ${supplier.totalSaman||0}</span></div>
        <div class="row"><span>Paid:</span><span>Rs ${supplier.totalPaid||0}</span></div>
        <div class="row b" style="font-size:16px"><span>DUE:</span><span>Rs ${due}</span></div>
        <div class="line"></div><div class="b">Stock History:</div>
        <table><tr><th>Date</th><th>Item</th><th>Qty</th><th>Amt</th></tr>
        ${entries.map(e=>`<tr><td>${e.date||''}</td><td>${e.itemName||''}</td><td>+${getQty(e)}</td><td>Rs ${e.totalCost||0}</td></tr>`).join('') || '<tr><td colspan=4>No entry</td></tr>'}
        </table>
        <div style="text-align:center; margin-top:15px"><button onclick="window.print()" style="padding:10px 20px; background:#1976d2; color:white; border:none; border-radius:6px; font-weight:900">🖨️ Print Now</button></div>
      </body></html>
    `)
    w.document.close()
  }

  const printAllSuppliers = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked!'); return; }
    w.document.write(`<html><head><title>All Suppliers</title><style>table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:6px}</style></head><body>
      <div style="text-align:center"><b>All Suppliers Ledger - ${new Date().toLocaleString()}</b></div>
      <table style="margin-top:10px"><tr><th>#</th><th>Company</th><th>Contact</th><th>Total</th><th>Paid</th><th>Due</th></tr>
      ${suppliers.map((s,i)=>`<tr><td>${i+1}</td><td>${s.name}</td><td>${s.contact||'-'}</td><td>Rs ${s.totalSaman||0}</td><td>Rs ${s.totalPaid||0}</td><td><b>Rs ${Number(s.totalSaman||0)-Number(s.totalPaid||0)}</b></td></tr>`).join('')}</table>
      <div style="text-align:center; margin-top:10px"><button onclick="window.print()">🖨️ Print Now</button></div></body></html>`)
    w.document.close()
  }

  const handleDeleteStock = (entry) => {
    const qty = getQty(entry)
    if (!confirm(`Delete history?\n${entry.itemName} +${qty}\nNOTE: Menu Stock se minus NAHI hoga - Sirf history delete hogi!`)) return
    deleteStockEntry(entry.id)
  }

  // --- SIRF YE NAYA ADD KIYA - PRINT KE LIYE ---
  const totalDamageLoss = damageReturns.reduce((s,d)=>s+Number(d.cost||0),0)
  const totalReturnAmount = productReturns.reduce((s,d)=>s+Number(d.price||0),0)
  const totalStockQty = stockEntries.reduce((s,e)=>s+getQty(e),0)

  const printDamageReport = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked!'); return; }
    w.document.write(`<html><head><title>Damage Report</title><style>body{font-family:Arial; padding:20px} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:8px} .header{text-align:center}</style></head><body><div class="header"><h2>Mr Fast Food - Damage / Wastage Report</h2><div>${new Date().toLocaleString()}</div><h3 style="color:red">Total Loss: Rs ${totalDamageLoss} (${damageReturns.length} items)</h3></div><table><tr><th>#</th><th>Date</th><th>Item</th><th>Qty</th><th>Reason</th><th>Loss</th><th>Stock</th></tr>${damageReturns.map((d,i)=>`<tr><td>${i+1}</td><td>${d.date}</td><td>${d.itemName}</td><td>- ${d.qty}</td><td>${d.reason}</td><td>Rs ${d.cost}</td><td>${d.oldStock}→${d.newStock}</td></tr>`).join('')}</table><div style="text-align:center; margin-top:20px"><button onclick="window.print()" style="padding:12px 24px; background:#e65100; color:white; border:none; border-radius:8px; font-weight:900">🖨️ Print Now</button></div></body></html>`)
    w.document.close()
  }
  const printReturnReport = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked!'); return; }
    w.document.write(`<html><head><title>Return Report</title><style>body{font-family:Arial; padding:20px} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:8px} .header{text-align:center}</style></head><body><div class="header"><h2>Mr Fast Food - Return Report</h2><div>${new Date().toLocaleString()}</div><h3 style="color:green">Total Return: Rs ${totalReturnAmount} (${productReturns.length} items)</h3></div><table><tr><th>#</th><th>Date</th><th>Item</th><th>Qty</th><th>Reason</th><th>Amount</th></tr>${productReturns.map((d,i)=>`<tr><td>${i+1}</td><td>${d.date}</td><td>${d.itemName}</td><td>+ ${d.qty}</td><td>${d.reason}</td><td>Rs ${d.price}</td></tr>`).join('')}</table><div style="text-align:center; margin-top:20px"><button onclick="window.print()" style="padding:12px 24px; background:#2e7d32; color:white; border:none; border-radius:8px; font-weight:900">🖨️ Print Now</button></div></body></html>`)
    w.document.close()
  }
  const printProfitLoss = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked!'); return; }
    w.document.write(`<html><head><title>Profit Loss Summary</title><style>body{font-family:Arial; padding:20px} .box{border:2px solid #000; padding:15px; margin:10px 0; border-radius:10px; text-align:center} .big{font-size:26px; font-weight:900}</style></head><body><div style="text-align:center"><h1>Mr Fast Food</h1><h2>Profit Loss Summary</h2><div>${new Date().toLocaleString()}</div></div><div class="box"><div>Stock Entries</div><div class="big">${stockEntries.length} Entries - Qty ${totalStockQty}</div></div><div class="box" style="background:#ffebee"><div>Damage Loss</div><div class="big" style="color:red">Rs ${totalDamageLoss}</div></div><div class="box" style="background:#e8f5e9"><div>Returns</div><div class="big" style="color:green">Rs ${totalReturnAmount}</div></div><div class="box" style="background:#fff3e0; border-width:3px"><div class="big">Net Impact: Rs ${totalReturnAmount - totalDamageLoss}</div></div><div style="text-align:center; margin-top:20px"><button onclick="window.print()" style="padding:12px 24px; background:#0f172a; color:white; border:none; border-radius:8px; font-weight:900">🖨️ Print Now</button></div></body></html>`)
    w.document.close()
  }

  return (
    <div style={{ padding: '16px', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ color: '#d32f2f', fontWeight: '900', margin: 0 }}>Stock / Inventory & Supplier + Damage/Return</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={()=>setShowHistory(true)} style={{ padding: '10px 14px', background: '#ff6f00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>📦 Stock History</button>
          <button onClick={()=>setShowDamageHistory(true)} style={{ padding: '10px 14px', background: '#e65100', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>⚠️ Damage ({damageReturns.length}) Rs {totalDamageLoss}</button>
          <button onClick={()=>setShowLedger(true)} style={{ padding: '10px 14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>📋 Supplier Ledger</button>
          <button onClick={printAllSuppliers} style={{ padding: '10px 14px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>🖨️ Print All</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
          <h4>Stock Entry - Auto Add to Menu Stock</h4>
          <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option value="">Select Item</option>
            {menu.map(m => <option key={m.id} value={m.id}>{m.name} - Stock: {getStock(m)}</option>)}
          </select>
          <input type="number" value={qtyPurchased} onChange={e => setQtyPurchased(e.target.value)} placeholder="Qty purchased" style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '2px solid #4caf50', fontWeight: '700' }} />
          <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="Purchase price" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Supplier/Company name" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={handleAddStock} style={{ width: '100%', padding: '12px', background: '#ff6f00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900' }}>+ Add Stock</button>

          <div style={{ marginTop: '16px', background: '#fff3e0', padding: '12px', borderRadius: '10px', border: '2px solid #ff9800' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>⚠️ Damage / Wastage / Expired - Stock MINUS + Loss</h4>
            <select value={damageItem} onChange={e => setDamageItem(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px' }}>
              <option value="">Select Item for Damage</option>
              {menu.map(m => <option key={m.id} value={m.id}>{m.name} - Stock: {getStock(m)} - Cost: Rs {getCost(m)}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <input type="number" value={damageQty} onChange={e => setDamageQty(e.target.value)} placeholder="Damage Qty" style={{ padding: '8px' }} />
              <select value={damageReason} onChange={e => setDamageReason(e.target.value)} style={{ padding: '8px' }}>
                <option>Damage</option><option>Expired</option><option>Wastage</option><option>Burnt</option><option>Staff Use</option><option>Rat / Leakage</option>
              </select>
            </div>
            <input type="date" value={damageDate} onChange={e => setDamageDate(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px' }} />
            <button onClick={handleDamage} style={{ width: '100%', padding: '10px', background: '#e65100', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800' }}>➖ Cut Stock as {damageReason}</button>
          </div>

          <div style={{ marginTop: '12px', background: '#e8f5e9', padding: '12px', borderRadius: '10px', border: '2px solid #4caf50' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>↩️ Customer Return / Supplier Return - Stock PLUS</h4>
            <select value={returnItem} onChange={e => setReturnItem(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px' }}>
              <option value="">Select Item for Return</option>
              {menu.map(m => <option key={m.id} value={m.id}>{m.name} - Stock: {getStock(m)}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <input type="number" value={returnQty} onChange={e => setReturnQty(e.target.value)} placeholder="Return Qty" style={{ padding: '8px' }} />
              <select value={returnReason} onChange={e => setReturnReason(e.target.value)} style={{ padding: '8px' }}>
                <option>Customer Return</option><option>Supplier Return</option><option>Wrong Item</option><option>Quality Issue</option>
              </select>
            </div>
            <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '8px' }} />
            <button onClick={handleReturn} style={{ width: '100%', padding: '10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800' }}>➕ Add Stock as Return</button>
          </div>
        </div>

        <div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <h4>Add Supplier</h4>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input value={companyContact} onChange={e => setCompanyContact(e.target.value)} placeholder="Contact" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button onClick={handleAddSupplier} style={{ width: '100%', padding: '10px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800' }}>Add Supplier</button>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
            <h4>Pay Supplier</h4>
            <select value={paySupplierId} onChange={e => setPaySupplierId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} - Due Rs {(Number(s.totalSaman||0)-Number(s.totalPaid||0))}</option>)}
            </select>
            <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Amount" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button onClick={handlePay} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800' }}>Pay</button>
          </div>
          
          {/* --- PROFIT LOSS SUMMARY - BADA & HIGHLIGHT - SIRF YE CHANGE KIYA --- */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px', borderRadius: '16px', marginTop: '16px', color: 'white', border: '3px solid #ff6f00', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#ff6b35', fontWeight: '900', fontSize: '20px' }}>📊 Profit Loss Summary</h3>
              <button onClick={printProfitLoss} style={{ padding: '6px 12px', background: '#ff6f00', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>🖨️ Print</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}><span>Stock Entries:</span><span style={{ fontWeight: '900', fontSize: '18px' }}>{stockEntries.length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}><span>Damage Loss:</span><span style={{ color: '#ff6b6b', fontWeight: '900', fontSize: '20px' }}>Rs {totalDamageLoss}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}><span>Returns:</span><span style={{ color: '#4ade80', fontWeight: '900', fontSize: '18px' }}>{productReturns.length} - Rs {totalReturnAmount}</span></div>
            </div>
            <div style={{ background: totalReturnAmount - totalDamageLoss >=0 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Net Impact</div>
              <div style={{ fontSize: '28px', fontWeight: '900' }}>Rs {totalReturnAmount - totalDamageLoss}</div>
              <div style={{ fontSize: '12px' }}>{totalReturnAmount - totalDamageLoss >=0 ? 'Profit' : 'Loss'} - Return minus Damage</div>
            </div>
          </div>
        </div>
      </div>

      {showLedger && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '1100px', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Supplier Ledger - All Suppliers ({suppliers.length})</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={printAllSuppliers} style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800' }}>🖨️ Print All</button>
                <button onClick={()=>setShowLedger(false)} style={{ padding: '8px 16px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800' }}>❌ Close</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f5f5f5' }}><th style={{ padding: '12px', textAlign: 'left' }}>Company</th><th>Contact</th><th>Total</th><th>Paid</th><th>Due</th><th>Print</th><th>Delete</th></tr></thead>
                <tbody>
                  {suppliers.map(s => {
                    const due = (Number(s.totalSaman||0)-Number(s.totalPaid||0))
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: '800' }}>{s.name}</td>
                        <td style={{ padding: '12px' }}>{s.contact||'-'}</td>
                        <td style={{ padding: '12px' }}>Rs {s.totalSaman||0}</td>
                        <td style={{ padding: '12px' }}>Rs {s.totalPaid||0}</td>
                        <td style={{ padding: '12px', fontWeight: '900', color: due>0?'red':'green' }}>Rs {due}</td>
                        <td style={{ padding: '12px' }}><button onClick={()=>printOneSupplier(s)} style={{ padding: '8px 14px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>🖨️ Print Bill</button></td>
                        <td style={{ padding: '12px' }}><button onClick={()=>{ if(confirm('Delete '+s.name+'?')) deleteSupplier(s.id) }} style={{ padding: '8px 14px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>❌ Delete</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', background: '#ff6f00', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>📦 Stock History - All Entries ({stockEntries.length})</h3>
              <button onClick={()=>setShowHistory(false)} style={{ padding: '8px 16px', background: 'white', color: '#ff6f00', border: 'none', borderRadius: '6px', fontWeight: '800' }}>❌ Close</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.5fr 0.8fr 1fr 80px', gap: '8px', fontWeight: '800', fontSize: '12px', background: '#f5f5f5', padding: '10px', position: 'sticky', top: 0 }}>
                <span>Date</span><span>Item</span><span>Qty</span><span>Stock</span><span>Supplier</span><span>Delete</span>
              </div>
              {stockEntries.slice().reverse().map(e => (
                <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.5fr 0.8fr 1fr 80px', gap: '8px', padding: '12px 10px', borderBottom: '1px solid #eee', fontSize: '13px', alignItems: 'center' }}>
                  <span>{e.date}</span><span style={{ fontWeight: '700' }}>{e.itemName}</span><span style={{ color: 'green', fontWeight: '800' }}>+{getQty(e)}</span><span>{e.oldStock ?? '-'}→{e.newStock ?? '-'}</span><span>{e.supplierName}</span>
                  <button onClick={()=>handleDeleteStock(e)} style={{ padding: '6px 10px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '5px', fontWeight: '800', cursor: 'pointer' }}>❌ Del</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDamageHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', background: '#e65100', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0 }}>⚠️ Damage / Return History - Loss Rs {totalDamageLoss}</h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={printDamageReport} style={{ padding: '8px 12px', background: 'white', color: '#e65100', border: 'none', borderRadius: '6px', fontWeight: '800' }}>🖨️ Print Damage</button>
                <button onClick={printReturnReport} style={{ padding: '8px 12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800' }}>🖨️ Print Return</button>
                <button onClick={()=>setShowDamageHistory(false)} style={{ padding: '8px 12px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800' }}>❌ Close</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <h4>Damage / Wastage ({damageReturns.length}) <button onClick={printDamageReport} style={{ marginLeft: '10px', padding: '5px 10px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '800' }}>🖨️ Print Damage</button></h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead><tr style={{ background: '#fff3e0' }}><th style={{ padding: '10px' }}>Date</th><th>Item</th><th>Qty</th><th>Reason</th><th>Loss</th><th>Del</th></tr></thead>
                <tbody>{damageReturns.slice().reverse().map(d=><tr key={d.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{d.date}</td><td style={{ padding: '10px' }}>{d.itemName}</td><td style={{ padding: '10px', color: 'red', fontWeight: '700' }}>-{d.qty}</td><td style={{ padding: '10px' }}>{d.reason}</td><td style={{ padding: '10px', fontWeight: '800' }}>Rs {d.cost}</td><td style={{ padding: '10px' }}><button onClick={()=>{ if(confirm('Delete?')) deleteDamageReturn(d.id) }} style={{ padding: '5px 10px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '4px' }}>Del</button></td></tr>)}</tbody>
              </table>
              <h4>Returns ({productReturns.length}) <button onClick={printReturnReport} style={{ marginLeft: '10px', padding: '5px 10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '800' }}>🖨️ Print Return</button></h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#e8f5e9' }}><th style={{ padding: '10px' }}>Date</th><th>Item</th><th>Qty</th><th>Reason</th><th>Amount</th><th>Del</th></tr></thead>
                <tbody>{productReturns.slice().reverse().map(d=><tr key={d.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{d.date}</td><td style={{ padding: '10px' }}>{d.itemName}</td><td style={{ padding: '10px', color: 'green', fontWeight: '700' }}>+{d.qty}</td><td style={{ padding: '10px' }}>{d.reason}</td><td style={{ padding: '10px', fontWeight: '800' }}>Rs {d.price}</td><td style={{ padding: '10px' }}><button onClick={()=>{ if(confirm('Delete?')) deleteProductReturn(d.id) }} style={{ padding: '5px 10px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '4px' }}>Del</button></td></tr>)}</tbody>
              </table>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={printDamageReport} style={{ padding: '12px 24px', background: '#e65100', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900' }}>🖨️ Print Damage Report</button>
                <button onClick={printReturnReport} style={{ padding: '12px 24px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900' }}>🖨️ Print Return Report</button>
                <button onClick={printProfitLoss} style={{ padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900' }}>🖨️ Print Profit Loss Summary</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}