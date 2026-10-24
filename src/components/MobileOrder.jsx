import React, { useState, useEffect } from 'react'
import { useStore } from '../store/Store'

const DB_URL = "https://mrfast-786-default-rtdb.firebaseio.com/orders.json";
const DB_DEL = (k) => `https://mrfast-786-default-rtdb.firebaseio.com/orders/${k}.json`;

export default function MobileOrder(){
  const { menu, addOnlineSale, printBill } = useStore()
  const [liveOrders, setLiveOrders] = useState([])

  useEffect(()=>{
    const fetchOrders = async ()=>{
      try{
        const res = await fetch(DB_URL);
        const data = await res.json();
        if(data){
          const list = Object.keys(data).map(key=> ({...data[key], fbKey:key}));
          setLiveOrders(list.reverse());
        } else {
          setLiveOrders([])
        }
      }catch(e){
        console.log("Fetch error", e)
      }
    }
    fetchOrders();
    const id = setInterval(fetchOrders, 3000);
    return ()=> clearInterval(id);
  },[])

  const acceptLiveOrder = async (o) => {
    const sale = addOnlineSale(o);
    printBill(sale);
    await fetch(DB_DEL(o.fbKey), {method:'DELETE'});
    setLiveOrders(prev=>prev.filter(x=>x.fbKey!==o.fbKey));
    alert(`✅ Bill ${sale.billNo} Saved! Rs ${sale.total}`);
  }

  const rejectOrder = async (o) => {
    await fetch(DB_DEL(o.fbKey), {method:'DELETE'});
    setLiveOrders(prev=>prev.filter(x=>x.fbKey!==o.fbKey));
  }

  return (
    <>
    <style>{`
      .live-wrap{padding:16px; background:#fff5f6; min-height:100vh; font-family:system-ui}
      .live-header{background:linear-gradient(135deg,#d70f64,#ff2b85); color:white; padding:16px; border-radius:16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center}
      .order-grid{display:grid; grid-template-columns:1fr 1fr; gap:12px}
      .menu-grid{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px}
      @media(max-width:768px){
        .live-wrap{padding:10px; padding-bottom:20px}
        .live-header{flex-direction:column; gap:10px; align-items:stretch; padding:14px; border-radius:14px}
        .live-header h2{font-size:18px !important; text-align:center}
        .order-grid{grid-template-columns:1fr; gap:10px}
        .menu-grid{grid-template-columns:1fr 1fr; gap:8px}
      }
    `}</style>

    <div className="live-wrap">
      {/* Header - Foodpanda Style */}
      <div className="live-header">
        <h2 style={{margin:0, fontSize:'20px', fontWeight:800}}>🍔 Mr Fast Food - Live</h2>
        <div style={{background:'white', color:'#d70f64', padding:'8px 14px', borderRadius:'20px', fontWeight:'bold', textAlign:'center', fontSize:'14px'}}>
          🔔 {liveOrders.length} Live Orders
        </div>
      </div>

      {liveOrders.length > 0 ? (
        <div className="order-grid">
          {liveOrders.map((o)=>(
            <div key={o.fbKey} style={{borderLeft:'5px solid #d70f64', padding:'14px', borderRadius:'16px', background:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px'}}>
                <b style={{fontSize:'14px', flex:1}}>🪑 {o.customerName || 'Walk-in'} - {o.tableNo || 'T1'}</b>
                <span style={{fontSize:'11px', background:'#fff0f3', color:'#d70f64', padding:'4px 8px', borderRadius:'20px', whiteSpace:'nowrap'}}>{new Date(o.time).toLocaleTimeString()}</span>
              </div>
              <div style={{fontSize:'12px', margin:'10px 0', background:'#fff5f6', padding:'10px', borderRadius:'10px', lineHeight:'1.5'}}>
                {o.items?.map(i=>`${i.name} x${i.qty || 1}`).join(', ')}
              </div>
              <b style={{color:'#d70f64', fontSize:'20px', display:'block', marginBottom:'10px'}}>Rs {o.total}</b>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={()=>acceptLiveOrder(o)} style={{flex:1, background:'linear-gradient(135deg,#d70f64,#ff2b85)', color:'white', border:'none', padding:'14px', borderRadius:'12px', cursor:'pointer', fontWeight:'900', fontSize:'14px', boxShadow:'0 4px 12px rgba(215,15,100,0.3)'}}>✅ Accept & Print</button>
                <button onClick={()=>rejectOrder(o)} style={{background:'#fee2e2', border:'none', padding:'14px 16px', borderRadius:'12px', cursor:'pointer', fontWeight:700}}>❌</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign:'center', padding:'50px 20px', background:'white', borderRadius:'16px', color:'#999', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:'40px'}}>📭</div>
          <h3 style={{margin:'10px 0 5px', fontSize:'16px', color:'#333'}}>Koi Live Order Nahi</h3>
          <p style={{margin:0, fontSize:'12px'}}>Customer jab QR scan karke order karega to yahan ayega</p>
        </div>
      )}

      <div style={{marginTop:'20px', background:'white', padding:'14px', borderRadius:'16px', boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
        <h4 style={{margin:'0 0 12px', fontSize:'14px'}}>📦 Menu Stock ({menu?.length})</h4>
        <div className="menu-grid">
          {menu?.slice(0,9).map(m=>(
            <div key={m.id} style={{background:'#fff5f6', padding:'10px', borderRadius:'10px', border:'1px solid #ffd1dc', fontSize:'12px'}}>
              <b style={{fontSize:'12px', display:'block', marginBottom:'4px'}}>{m.name}</b>
              <span style={{color:'#d70f64', fontWeight:700}}>Rs {m.price}</span> <span style={{fontSize:'10px', color:'#666'}}> | {m.stock||0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}