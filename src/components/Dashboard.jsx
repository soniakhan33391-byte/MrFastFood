import React, { useMemo, useState } from 'react'
import { useStore } from '../store/Store.jsx'

export default function Dashboard() {
  const { sales, expenses } = useStore()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [customDate, setCustomDate] = useState('2026-10-22')

  // DATE FILTER - Sab kuch is se change hoga
  const filteredSales = useMemo(() => {
    let list = sales
    if (dateFilter === 'today') list = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    else if (dateFilter === 'yesterday') { const y=new Date(); y.setDate(y.getDate()-1); list = sales.filter(s => new Date(s.date).toDateString() === y.toDateString()) }
    else if (dateFilter === 'custom') list = sales.filter(s => new Date(s.date).toISOString().split('T')[0] === customDate)
    // All = all sales
    
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(s => {
      const idx = sales.findIndex(x => x.id === s.id) + 1
      const billNo = `MFF-${String(idx).padStart(4,'0')}`.toLowerCase()
      return billNo.includes(q) || (s.table||'').toLowerCase().includes(q) || (s.orderType||'').toLowerCase().includes(q)
    })
  }, [sales, dateFilter, customDate, search])

  // STATS - Jo date select karo usi ka price ayega
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const y = new Date(); y.setDate(now.getDate()-1); const yestStr = y.toDateString()
    const week = new Date(); week.setDate(now.getDate()-7)
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
    const year = new Date(now.getFullYear(), 0, 1)

    let today=0, yest=0, weekTotal=0, monthTotal=0, yearTotal=0, grandTotal=0
    sales.forEach(s=>{ const d=new Date(s.date); const a=Number(s.total||0); grandTotal+=a; if(d.toDateString()===todayStr) today+=a; if(d.toDateString()===yestStr) yest+=a; if(d>=week) weekTotal+=a; if(d>=month) monthTotal+=a; if(d>=year) yearTotal+=a })

    // FILTERED - Jo date select ki uska
    let fTotal=0, fDine=0, fTake=0, fDeli=0
    filteredSales.forEach(s=>{ const a=Number(s.total||0); fTotal+=a; if(s.orderType==='Takeaway') fTake+=a; else if(s.orderType==='Delivery') fDeli+=a; else fDine+=a })

    const expToday = expenses.filter(e=>new Date(e.date).toDateString()===todayStr).reduce((a,b)=>a+Number(b.amount||0),0)

    return { today, yest, weekTotal, monthTotal, yearTotal, grandTotal, fTotal, fDine, fTake, fDeli, expToday, profit: today-expToday, count: sales.length, fCount: filteredSales.length }
  }, [sales, expenses, filteredSales])

  const reprint = (sale, billNo, type) => {
    const isKOT = type==='KOT'
    const w = window.open('', '_blank', 'width=380,height=700')
    w.document.write(`<html><head><title>${billNo}</title><style>body{font-family:monospace;padding:12px;width:320px;margin:0 auto}.header{text-align:center;border-bottom:3px double #000;padding-bottom:8px}.row{display:flex;justify-content:space-between;padding:3px 0;font-size:13px}.dashed{border-top:1px dashed #000;margin:8px 0}.bold{font-weight:700}.billno{background:#000;color:#fff;padding:6px 12px;border-radius:6px;display:inline-block;margin:6px 0;font-weight:900}</style></head><body><div class="header"><div style="font-size:28px">${sale.orderType==='Takeaway'?'🚗':sale.orderType==='Delivery'?'🛵':'🪑'}</div><div style="font-size:18px;font-weight:900">Mr Fast Food</div><div class="billno">${billNo}</div><div style="margin-top:6px"><b>${sale.orderType} - ${sale.table}</b></div><div style="font-size:11px">${new Date(sale.date).toLocaleString()}</div><div>${isKOT?'KITCHEN KOT':'BILL'}</div></div><div class="dashed"></div>${sale.items.map(i=>`<div class="row"><span>${i.qty}x ${i.name}</span><span>Rs ${i.qty*i.price}</span></div>`).join('')}<div class="dashed"></div><div class="row bold"><span>TOTAL</span><span>Rs ${sale.total}</span></div><script>window.print();setTimeout(()=>window.close(),500)</script></body></html>`)
    w.document.close()
  }

  const getLabel = () => {
    if(dateFilter==='today') return 'Today'
    if(dateFilter==='yesterday') return 'Yesterday'
    if(dateFilter==='custom') return customDate
    return 'All Time'
  }

  return (
    <div style={{padding:'16px', background:'linear-gradient(135deg,#f5f7fa 0%,#e4e8ec 100%)', minHeight:'100vh', fontFamily:'Inter, Segoe UI'}}>
      
      {/* TOP FILTER - 7 STAR */}
      <div style={{background:'white', padding:'12px 18px', borderRadius:'16px', display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)'}}>
        <div style={{width:'36px', height:'36px', background:'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'16px'}}>📊</div>
        <div><div style={{fontWeight:'800', fontSize:'14px', color:'#0f172a'}}>Dashboard</div><div style={{fontSize:'11px', color:'#64748b'}}>{getLabel()} • {stats.fCount} Bills</div></div>
        <div style={{display:'flex', gap:'8px', marginLeft:'24px'}}>
          <button onClick={()=>setDateFilter('today')} style={{padding:'8px 16px', borderRadius:'24px', border:'none', background:dateFilter==='today'?'#0f172a':'#f1f5f9', color:dateFilter==='today'?'white':'#475569', fontWeight:'700', fontSize:'12px', cursor:'pointer', boxShadow: dateFilter==='today'?'0 4px 12px rgba(0,0,0,0.15)':''}}>Today</button>
          <button onClick={()=>setDateFilter('yesterday')} style={{padding:'8px 16px', borderRadius:'24px', border:'none', background:dateFilter==='yesterday'?'#0f172a':'#f1f5f9', color:dateFilter==='yesterday'?'white':'#475569', fontWeight:'700', fontSize:'12px', cursor:'pointer'}}>Yesterday</button>
          <button onClick={()=>setDateFilter('all')} style={{padding:'8px 16px', borderRadius:'24px', border:'none', background:dateFilter==='all'?'#0f172a':'#f1f5f9', color:dateFilter==='all'?'white':'#475569', fontWeight:'700', fontSize:'12px', cursor:'pointer'}}>All Time</button>
          <input type="date" value={customDate} onChange={e=>{setCustomDate(e.target.value); setDateFilter('custom')}} style={{padding:'7px 12px', borderRadius:'24px', border:'1px solid #e2e8f0', fontSize:'12px', background:'#f8fafc'}}/>
        </div>
        <div style={{marginLeft:'auto', background:'linear-gradient(135deg,#0f172a,#334155)', color:'white', padding:'10px 18px', borderRadius:'24px', fontSize:'13px', fontWeight:'800', boxShadow:'0 4px 12px rgba(0,0,0,0.15)'}}>Rs {stats.fTotal.toLocaleString()} • {stats.fCount} Bills</div>
      </div>

      {/* 7 STAR CARDS - Selected Date ka Total Change Hoga */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'14px'}}>
        <div style={{background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', borderRadius:'20px', padding:'18px', color:'white', position:'relative', overflow:'hidden', boxShadow:'0 10px 30px rgba(15,23,42,0.2)'}}>
          <div style={{position:'absolute', right:'-10px', top:'-10px', fontSize:'80px', opacity:0.08}}>💰</div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><div style={{width:'44px', height:'44px', background:'rgba(255,255,255,0.15)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>💰</div><div style={{fontSize:'11px', opacity:0.7, letterSpacing:'1px', fontWeight:'600'}}>TOTAL SALES</div></div>
          <div style={{fontSize:'26px', fontWeight:'900', marginTop:'12px'}}>Rs {stats.fTotal.toLocaleString()}</div>
          <div style={{fontSize:'11px', opacity:0.6, marginTop:'4px'}}>{getLabel()} • {stats.fCount} Orders</div>
        </div>

        <div style={{background:'white', borderRadius:'20px', padding:'18px', border:'1px solid #e2e8f0', position:'relative', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}}>
          <div style={{position:'absolute', right:'-10px', top:'-10px', fontSize:'70px', opacity:0.04}}>🪑</div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><div style={{width:'44px', height:'44px', background:'linear-gradient(135deg,#dbeafe,#bfdbfe)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>🪑</div><div style={{fontSize:'11px', color:'#64748b', letterSpacing:'1px', fontWeight:'700'}}>DINE-IN <span style={{fontSize:'14px'}}>[🪑]</span></div></div>
          <div style={{fontSize:'24px', fontWeight:'900', marginTop:'12px', color:'#0f172a'}}>Rs {stats.fDine.toLocaleString()}</div>
          <div style={{fontSize:'11px', color:'#64748b', marginTop:'4px'}}>Selected Date • 🪑 Chairs</div>
        </div>

        <div style={{background:'white', borderRadius:'20px', padding:'18px', border:'1px solid #e2e8f0', position:'relative', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}}>
          <div style={{position:'absolute', right:'-10px', top:'-10px', fontSize:'70px', opacity:0.04}}>🚗</div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><div style={{width:'44px', height:'44px', background:'linear-gradient(135deg,#ffedd5,#fed7aa)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>🚗</div><div style={{fontSize:'11px', color:'#64748b', letterSpacing:'1px', fontWeight:'700'}}>TAKEAWAY <span style={{fontSize:'14px'}}>[🚗]</span></div></div>
          <div style={{fontSize:'24px', fontWeight:'900', marginTop:'12px', color:'#0f172a'}}>Rs {stats.fTake.toLocaleString()}</div>
          <div style={{fontSize:'11px', color:'#64748b', marginTop:'4px'}}>Selected Date • 🚗 Parcel</div>
        </div>

        <div style={{background:'white', borderRadius:'20px', padding:'18px', border:'1px solid #e2e8f0', position:'relative', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}}>
          <div style={{position:'absolute', right:'-10px', top:'-10px', fontSize:'70px', opacity:0.04}}>🛵</div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><div style={{width:'44px', height:'44px', background:'linear-gradient(135deg,#dcfce7,#bbf7d0)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>🛵</div><div style={{fontSize:'11px', color:'#64748b', letterSpacing:'1px', fontWeight:'700'}}>DELIVERY <span style={{fontSize:'14px'}}>[🛵]</span></div></div>
          <div style={{fontSize:'24px', fontWeight:'900', marginTop:'12px', color:'#0f172a'}}>Rs {stats.fDeli.toLocaleString()}</div>
          <div style={{fontSize:'11px', color:'#64748b', marginTop:'4px'}}>Selected Date • 🛵 Home</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginBottom:'16px'}}>
        {[
          {label:'TODAY', value:stats.today, sub:`Profit Rs ${stats.profit}`, icon:'📅', grad:'linear-gradient(135deg,#ff6a00,#ee0979)'},
          {label:'YESTERDAY', value:stats.yest, sub:'Last Day', icon:'🌙', grad:'linear-gradient(135deg,#434343,#000)'},
          {label:'THIS WEEK', value:stats.weekTotal, sub:'7 Days', icon:'📊', grad:'linear-gradient(135deg,#2193b0,#6dd5ed)'},
          {label:'THIS MONTH', value:stats.monthTotal, sub:'This Month', icon:'📆', grad:'linear-gradient(135deg,#cc2b5e,#753a88)'},
          {label:'THIS YEAR', value:stats.yearTotal, sub:'2026', icon:'🎯', grad:'linear-gradient(135deg,#11998e,#38ef7d)'},
        ].map(c=>(
          <div key={c.label} style={{background:'white', borderRadius:'16px', padding:'14px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.03)'}}>
            <div style={{width:'40px', height:'40px', background:c.grad, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'18px'}}>{c.icon}</div>
            <div><div style={{fontSize:'10px', color:'#64748b', fontWeight:'700'}}>{c.label}</div><div style={{fontSize:'15px', fontWeight:'800', color:'#0f172a'}}>Rs {c.value.toLocaleString()}</div><div style={{fontSize:'10px', color:'#94a3b8'}}>{c.sub}</div></div>
          </div>
        ))}
      </div>

      {/* BILLS - ALAG SCROLL BOX NECHAY - 7 STAR */}
      <div style={{background:'white', borderRadius:'20px', padding:'16px', border:'1px solid #e2e8f0', boxShadow:'0 10px 40px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px'}}>
          <div style={{width:'36px', height:'36px', background:'#f1f5f9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>🧾</div>
          <div><div style={{fontWeight:'800', fontSize:'14px', color:'#0f172a'}}>Bills - Bill No Search & Reprint</div><div style={{fontSize:'11px', color:'#64748b'}}>{getLabel()} ke bills - Scroll box me</div></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search MFF-0001, Table..." style={{marginLeft:'auto', padding:'10px 16px', borderRadius:'24px', border:'1px solid #e2e8f0', background:'#f8fafc', width:'320px', fontSize:'13px'}}/>
        </div>

        <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', height:'420px', overflow:'hidden', display:'flex', flexDirection:'column', background:'#fcfcfc'}}>
          <div style={{flex:1, overflowY:'auto'}}>
            <table style={{width:'100%', fontSize:'13px', borderCollapse:'collapse'}}>
              <thead style={{position:'sticky', top:0, background:'white', zIndex:2, borderBottom:'1px solid #e2e8f0'}}>
                <tr style={{textAlign:'left'}}><th style={{padding:'12px'}}>Bill No</th><th>Date</th><th>Type</th><th>Table</th><th>Total</th><th>Method</th><th>Reprint</th></tr>
              </thead>
              <tbody>
                {filteredSales.slice().reverse().map(s=>{
                  const billNo = `MFF-${String(sales.findIndex(x=>x.id===s.id)+1).padStart(4,'0')}`
                  return (
                    <tr key={s.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                      <td style={{padding:'10px'}}><span style={{background:'#0f172a', color:'white', padding:'6px 10px', borderRadius:'8px', fontWeight:'800', fontSize:'12px'}}>{billNo}</span></td>
                      <td style={{fontSize:'12px'}}>{new Date(s.date).toLocaleTimeString()}<div style={{fontSize:'10px', color:'#94a3b8'}}>{new Date(s.date).toLocaleDateString()}</div></td>
                      <td>{s.orderType==='Takeaway'?'🚗 Takeaway':s.orderType==='Delivery'?'🛵 Delivery':'🪑 Dine-In'}</td>
                      <td style={{fontWeight:'600'}}>{s.table}</td>
                      <td><b>Rs {s.total}</b></td>
                      <td>{s.method}</td>
                      <td>
                        <button onClick={()=>reprint(s, billNo, 'BILL')} style={{padding:'6px 12px', border:'none', background:'#e0f2fe', borderRadius:'20px', cursor:'pointer', fontWeight:'700', fontSize:'11px', marginRight:'6px'}}>Bill</button>
                        <button onClick={()=>reprint(s, billNo, 'KOT')} style={{padding:'6px 12px', border:'none', background:'#fef3c7', borderRadius:'20px', cursor:'pointer', fontWeight:'700', fontSize:'11px'}}>KOT</button>
                      </td>
                    </tr>
                  )
                })}
                {filteredSales.length===0 && <tr><td colSpan={7} style={{textAlign:'center', padding:'60px', color:'#94a3b8'}}>No bills for {getLabel()}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{textAlign:'center', marginTop:'10px', fontSize:'11px', color:'#94a3b8'}}>✨ 7-Star Hotel Dashboard • Date select karo to upar ke 4 cards ka price us din ka ayega • Bills alag scroll box me ✨</div>
      </div>
    </div>
  )
}