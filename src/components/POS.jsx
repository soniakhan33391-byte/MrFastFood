import React, { useState, useMemo } from 'react'
import { useStore } from '../store/Store.jsx'

export default function POS() {
  const { menu, tables, activeTable, setActiveTable, addToTable, tableOrder, calcTotal, checkout, removeFromTable, updateQty, tableNames, setTableDiscount, setTableServiceCharge, addToKitchen, settings } = useStore()
  const [search, setSearch] = useState('')
  const [orderType, setOrderType] = useState('Dine-In')
  const [cat, setCat] = useState('All')
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [amountPaid, setAmountPaid] = useState('')

  const effectiveTable = useMemo(() => {
    if (orderType === 'Takeaway') return 'Takeaway'
    if (orderType === 'Delivery') return 'Delivery'
    return activeTable
  }, [orderType, activeTable])

  const categories = useMemo(()=> ['All', ...new Set(menu.map(m=>m.category || m.cat || 'Other'))], [menu])
  const filtered = useMemo(() => {
    let list = menu
    if (cat !== 'All') list = list.filter(m => (m.category||m.cat) === cat)
    if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [menu, search, cat])

  const order = tableOrder(effectiveTable)
  const totals = calcTotal(order)
  const paid = Number(amountPaid) || 0
  const due = Math.max(0, totals.total - paid)
  const ret = Math.max(0, paid - totals.total)

  const printKOT = () => {
    if(order.items.length===0) return alert('Empty order!')
    if(addToKitchen) addToKitchen(effectiveTable, order, orderType)
    const time = new Date().toLocaleString()
    const kotNo = `KOT-${Date.now().toString().slice(-5)}`
    const html = `<html><head><title>KOT</title><style>@page{size:80mm auto;margin:2mm}body{font-family:monospace;width:72mm;margin:0 auto;padding:8px;font-size:12px;color:#000}.header{text-align:center;border-bottom:3px double #000;padding-bottom:10px}.kot{background:#000;color:#fff;padding:6px 14px;font-weight:900;font-size:16px;border-radius:6px;display:inline-block;margin:6px 0}.big{font-size:18px;font-weight:900}.row{padding:5px 0;border-bottom:1px dashed #ccc;display:flex;justify-content:space-between;font-size:13px;font-weight:700}</style></head><body><div class="header"><div>KITCHEN ORDER TICKET</div><div class="kot">${kotNo}</div><div class="big">${orderType} - ${effectiveTable}</div><div>Customer: ${customerName||'Walk-in'}</div><div>${time}</div></div><div style="margin:10px 0">${order.items.map((it,i)=>`<div class="row"><span>${i+1}. ${it.qty} x ${it.name}</span><span>${it.qty}</span></div>`).join('')}</div><div style="text-align:center;margin-top:12px;border-top:2px solid #000;padding-top:8px;font-weight:900">TOTAL ITEMS: ${order.items.reduce((a,b)=>a+b.qty,0)}<br/>KITCHEN COPY</div></body></html>`
    const w = window.open('', '_blank', 'width=380,height=700')
    if(!w) return alert('Please allow popup!')
    w.document.open(); w.document.write(html); w.document.close()
    setTimeout(()=>{ w.focus(); w.print(); }, 600)
  }

  const handleCheckoutAndPrint = () => {
    if(order.items.length===0) return alert('Empty order!')
    const time = new Date().toLocaleString()
    const billNo = `MFF-${Date.now().toString().slice(-6)}`
    const html = `<html><head><title>BILL</title><style>@page{size:80mm auto;margin:2mm}body{font-family:monospace;width:72mm;margin:0 auto;padding:8px;font-size:11px;color:#000}.center{text-align:center}.line{border-top:1px dashed #000;margin:6px 0}.bold{font-weight:900}.row{display:flex;justify-content:space-between;padding:3px 0}.big{font-size:16px;font-weight:900}</style></head><body><div class="center"><div style="font-size:18px;font-weight:900">${settings?.shopName||'Mr Fast Food'}</div><div>Bill No: ${billNo}</div><div>${orderType} - ${effectiveTable}</div><div>Customer: ${customerName||'Walk-in Customer'}</div><div>${time}</div></div><div class="line"></div>${order.items.map(it=>`<div class="row"><span>${it.qty} x ${it.name}</span><span>Rs ${it.qty*it.price}</span></div>`).join('')}<div class="line"></div><div class="row"><span>Subtotal</span><span>Rs ${totals.subtotal}</span></div>${totals.discountAmount>0?`<div class="row"><span>Discount</span><span>-Rs ${totals.discountAmount}</span></div>`:''}${totals.serviceCharge>0?`<div class="row"><span>Extra</span><span>+Rs ${totals.serviceCharge}</span></div>`:''}<div class="line"></div><div class="row big"><span>TOTAL</span><span>Rs ${totals.total}</span></div><div class="row"><span>Paid</span><span>Rs ${paid}</span></div><div class="row bold"><span>${due>0?'Due':'Return'}</span><span>Rs ${due>0?due:ret}</span></div><div class="line"></div><div class="center bold">Shukria! Dobara Tashreef Lain!</div></body></html>`
    const w = window.open('', '_blank', 'width=380,height=800')
    if(!w) return alert('Please allow popup!')
    w.document.open(); w.document.write(html); w.document.close()
    setTimeout(()=>{ w.focus(); w.print(); }, 600)
    setTimeout(()=>{ checkout(effectiveTable, 'Cash', totals.total, orderType, customerName, paid, due); setCustomerName(''); setAmountPaid(''); setShowCart(false) }, 1000)
  }

  return (
    <>
    <style>{`
      .pos-container{display:flex; height:100vh; background:#f8fafc; font-family:system-ui; overflow:hidden}
      .pos-left{width:220px; background:#f0fdf4; border-right:1px solid #bbf7d0; display:flex; flex-direction:column; overflow:hidden}
      .pos-center{flex:1; display:flex; flex-direction:column; background:#fff5f6; overflow:hidden}
      .pos-right{width:360px; background:white; border-left:1px solid #ffe4e6; display:flex; flex-direction:column}
      .menu-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:12px}
      .mobile-only{display:none}
      .desktop-only{display:flex}
      @media(max-width:1024px){
        .pos-container{flex-direction:column; height:auto; min-height:100vh; overflow:visible; padding-bottom:100px}
        .pos-left{display:none !important}
        .desktop-only{display:none !important}
        .mobile-only{display:flex !important}
        .pos-center{order:1; min-height:60vh; overflow:visible; flex:none}
        .pos-right{position:fixed; bottom:0; left:0; right:0; width:100%; height:85vh; z-index:999; border-radius:20px 20px 0 0; transform:translateY(105%); transition:transform 0.35s ease; box-shadow:0 -10px 40px rgba(0,0,0,0.25); display:flex; flex-direction:column}
        .pos-right.open{transform:translateY(0)}
        .menu-grid{grid-template-columns:repeat(2,1fr); gap:8px; padding:10px; padding-bottom:20px}
      }
    `}</style>

    <div className="pos-container">
      <div className="pos-left desktop-only" style={{flexDirection:'column'}}>
        <div style={{padding:'14px 12px', background:'linear-gradient(180deg, #14532d 0%, #16a34a 100%)', color:'white'}}>
          <div style={{fontWeight:900, fontSize:'16px'}}>Order Type</div>
          <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
            {[{id:'Dine-In', icon:'🪑', label:'Dine-In'}, {id:'Takeaway', icon:'🚗', label:'Takeaway'}, {id:'Delivery', icon:'🛵', label:'Delivery'}].map(t=>{
              const active = orderType===t.id
              return (
                <div key={t.id} onClick={()=>setOrderType(t.id)} style={{flex:1, background: active ? 'white' : 'rgba(255,255,255,0.18)', color: active ? '#14532d' : 'white', border: active ? '2px solid white' : '1px solid rgba(255,255,255,0.3)', borderRadius:'14px', padding:'12px 2px', textAlign:'center', cursor:'pointer'}}>
                  <div style={{fontSize:'22px'}}>{t.icon}</div><div style={{fontWeight:800, fontSize:'10px', marginTop:'4px'}}>{t.label}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{background:'#dcfce7', borderBottom:'1px solid #86efac', padding:'10px 14px', display:'flex', justifyContent:'space-between'}}>
          <span style={{fontWeight:800, fontSize:'13px', color:'#14532d'}}>Tables - {tableNames.length}</span>
          <span style={{fontSize:'10px', background:'#16a34a', color:'white', padding:'2px 8px', borderRadius:'10px', fontWeight:700}}>LIVE</span>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'10px', background:'#e8f5e9'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
            {tableNames.map(t=>{
              const o = tables[t]; const count = o?.items?.length||0; const isActive = effectiveTable===t; const isOpen = count>0;
              const tTotal = o ? calcTotal(o).total : 0
              return (
                <div key={t} onClick={()=>{setActiveTable(t); setOrderType('Dine-In'); if(tables[t]?.customerName) setCustomerName(tables[t].customerName)}} style={{padding:'12px 8px', borderRadius:'14px', cursor:'pointer', textAlign:'center', background: isOpen ? '#16a34a' : isActive ? '#0f172a' : 'white', color: isOpen || isActive ? 'white' : '#14532d', border: isOpen ? '2px solid #15803d' : isActive ? '2px solid #0f172a' : '1px solid #bbf7d0', fontWeight: isOpen ? '800' : '600', fontSize:'12px', boxShadow: isOpen ? '0 4px 10px rgba(22,163,74,0.3)' : 'none'}}>
                  <div style={{fontSize:'9px'}}>{isOpen ? '🔴 OPEN' : isActive ? '⚫ ACTIVE' : '○ EMPTY'}</div>
                  <div style={{marginTop:'4px', fontSize:'13px', fontWeight:900}}>{t}</div>
                  {count>0 && <div style={{marginTop:'6px', background:'white', color:'#16a34a', borderRadius:'12px', padding:'3px 7px', display:'inline-block', fontSize:'11px', fontWeight:'900'}}>{count} Items • Rs {tTotal}</div>}
                  {o?.customerName && <div style={{marginTop:'4px', fontSize:'10px', opacity:0.9}}>{o.customerName}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pos-center">
        <div className="mobile-only" style={{padding:'10px 12px', background:'white', borderBottom:'1px solid #e2e8f0', alignItems:'center', gap:'8px'}}>
          <div style={{background:'#0f172a', color:'white', padding:'10px 14px', borderRadius:'12px', fontWeight:900, fontSize:'13px'}}>🪑 {effectiveTable}</div>
          <select value={activeTable} onChange={e=>{setActiveTable(e.target.value); setOrderType('Dine-In')}} style={{flex:1, padding:'10px 12px', borderRadius:'12px', border:'1px solid #e2e8f0', fontWeight:700, fontSize:'14px', background:'#f8fafc'}}>
            {tableNames.map(t=><option key={t} value={t}>{t} {tables[t]?.items?.length ? `- ${tables[t].items.length} Items OPEN` : ''}</option>)}
          </select>
          <div style={{background:'#dcfce7', color:'#14532d', padding:'10px 12px', borderRadius:'12px', fontWeight:800, fontSize:'12px', border:'1px solid #bbf7d0'}}>{order.items.length} Items</div>
        </div>
        <div style={{padding:'10px 12px', background:'white', borderBottom:'1px solid #fecdd3', display:'flex', gap:'8px', flexDirection:'column'}}>
          <div style={{flex:1, background:'#fff1f2', borderRadius:'12px', display:'flex', alignItems:'center', padding:'0 12px', border:'1px solid #fecdd3'}}><span>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Zinger, Juice..." style={{flex:1, border:'none', background:'transparent', padding:'11px 8px', fontSize:'13px', outline:'none'}}/></div>
          <div style={{display:'flex', gap:'6px', overflowX:'auto'}}>{categories.map(c=>(<button key={c} onClick={()=>setCat(c)} style={{background:cat===c?'#e11d48':'white', color:cat===c?'white':'#e11d48', border:`1px solid ${cat===c?'#e11d48':'#fecdd3'}`, padding:'6px 14px', borderRadius:'20px', fontWeight:700, fontSize:'11px'}}>{c}</button>))}</div>
        </div>
        <div style={{flex:1, overflowY:'auto'}}><div className="menu-grid">{filtered.map(item=>(<div key={item.id} onClick={()=>{addToTable(effectiveTable, item); setShowCart(true)}} style={{background:'white', borderRadius:'16px', border:'1px solid #ffe4e6', cursor:'pointer', padding:'12px'}}><div style={{fontWeight:700, fontSize:'13px', minHeight:'32px'}}>{item.name}</div><div style={{display:'flex', justifyContent:'space-between', marginTop:'8px'}}><span style={{color:'#e11d48', fontWeight:800}}>Rs {item.price}</span><span style={{background:'#e11d48', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>+</span></div></div>))}</div></div>
      </div>

      <div className={`pos-right ${showCart ? 'open' : ''}`}>
        <div style={{padding:'12px 14px', background:'#0f172a', color:'white', display:'flex', justifyContent:'space-between', borderRadius:'20px 20px 0 0'}}><b>🛒 {effectiveTable} - {order.items.length}</b><button onClick={()=>setShowCart(false)} className="mobile-only" style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:'28px', height:'28px', borderRadius:'50%'}}>✕</button></div>
        <div style={{padding:'10px', background:'#f0fdf4', borderBottom:'1px solid #bbf7d0', display:'flex', flexDirection:'column', gap:'8px'}}>
          <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="👤 Customer Name" style={{padding:'10px', borderRadius:'10px', border:'1.5px solid #86efac', fontSize:'13px', fontWeight:600, outline:'none'}}/>
          <div style={{display:'flex', gap:'6px'}}>
            <input type="number" value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} placeholder="💵 Paid" style={{flex:1, padding:'10px', borderRadius:'10px', border:'1.5px solid #86efac', fontSize:'13px', outline:'none'}}/>
            <div style={{flex:1, background: paid ? (due>0 ? '#fee2e2' : '#dcfce7') : '#fff', color: due>0 ? '#dc2626' : '#16a34a', padding:'10px', borderRadius:'10px', textAlign:'center', fontSize:'12px', fontWeight:900, border:'1px solid #bbf7d0'}}>{paid ? (due>0 ? `Due: Rs ${due}` : `Return: Rs ${ret}`) : `Due: Rs ${totals.total}`}</div>
          </div>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'10px'}}>{order.items.length===0 ? <div style={{textAlign:'center', padding:'30px', color:'#999'}}>🛒 Cart khali hai</div> : order.items.map(i=>(<div key={i.lineId} style={{display:'flex', alignItems:'center', gap:'8px', padding:'8px', background:'#f0fdf4', borderRadius:'10px', marginBottom:'6px', border:'1px solid #bbf7d0'}}><div style={{flex:1}}><div style={{fontSize:'12px', fontWeight:700}}>{i.name}</div><div style={{fontSize:'11px', color:'#16a34a'}}>Rs {i.price} x {i.qty}</div></div><button onClick={()=>updateQty(effectiveTable, i.lineId, -1)} style={{width:'24px', height:'24px', borderRadius:'50%', border:'1px solid #86efac', background:'white'}}>-</button><span style={{fontWeight:800}}>{i.qty}</span><button onClick={()=>updateQty(effectiveTable, i.lineId, 1)} style={{width:'24px', height:'24px', borderRadius:'50%', border:'none', background:'#16a34a', color:'white'}}>+</button><button onClick={()=>removeFromTable(effectiveTable, i.lineId)} style={{background:'#ffebee', border:'none', color:'#d32f2f', width:'22px', height:'22px', borderRadius:'50%'}}>×</button></div>))}</div>
        <div style={{padding:'12px', background:'#f0fdf4', borderTop:'2px solid #bbf7d0'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px'}}>
            <div><label style={{fontSize:'10px', fontWeight:800, color:'#14532d'}}>🏷️ Discount</label><div style={{display:'flex', gap:'4px', marginTop:'3px'}}><input type="number" value={order.discount || ''} onChange={e=>setTableDiscount(effectiveTable, Number(e.target.value)||0, order.discountType||'Rs')} placeholder="0" style={{flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #86efac'}}/><select value={order.discountType||'Rs'} onChange={e=>setTableDiscount(effectiveTable, order.discount||0, e.target.value)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #86efac'}}><option>Rs</option><option>%</option></select></div></div>
            <div><label style={{fontSize:'10px', fontWeight:800, color:'#14532d'}}>➕ Extra</label><input type="number" value={order.serviceCharge || ''} onChange={e=>setTableServiceCharge(effectiveTable, Number(e.target.value)||0)} placeholder="0" style={{width:'100%', marginTop:'3px', padding:'8px', borderRadius:'8px', border:'1px solid #86efac'}}/></div>
          </div>
          <div style={{background:'white', borderRadius:'12px', padding:'10px', border:'1px solid #bbf7d0'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px'}}><span>Subtotal</span><span>Rs {totals.subtotal}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginTop:'4px'}}><span>Paid</span><span>Rs {paid}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:800, color: due>0 ? '#dc2626' : '#16a34a'}}><span>{due>0?'Due':'Return'}</span><span>Rs {due>0?due:ret}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:'18px', background:'#14532d', color:'white', padding:'10px 12px', borderRadius:'10px', marginTop:'6px'}}><span>TOTAL</span><span>Rs {totals.total}</span></div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'10px'}}>
            <button onClick={printKOT} style={{padding:'12px', borderRadius:'10px', border:'1.5px solid #f59e0b', background:'white', color:'#f59e0b', fontWeight:800}}>🍳 KOT PRINT</button>
            <button onClick={()=>{setShowCart(false)}} style={{padding:'12px', borderRadius:'10px', border:'1.5px solid #16a34a', background:'white', color:'#16a34a', fontWeight:800}}>🟠 KEEP OPEN</button>
          </div>
          <button onClick={handleCheckoutAndPrint} style={{width:'100%', marginTop:'8px', padding:'14px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#16a34a,#14532d)', color:'white', fontWeight:900, fontSize:'15px'}}>🖨️ CHECKOUT & PRINT - Rs {totals.total}</button>
        </div>
      </div>
    </div>

    <div className="mobile-only" style={{position:'fixed', bottom:'16px', left:'12px', right:'12px', zIndex:998}}>
      {!showCart && (<button onClick={()=>setShowCart(true)} style={{width:'100%', background:'#14532d', color:'white', border:'none', padding:'16px 18px', borderRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35)', fontWeight:800, fontSize:'14px'}}><span>🪑 {effectiveTable} • {order.items.length} Items</span><span style={{background:'#16a34a', padding:'8px 14px', borderRadius:'20px'}}>Rs {totals.total} →</span></button>)}
    </div>
    </>
  )
}