import React, { useMemo } from 'react'
import { useStore } from '../store/Store.jsx'

export default function Kitchen() {
  const { tables, kitchenOrders, updateKitchenStatus, tableNames, calcTotal } = useStore()

  const runningOrders = useMemo(() => {
    const list = []
    // Tables se
    tableNames.forEach(t=>{
      const o = tables[t]
      if(o?.items?.length>0) list.push({ id: t, table: t, type: 'Dine-In', items: o.items, time: o.createdAt || new Date().toISOString(), status: o.kitchenStatus || 'Pending' })
    })
    // Takeaway / Delivery
    ;['Takeaway','Delivery'].forEach(t=>{
      const o = tables[t]
      if(o?.items?.length>0) list.push({ id: t, table: t, type: t, items: o.items, time: o.createdAt || new Date().toISOString(), status: o.kitchenStatus || 'Pending' })
    })
    // Kitchen Queue se bhi
    if(kitchenOrders?.length) {
      kitchenOrders.forEach(k=>{ if(!list.find(x=>x.table===k.table)) list.push(k) })
    }
    return list.sort((a,b)=> new Date(a.time) - new Date(b.time))
  }, [tables, tableNames, kitchenOrders])

  const getStatusColor = (s) => {
    if(s==='Preparing') return 'linear-gradient(135deg,#ff6f00,#ff8f00)'
    if(s==='Ready') return 'linear-gradient(135deg,#2e7d32,#43a047)'
    return 'linear-gradient(135deg,#1976d2,#42a5f5)'
  }

  return (
    <div style={{padding:'16px', background:'linear-gradient(135deg,#0f172a 0%, #1e293b 100%)', minHeight:'100vh', fontFamily:'Segoe UI'}}>
      <div style={{background:'white', padding:'14px 20px', borderRadius:'16px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
        <div style={{width:'48px', height:'48px', background:'linear-gradient(135deg,#ff6f00,#ff8f00)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', color:'white'}}>🍳</div>
        <div><div style={{fontWeight:'900', fontSize:'18px', color:'#0f172a'}}>KITCHEN DISPLAY - KDS</div><div style={{fontSize:'12px', color:'#64748b'}}>{runningOrders.length} Orders Running • Live Kitchen</div></div>
        <div style={{marginLeft:'auto', display:'flex', gap:'8px'}}>
          <div style={{background:'#e3f2fd', color:'#1976d2', padding:'8px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'800'}}>Pending: {runningOrders.filter(o=>o.status==='Pending').length}</div>
          <div style={{background:'#fff3e0', color:'#e65100', padding:'8px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'800'}}>Preparing: {runningOrders.filter(o=>o.status==='Preparing').length}</div>
          <div style={{background:'#e8f5e9', color:'#2e7d32', padding:'8px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'800'}}>Ready: {runningOrders.filter(o=>o.status==='Ready').length}</div>
        </div>
      </div>

      {runningOrders.length===0 ? (
        <div style={{background:'white', borderRadius:'20px', padding:'80px', textAlign:'center'}}><div style={{fontSize:'64px'}}>🍽️</div><div style={{fontWeight:'800', fontSize:'18px', marginTop:'12px', color:'#0f172a'}}>No Orders - Kitchen Free</div><div style={{fontSize:'13px', color:'#64748b'}}>POS se order ayega to yahan show hoga</div></div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px'}}>
          {runningOrders.map((order, idx)=>{
            const mins = Math.floor((new Date() - new Date(order.time))/60000)
            return (
              <div key={order.id+idx} style={{background:'white', borderRadius:'20px', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.2)', borderLeft:`6px solid ${order.status==='Ready'?'#2e7d32': order.status==='Preparing'?'#ff6f00':'#1976d2'}`}}>
                <div style={{padding:'14px', background: getStatusColor(order.status), color:'white', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div><div style={{fontWeight:'900', fontSize:'16px'}}>{order.type==='Takeaway'?'🚗': order.type==='Delivery'?'🛵':'🪑'} {order.table}</div><div style={{fontSize:'11px', opacity:0.9}}>{order.type} • {mins} min ago</div></div>
                  <div style={{background:'white', color:'#0f172a', padding:'6px 12px', borderRadius:'20px', fontWeight:'900', fontSize:'12px'}}>{order.status}</div>
                </div>
                <div style={{padding:'12px', maxHeight:'240px', overflowY:'auto'}}>
                  {order.items.map((it,i)=>(
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px dashed #eee'}}>
                      <span style={{fontWeight:'700', fontSize:'13px'}}>{it.qty} x {it.name}</span><span style={{background:'#f1f5f9', padding:'2px 8px', borderRadius:'10px', fontSize:'12px', fontWeight:'800'}}>{it.qty}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', background:'#f8fafc'}}>
                  {order.status==='Pending' && <button onClick={()=>updateKitchenStatus(order.table, 'Preparing')} style={{padding:'12px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#ff6f00,#ff8f00)', color:'white', fontWeight:'800', fontSize:'12px', cursor:'pointer'}}>🔥 START COOKING</button>}
                  {order.status==='Preparing' && <button onClick={()=>updateKitchenStatus(order.table, 'Ready')} style={{padding:'12px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#2e7d32,#43a047)', color:'white', fontWeight:'800', fontSize:'12px', cursor:'pointer'}}>✅ READY / SERVE</button>}
                  {order.status!=='Pending' && <button onClick={()=>updateKitchenStatus(order.table, 'Pending')} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd', background:'white', fontWeight:'700', fontSize:'12px', cursor:'pointer'}}>↩️ Pending</button>}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', color:'#0f172a'}}>Total Items: {order.items.reduce((a,b)=>a+b.qty,0)}</div>
                </div>
                {mins>15 && order.status!=='Ready' && <div style={{background:'#ffebee', color:'#d32f2f', textAlign:'center', padding:'6px', fontSize:'11px', fontWeight:'800'}}>⚠️ {mins} min - Late Order!</div>}
              </div>
            )
          })}
        </div>
      )}
      <div style={{textAlign:'center', color:'rgba(255,255,255,0.5)', marginTop:'16px', fontSize:'11px'}}>🍳 Kitchen Printer alag - KOT button se print jayega - 7 Star KDS Dashboard</div>
    </div>
  )
}