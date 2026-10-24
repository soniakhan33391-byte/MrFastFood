import React, { useState, useMemo } from 'react'
import { useStore } from '../store/Store.jsx'

export default function POS() {
  const { menu, tables, activeTable, setActiveTable, addToTable, tableOrder, calcTotal, checkout, removeFromTable, updateQty, tableNames, setTableDiscount, setTableServiceCharge, addToKitchen, settings } = useStore()
  const [search, setSearch] = useState('')
  const [orderType, setOrderType] = useState('Dine-In')
  const [cat, setCat] = useState('All')
  const [showCart, setShowCart] = useState(false)

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

  const printKOT = () => {
    if(order.items.length===0) return alert('Empty order!')
    if(addToKitchen) addToKitchen(effectiveTable, order, orderType)
    const w = window.open('', '_blank', 'width=380,height=700')
    const time = new Date().toLocaleString()
    const kotNo = `KOT-${Date.now().toString().slice(-5)}`
    w.document.write(`<html><head><title>KOT</title><style>body{font-family:monospace; width:320px; margin:0 auto; padding:12px} .header{text-align:center; border-bottom:3px double #000; padding-bottom:10px} .kot{background:#000; color:#fff; padding:8px 16px; font-weight:900; font-size:18px; border-radius:6px; display:inline-block; margin:8px 0} .big{font-size:22px; font-weight:900} .row{padding:6px 0; border-bottom:1px dashed #ccc; display:flex; justify-content:space-between; font-size:14px; font-weight:700}</style></head><body><div class="header"><div>KITCHEN ORDER TICKET</div><div class="kot">${kotNo}</div><div class="big">${orderType} - ${effectiveTable}</div><div>⏰ ${time}</div></div><div style="margin:12px 0">${order.items.map((it,i)=>`<div class="row"><span>${i+1}. ${it.qty} x ${it.name}</span><span>${it.qty}</span></div>`).join('')}</div><div style="text-align:center; margin-top:16px; border-top:2px solid #000; padding-top:10px; font-weight:900">TOTAL ITEMS: ${order.items.reduce((a,b)=>a+b.qty,0)}<br/>KITCHEN COPY</div><script>window.print(); setTimeout(()=>window.close(),500)</script></body></html>`)
    w.document.close()
  }

  const handleCheckoutAndPrint = () => {
    if(order.items.length===0) return alert('Empty order!')
    const w = window.open('', '_blank', 'width=380,height=800')
    const time = new Date().toLocaleString()
    const billNo = `MFF-${Date.now().toString().slice(-6)}`
    w.document.write(`<html><head><title>BILL</title><style>body{font-family:monospace; width:300px; margin:0 auto; padding:10px; font-size:12px} .center{text-align:center} .line{border-top:1px dashed #000; margin:8px 0} .bold{font-weight:900} .row{display:flex; justify-content:space-between; padding:2px 0} .big{font-size:18px; font-weight:900}</style></head><body><div class="center"><div style="font-size:20px; font-weight:900">${settings?.shopName || 'Mr Fast Food'}</div><div>Bill No: ${billNo}</div><div>${orderType} - ${effectiveTable}</div><div>${time}</div></div><div class="line"></div>${order.items.map(it=>`<div class="row"><span>${it.qty} x ${it.name}</span><span>Rs ${it.qty*it.price}</span></div>`).join('')}<div class="line"></div><div class="row"><span>Subtotal</span><span>Rs ${totals.subtotal}</span></div>${totals.discountAmount>0?`<div class="row"><span>Discount</span><span>-Rs ${totals.discountAmount}</span></div>`:''}${totals.serviceCharge>0?`<div class="row"><span>Extra</span><span>+Rs ${totals.serviceCharge}</span></div>`:''}<div class="line"></div><div class="row big"><span>TOTAL</span><span>Rs ${totals.total}</span></div><div class="line"></div><div class="center bold">Shukria! Dobara Tashreef Lain!</div><script>window.print(); setTimeout(()=>window.close(),800)</script></body></html>`)
    w.document.close()
    setTimeout(()=>{ checkout(effectiveTable, 'Cash', totals.total, orderType); setShowCart(false) }, 500)
  }

  return (
    <>
    <style>{`
      .pos-container{display:flex; height:100vh; background:#f8fafc; font-family:system-ui; overflow:hidden}
      .pos-left{width:210px; background:#ffffff; border-right:1px solid #e2e8f0; display:flex; flex-direction:column; overflow:hidden}
      .pos-center{flex:1; display:flex; flex-direction:column; background:#fff5f6; overflow:hidden}
      .pos-right{width:360px; background:white; border-left:1px solid #ffe4e6; display:flex; flex-direction:column}
      .menu-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:12px}
      
      .mobile-only{display:none}
      .desktop-only{display:flex}

      @media(max-width:1024px){
        .pos-container{flex-direction:column; height:auto; min-height:100vh; padding-bottom:90px}
        .pos-left{display:none !important}
        .desktop-only{display:none !important}
        .mobile-only{display:flex !important}
        .pos-center{order:1}
        .pos-right{position:fixed; bottom:0; left:0; right:0; width:100%; height:82vh; z-index:40; border-radius:20px 20px 0 0; transform:translateY(100%); transition:transform 0.35s ease; box-shadow:0 -10px 40px rgba(0,0,0,0.2)}
        .pos-right.open{transform:translateY(0)}
        .menu-grid{grid-template-columns:repeat(2,1fr); gap:8px; padding:10px}
      }
    `}</style>

    <div className="pos-container">
      {/* LEFT - DESKTOP ONLY - Aapka Color Fixed Wala */}
      <div className="pos-left desktop-only" style={{flexDirection:'column'}}>
        <div style={{padding:'14px 12px', background:'linear-gradient(180deg, #7f1d1d 0%, #dc2626 50%, #e11d48 100%)', color:'white'}}>
          <div style={{fontWeight:900, fontSize:'16px'}}>Order Type</div>
          <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
            {[{id:'Dine-In', icon:'🪑', label:'Dine-In'}, {id:'Takeaway', icon:'🚗', label:'Takeaway'}, {id:'Delivery', icon:'🛵', label:'Delivery'}].map(t=>{
              const active = orderType===t.id
              return (
                <div key={t.id} onClick={()=>setOrderType(t.id)} style={{flex:1, background: active ? 'white' : 'rgba(255,255,255,0.15)', color: active ? '#7f1d1d' : 'white', border: active ? '2px solid white' : '1px solid rgba(255,255,255,0.3)', borderRadius:'14px', padding:'12px 2px', textAlign:'center', cursor:'pointer'}}>
                  <div style={{fontSize:'22px'}}>{t.icon}</div><div style={{fontWeight:800, fontSize:'10px', marginTop:'4px'}}>{t.label}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{background:'#fff1f2', borderBottom:'1px solid #fecdd3', padding:'10px 14px', display:'flex', justifyContent:'space-between'}}>
          <span style={{fontWeight:800, fontSize:'13px', color:'#881337'}}>Tables - {tableNames.length}</span>
          <span style={{fontSize:'10px', background:'#e11d48', color:'white', padding:'2px 8px', borderRadius:'10px', fontWeight:700}}>LIVE</span>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'10px', background:'#f8fafc'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
            {tableNames.map(t=>{
              const o = tables[t]; const count = o?.items?.length||0; const isActive = effectiveTable===t; const isOpen = count>0;
              return (
                <div key={t} onClick={()=>{setActiveTable(t); setOrderType('Dine-In')}} style={{padding:'14px 8px', borderRadius:'12px', cursor:'pointer', textAlign:'center', background: isOpen ? '#e11d48' : isActive ? '#0f172a' : 'white', color: isOpen || isActive ? 'white' : '#475569', border: isOpen ? '2px solid #be123c' : isActive ? '2px solid #0f172a' : '1px solid #e2e8f0', fontWeight: isOpen ? '800' : '600', fontSize:'12px'}}>
                  <div style={{fontSize:'9px', opacity: isActive||isOpen ? 0.9 : 0.6}}>{isOpen ? '🔴 OPEN' : isActive ? '⚫ ACTIVE' : '○ EMPTY'}</div>
                  <div style={{marginTop:'4px', fontSize:'13px'}}>{t}</div>
                  {count>0 && <div style={{marginTop:'4px', background:'white', color:'#e11d48', borderRadius:'12px', padding:'2px 6px', display:'inline-block', fontSize:'11px', fontWeight:'900'}}>{count} Items</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="pos-center">
        {/* MOBILE TOP - SIRF TABLE NO + ORDER - AAPKI DEMAND */}
        <div className="mobile-only" style={{padding:'10px 12px', background:'white', borderBottom:'1px solid #e2e8f0', alignItems:'center', gap:'8px'}}>
          <div style={{background:'#0f172a', color:'white', padding:'10px 14px', borderRadius:'12px', fontWeight:900, fontSize:'13px', flexShrink:0}}>🪑 {effectiveTable}</div>
          <select value={activeTable} onChange={e=>{setActiveTable(e.target.value); setOrderType('Dine-In')}} style={{flex:1, padding:'10px 12px', borderRadius:'12px', border:'1px solid #e2e8f0', fontWeight:700, fontSize:'14px', background:'#f8fafc'}}>
            {tableNames.map(t=><option key={t} value={t}>{t} {tables[t]?.items?.length ? `- ${tables[t].items.length} Items OPEN` : ''}</option>)}
          </select>
          <div style={{background:'#fff1f2', color:'#e11d48', padding:'10px 12px', borderRadius:'12px', fontWeight:800, fontSize:'12px', border:'1px solid #fecdd3', flexShrink:0}}>
            {order.items.length} Items
          </div>
        </div>

        <div style={{padding:'10px 12px', background:'white', borderBottom:'1px solid #fecdd3', display:'flex', gap:'8px', flexDirection:'column'}}>
          <div style={{display:'flex', gap:'8px'}}>
            <div style={{flex:1, background:'#fff1f2', borderRadius:'12px', display:'flex', alignItems:'center', padding:'0 12px', border:'1px solid #fecdd3'}}><span>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Zinger, Juice..." style={{flex:1, border:'none', background:'transparent', padding:'11px 8px', fontSize:'13px', outline:'none'}}/></div>
          </div>
          <div style={{display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'2px'}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{background:cat===c?'#e11d48':'white', color:cat===c?'white':'#e11d48', border:`1px solid ${cat===c?'#e11d48':'#fecdd3'}`, padding:'6px 14px', borderRadius:'20px', fontWeight:700, fontSize:'11px', whiteSpace:'nowrap'}}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1, overflowY:'auto'}}>
          <div className="menu-grid">
            {filtered.map(item=>(
              <div key={item.id} onClick={()=>{addToTable(effectiveTable, item); setShowCart(false)}} style={{background:'white', borderRadius:'16px', border:'1px solid #ffe4e6', cursor:'pointer', padding:'12px'}}>
                <div style={{fontWeight:700, fontSize:'13px', minHeight:'32px'}}>{item.name}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
                  <span style={{color:'#e11d48', fontWeight:800, fontSize:'14px'}}>Rs {item.price}</span>
                  <span style={{background:'#e11d48', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT CART */}
      <div className={`pos-right ${showCart ? 'open' : ''}`}>
        <div style={{padding:'12px 14px', background:'#0f172a', color:'white', display:'flex', justifyContent:'space-between', borderRadius:'20px 20px 0 0'}}>
          <b style={{fontSize:'14px'}}>🛒 {effectiveTable} - {order.items.length}</b>
          <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <span style={{fontSize:'11px', background:'#e11d48', padding:'3px 8px', borderRadius:'10px'}}>{orderType}</span>
            <button onClick={()=>setShowCart(false)} className="mobile-only" style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:'28px', height:'28px', borderRadius:'50%'}}>✕</button>
          </div>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'10px'}}>
          {order.items.length===0 ? <div style={{textAlign:'center', padding:'30px', color:'#999'}}>🛒 Cart khali hai</div> :
            order.items.map(i=>(
              <div key={i.lineId} style={{display:'flex', alignItems:'center', gap:'8px', padding:'8px', background:'#fff1f2', borderRadius:'10px', marginBottom:'6px'}}>
                <div style={{flex:1}}><div style={{fontSize:'12px', fontWeight:700}}>{i.name}</div><div style={{fontSize:'11px', color:'#e11d48'}}>Rs {i.price} x {i.qty}</div></div>
                <button onClick={()=>updateQty(effectiveTable, i.lineId, -1)} style={{width:'24px', height:'24px', borderRadius:'50%', border:'1px solid #fecdd3', background:'white', color:'#e11d48'}}>-</button>
                <span style={{fontWeight:800, fontSize:'12px'}}>{i.qty}</span>
                <button onClick={()=>updateQty(effectiveTable, i.lineId, 1)} style={{width:'24px', height:'24px', borderRadius:'50%', border:'none', background:'#e11d48', color:'white'}}>+</button>
                <button onClick={()=>removeFromTable(effectiveTable, i.lineId)} style={{background:'#ffebee', border:'none', color:'#d32f2f', width:'22px', height:'22px', borderRadius:'50%'}}>×</button>
              </div>
            ))}
        </div>
        <div style={{padding:'12px', background:'#fffafa', borderTop:'2px solid #fecdd3'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px'}}>
            <div><label style={{fontSize:'10px', fontWeight:800, color:'#e11d48'}}>🏷️ Discount</label><div style={{display:'flex', gap:'4px', marginTop:'3px'}}><input type="number" value={order.discount || ''} onChange={e=>setTableDiscount(effectiveTable, Number(e.target.value)||0, order.discountType||'Rs')} placeholder="0" style={{flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #fecdd3', fontSize:'12px'}}/><select value={order.discountType||'Rs'} onChange={e=>setTableDiscount(effectiveTable, order.discount||0, e.target.value)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #fecdd3', fontSize:'11px'}}><option>Rs</option><option>%</option></select></div></div>
            <div><label style={{fontSize:'10px', fontWeight:800, color:'#e11d48'}}>➕ Extra</label><input type="number" value={order.serviceCharge || ''} onChange={e=>setTableServiceCharge(effectiveTable, Number(e.target.value)||0)} placeholder="0" style={{width:'100%', marginTop:'3px', padding:'8px', borderRadius:'8px', border:'1px solid #fecdd3'}}/></div>
          </div>
          <div style={{background:'white', borderRadius:'12px', padding:'10px', border:'1px solid #fecdd3'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px'}}><span>Subtotal</span><span>Rs {totals.subtotal}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:'18px', background:'#0f172a', color:'white', padding:'10px 12px', borderRadius:'10px', marginTop:'6px'}}><span>TOTAL</span><span>Rs {totals.total}</span></div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'10px'}}>
            <button onClick={printKOT} style={{padding:'10px', borderRadius:'10px', border:'1.5px solid #f59e0b', background:'white', color:'#f59e0b', fontWeight:800, fontSize:'11px'}}>🍳 KOT</button>
            <button onClick={()=>alert(`${effectiveTable} OPEN`)} style={{padding:'10px', borderRadius:'10px', border:'1.5px solid #e11d48', background:'white', color:'#e11d48', fontWeight:800, fontSize:'11px'}}>🟠 KEEP OPEN</button>
          </div>
          <button onClick={handleCheckoutAndPrint} style={{width:'100%', marginTop:'8px', padding:'14px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#e11d48,#be123c)', color:'white', fontWeight:900, fontSize:'14px'}}>🖨️ CHECKOUT - Rs {totals.total}</button>
        </div>
      </div>
    </div>

    {/* MOBILE FLOATING BUTTON - SIRF TABLE NO + TOTAL */}
    <div className="mobile-only" style={{position:'fixed', bottom:'16px', left:'12px', right:'12px', zIndex:30}}>
      {showCart ? null : (
        <button onClick={()=>setShowCart(true)} style={{width:'100%', background:'#0f172a', color:'white', border:'none', padding:'14px 18px', borderRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', fontWeight:800}}>
          <span>🪑 {effectiveTable} • {order.items.length} Items</span>
          <span style={{background:'#e11d48', padding:'6px 12px', borderRadius:'20px'}}>Rs {totals.total} →</span>
        </button>
      )}
    </div>
    </>
  )
}