import React, { useState, useMemo } from 'react'
import { useStore } from '../store/Store.jsx'

export default function Reports() {
  const { sales, expenses, customers, suppliers, menu, stockEntries, damageReturns, productReturns } = useStore()
  const [from, setFrom] = useState(new Date().toISOString().slice(0,10))
  const [to, setTo] = useState(new Date().toISOString().slice(0,10))
  const [activeTab, setActiveTab] = useState('dashboard')
  const [search, setSearch] = useState('')

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = (s.date||'').slice(0,10)
      return d >= from && d <= to
    })
  }, [sales, from, to])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = (e.date||'').slice(0,10)
      return d >= from && d <= to
    })
  }, [expenses, from, to])

  const filteredDamage = useMemo(() => {
    return (damageReturns||[]).filter(e => {
      const d = (e.date||'').slice(0,10)
      return d >= from && d <= to
    })
  }, [damageReturns, from, to])

  const filteredReturns = useMemo(() => {
    return (productReturns||[]).filter(e => {
      const d = (e.date||'').slice(0,10)
      return d >= from && d <= to
    })
  }, [productReturns, from, to])

  const totalSales = filteredSales.reduce((s,x)=>s+Number(x.total||0),0)
  const totalExpense = filteredExpenses.reduce((s,x)=>s+Number(x.amount||0),0)
  const totalDamageLoss = filteredDamage.reduce((s,x)=>s+Number(x.cost||0),0)
  const totalReturnAmount = filteredReturns.reduce((s,x)=>s+Number(x.price||0),0)
  const grossProfit = totalSales - totalExpense
  const netProfit = totalSales - totalExpense - totalDamageLoss
  const dueCustomers = customers.reduce((s,c)=>s+Number(c.due||0),0)
  const dueSuppliers = suppliers.reduce((s,sp)=>s+Number((Number(sp.totalSaman||0)-Number(sp.totalPaid||0))),0)

  const dailySales = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      const d = (s.date||'').slice(0,10)
      map[d] = (map[d]||0) + Number(s.total||0)
    })
    return Object.entries(map).map(([date, amt])=>({date, amt})).sort((a,b)=>a.date.localeCompare(b.date))
  }, [filteredSales])

  const hourlySales = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      const h = new Date(s.date).getHours()
      const label = h + ':00 - ' + (h+1) + ':00'
      map[label] = (map[label]||0) + Number(s.total||0)
    })
    return Object.entries(map).map(([hour, amt])=>({hour, amt}))
  }, [filteredSales])

  const itemWise = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      (s.items||[]).forEach(i => {
        if(!map[i.name]) map[i.name] = { qty: 0, amount: 0 }
        map[i.name].qty += Number(i.qty||0)
        map[i.name].amount += Number(i.price||0)*Number(i.qty||0)
      })
    })
    return Object.entries(map).map(([name, v])=>({name, qty: v.qty, amount: v.amount}))
  }, [filteredSales])

  const profitMargin = useMemo(() => {
    return itemWise.map(it => {
      const mItem = menu.find(m=>m.name===it.name)
      const cost = Number(mItem?.cost||mItem?.costPrice||0)
      const price = Number(mItem?.price||0) || (it.qty ? it.amount/it.qty : 0)
      const margin = it.amount - (cost*it.qty)
      const marginPct = it.amount ? (margin/it.amount*100).toFixed(1) : 0
      return { name: it.name, qty: it.qty, amount: it.amount, cost, price, margin, marginPct }
    })
  }, [itemWise, menu])

  const totalItemCost = profitMargin.reduce((s,p)=>s+p.cost*p.qty,0)
  const realProfit = totalSales - totalItemCost - totalExpense - totalDamageLoss

  const unpaidSales = filteredSales.filter(s => Number(s.paid||0) < Number(s.total||0))
  const dueBills = [
    ...customers.filter(c=>Number(c.due||0)>0).map(c=>({type:'Customer', name:c.name, due:c.due, phone:c.phone})),
    ...suppliers.filter(s=>Number(s.totalSaman||0)-Number(s.totalPaid||0)>0).map(s=>({type:'Supplier', name:s.name, due:Number(s.totalSaman||0)-Number(s.totalPaid||0), phone:s.contact}))
  ]

  const printReport = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked'); return; }
    const content = document.getElementById('report-content') ? document.getElementById('report-content').innerHTML : ''
    const html = '<html><head><title>' + activeTab + ' Report ' + from + ' to ' + to + '</title><style>body{font-family:Arial; padding:20px} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:6px; font-size:12px} .header{text-align:center; margin-bottom:20px} .cards{display:flex; gap:10px; justify-content:center; margin-bottom:15px} .card{border:1px solid #000; padding:10px; min-width:120px; text-align:center}</style></head><body>' +
      '<div class="header"><h2>Mr Fast Food - Mardan POS</h2><h3>' + activeTab.toUpperCase() + ' REPORT</h3><div>From: ' + from + ' To: ' + to + '</div><div>Generated: ' + new Date().toLocaleString() + '</div></div>' +
      '<div class="cards"><div class="card"><b>Sales</b><div>Rs ' + totalSales + '</div></div><div class="card"><b>Expense</b><div>Rs ' + totalExpense + '</div></div><div class="card"><b>Damage Loss</b><div>Rs ' + totalDamageLoss + '</div></div><div class="card"><b>Net Profit</b><div>Rs ' + netProfit + '</div></div></div>' +
      '<div>' + content + '</div>' +
      '<div style="text-align:center; margin-top:20px"><button onclick="window.print()">Print / Save PDF</button></div></body></html>'
    w.document.write(html)
    w.document.close()
  }

  const tabs = [
    {id:'dashboard', label:'📊 Dashboard'},
    {id:'daily', label:'📅 Daily Sales'},
    {id:'hourly', label:'⏰ Hourly Sales'},
    {id:'items', label:'🍔 Product / Item List'},
    {id:'customers', label:'👥 Customers'},
    {id:'invoices', label:'🧾 Invoice List'},
    {id:'profit', label:'💰 Profit & Margin'},
    {id:'loss', label:'📉 Profit Loss Detail'},
    {id:'damage', label:'⚠️ Damage / Return'},
    {id:'unpaid', label:'⚠️ Unpaid Sales'},
    {id:'due', label:'💳 Due Bills'},
    {id:'stock', label:'📦 Stock Movement'},
  ]

  return (
    <div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '16px', borderRadius: '12px', marginBottom: '16px', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: '#ff6b35', fontWeight: '900' }}>Reports / Dashboard</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
            <span>From:</span><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'white', color: 'black', fontWeight: '700' }} />
            <span>To:</span><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'white', color: 'black', fontWeight: '700' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* --- FIX - SIRF YE LINE THEEK KI HAI - BLACK TEXT WHITE BACKGROUND --- */}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search item, customer..." style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', width: '200px', background: 'white', color: 'black', fontWeight: '700' }} />
          <button onClick={printReport} style={{ padding: '8px 16px', background: 'white', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Print</button>
          <button onClick={printReport} style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Save PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '11px' }}>Sales</div><div style={{ fontSize: '20px', fontWeight: '900' }}>Rs. {totalSales}</div><div style={{ fontSize: '10px' }}>{filteredSales.length} invoices</div></div>
        <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '11px' }}>Expense</div><div style={{ fontSize: '20px', fontWeight: '900' }}>Rs. {totalExpense}</div><div style={{ fontSize: '10px' }}>{filteredExpenses.length} entries</div></div>
        <div style={{ background: 'linear-gradient(135deg, #e65100, #bf360c)', color: 'white', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '11px' }}>Damage Loss</div><div style={{ fontSize: '20px', fontWeight: '900' }}>Rs. {totalDamageLoss}</div><div style={{ fontSize: '10px' }}>{filteredDamage.length} items</div></div>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '11px' }}>Gross Profit</div><div style={{ fontSize: '20px', fontWeight: '900' }}>Rs. {grossProfit}</div><div style={{ fontSize: '10px' }}>Sales - Expense</div></div>
        <div style={{ background: realProfit>=0?'linear-gradient(135deg, #0f766e, #115e59)':'linear-gradient(135deg, #991b1b, #7f1d1d)', color: 'white', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '11px' }}>Net Profit (Real)</div><div style={{ fontSize: '20px', fontWeight: '900' }}>Rs. {realProfit}</div><div style={{ fontSize: '10px' }}>After Item Cost + Damage</div></div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '14px', borderRadius: '12px' }}><div style={{ fontSize: '11px' }}>Due Customers</div><div style={{ fontSize: '20px', fontWeight: '900' }}>Rs. {dueCustomers}</div></div>
      </div>

      <div style={{ background: 'white', padding: '10px', borderRadius: '12px', marginBottom: '16px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ padding: '10px 12px', borderRadius: '8px', border: 'none', background: activeTab===t.id?'#0f172a':'#f1f5f9', color: activeTab===t.id?'white':'#334155', fontWeight: activeTab===t.id?'800':'600', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '11px' }}>{t.label}</button>
        ))}
      </div>

      <div id="report-content" style={{ background: 'white', padding: '16px', borderRadius: '12px', minHeight: '400px' }}>
        {activeTab==='dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><h4>Table-wise Sales</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#f8fafc' }}><th style={{ padding: '10px', textAlign: 'left' }}>Table</th><th style={{ padding: '10px' }}>Amount</th></tr></thead>
                  <tbody>{Object.entries(filteredSales.reduce((a,s)=>{a[s.table]=(a[s.table]||0)+Number(s.total||0); return a},{})).map(([tbl, amt])=><tr key={tbl} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{tbl}</td><td style={{ padding: '10px' }}>Rs {amt}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <div><h4>Item-wise Sales (qty)</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#f8fafc' }}><th style={{ padding: '10px', textAlign: 'left' }}>Item</th><th>Qty</th><th>Amount</th></tr></thead>
                  <tbody>{itemWise.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())).map((it,i)=><tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{it.name}</td><td style={{ padding: '10px', textAlign: 'center' }}>{it.qty}</td><td style={{ padding: '10px' }}>Rs {it.amount}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab==='daily' && (<div><h4>Daily Sales Report</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '12px' }}>Date</th><th>Sales</th><th>Expenses</th><th>Profit</th></tr></thead><tbody>{dailySales.map(d=>{const exp = expenses.filter(e=>e.date.slice(0,10)===d.date).reduce((s,e)=>s+Number(e.amount||0),0); return <tr key={d.date} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '12px' }}>{d.date}</td><td style={{ padding: '12px', color: 'green', fontWeight: '700' }}>Rs {d.amt}</td><td style={{ padding: '12px', color: 'red' }}>Rs {exp}</td><td style={{ padding: '12px', fontWeight: '800' }}>Rs {d.amt-exp}</td></tr>})}</tbody></table></div></div>)}
        {activeTab==='hourly' && (<div><h4>Hourly Sales</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>{hourlySales.map(h=><div key={h.hour} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}><div style={{ fontWeight: '700' }}>{h.hour}</div><div style={{ color: 'green', fontWeight: '900' }}>Rs {h.amt}</div></div>)}</div></div>)}
        {activeTab==='items' && (<div><h4>Product / Item List - Stock & Sales</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px' }}>Item</th><th>Price</th><th>Cost</th><th>Stock</th><th>Sold Qty</th><th>Revenue</th></tr></thead><tbody>{menu.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())).map(m=>{const sold = itemWise.find(i=>i.name===m.name)?.qty||0; return <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{m.name}</td><td style={{ padding: '10px' }}>Rs {m.price}</td><td style={{ padding: '10px' }}>Rs {m.cost||0}</td><td style={{ padding: '10px', fontWeight: '800', color: Number(m.stock||0)<5?'red':'green' }}>{m.stock||0}</td><td style={{ padding: '10px' }}>{sold}</td><td style={{ padding: '10px' }}>Rs {sold*Number(m.price||0)}</td></tr>})}</tbody></table></div></div>)}
        {activeTab==='customers' && (<div><h4>Customer Wise Report</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px' }}>Customer</th><th>Phone</th><th>Total Bills</th><th>Paid</th><th>Due</th></tr></thead><tbody>{customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).map(c=><tr key={c.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{c.name}</td><td style={{ padding: '10px' }}>{c.phone}</td><td style={{ padding: '10px' }}>Rs {c.totalBills||0}</td><td style={{ padding: '10px' }}>Rs {c.totalPaid||0}</td><td style={{ padding: '10px', color: 'red', fontWeight: '800' }}>Rs {c.due||0}</td></tr>)}</tbody></table></div></div>)}
        {activeTab==='invoices' && (<div><h4>Invoice List ({filteredSales.length} invoices)</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px' }}>Invoice ID</th><th>Date</th><th>Table</th><th>Items</th><th>Total</th><th>Paid</th><th>Method</th></tr></thead><tbody>{filteredSales.slice().reverse().filter(s=>JSON.stringify(s).toLowerCase().includes(search.toLowerCase())).map(s=><tr key={s.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px', fontSize: '11px' }}>{s.id.slice(0,8)}</td><td style={{ padding: '10px' }}>{new Date(s.date).toLocaleString()}</td><td style={{ padding: '10px' }}>{s.table}</td><td style={{ padding: '10px' }}>{(s.items||[]).length} items</td><td style={{ padding: '10px', fontWeight: '700' }}>Rs {s.total}</td><td style={{ padding: '10px' }}>Rs {s.paid}</td><td style={{ padding: '10px' }}>{s.method}</td></tr>)}</tbody></table></div></div>)}
        {activeTab==='profit' && (<div><h4>Profit and Margin Report</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px' }}>Item</th><th>Qty Sold</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Margin %</th></tr></thead><tbody>{profitMargin.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map((p,i)=><tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{p.name}</td><td style={{ padding: '10px', textAlign: 'center' }}>{p.qty}</td><td style={{ padding: '10px' }}>Rs {p.amount}</td><td style={{ padding: '10px' }}>Rs {p.cost*p.qty}</td><td style={{ padding: '10px', fontWeight: '800', color: Number(p.margin)<0?'red':'green' }}>Rs {p.margin}</td><td style={{ padding: '10px', fontWeight: '700' }}>{p.marginPct}%</td></tr>)}</tbody></table></div></div>)}
        {activeTab==='loss' && (
          <div><h4>📉 Profit Loss Detail Report - {from} to {to}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #22c55e' }}><div style={{ fontSize: '12px' }}>Total Revenue (Sales)</div><div style={{ fontSize: '20px', fontWeight: '900', color: 'green' }}>Rs {totalSales}</div><div style={{ fontSize: '11px' }}>{filteredSales.length} invoices</div></div>
              <div style={{ background: '#ffebee', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}><div style={{ fontSize: '12px' }}>Item Cost (COGS)</div><div style={{ fontSize: '20px', fontWeight: '900', color: 'red' }}>Rs {totalItemCost}</div></div>
              <div style={{ background: '#ffebee', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #ff5722' }}><div style={{ fontSize: '12px' }}>Expenses</div><div style={{ fontSize: '20px', fontWeight: '900', color: 'red' }}>Rs {totalExpense}</div></div>
              <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #ff9800' }}><div style={{ fontSize: '12px' }}>Damage / Wastage Loss</div><div style={{ fontSize: '20px', fontWeight: '900', color: '#e65100' }}>Rs {totalDamageLoss}</div></div>
              <div style={{ background: realProfit>=0?'#e0f2f1':'#ffebee', padding: '16px', borderRadius: '10px', borderLeft: `4px solid ${realProfit>=0?'#009688':'#d32f2f'}` }}><div style={{ fontSize: '12px' }}>NET PROFIT / LOSS (Real)</div><div style={{ fontSize: '24px', fontWeight: '900', color: realProfit>=0?'#00695c':'#b71c1c' }}>Rs {realProfit} {realProfit>=0?'Profit':'Loss'}</div><div style={{ fontSize: '11px' }}>Formula: Sales - (Item Cost + Expense + Damage)</div></div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: '800', marginBottom: '6px' }}>Breakdown:</div>
              <div>Revenue: Rs {totalSales} - Item Cost: Rs {totalItemCost} = Gross: Rs {totalSales-totalItemCost}</div>
              <div>Gross Rs {totalSales-totalItemCost} - Expense Rs {totalExpense} - Damage Rs {totalDamageLoss} = Net Rs {realProfit}</div>
            </div>
          </div>
        )}
        {activeTab==='damage' && (
          <div><h4>⚠️ Damage / Return Report - Loss Rs {totalDamageLoss} + Returns Rs {totalReturnAmount}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><h5 style={{ color: '#e65100' }}>Damage / Wastage ({filteredDamage.length}) - Loss</h5>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ffcc80', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#fff3e0' }}><th style={{ padding: '8px' }}>Date</th><th>Item</th><th>Qty</th><th>Reason</th><th>Loss</th></tr></thead>
                  <tbody>{filteredDamage.filter(d=>d.itemName.toLowerCase().includes(search.toLowerCase())).map(d=><tr key={d.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px', fontSize: '11px' }}>{d.date}</td><td style={{ padding: '8px' }}>{d.itemName}</td><td style={{ padding: '8px', color: 'red', fontWeight: '700' }}>-{d.qty}</td><td style={{ padding: '8px' }}>{d.reason}</td><td style={{ padding: '8px', fontWeight: '800' }}>Rs {d.cost}</td></tr>)}</tbody>
                  <tfoot><tr style={{ background: '#ffe0b2', fontWeight: '900' }}><td colSpan={4} style={{ padding: '8px', textAlign: 'right' }}>Total Loss</td><td style={{ padding: '8px', color: 'red' }}>Rs {totalDamageLoss}</td></tr></tfoot>
                  </table>
                </div>
              </div>
              <div><h5 style={{ color: '#2e7d32' }}>Product Returns ({filteredReturns.length}) - Stock Added</h5>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #a5d6a7', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#e8f5e9' }}><th style={{ padding: '8px' }}>Date</th><th>Item</th><th>Qty</th><th>Reason</th><th>Amount</th></tr></thead>
                  <tbody>{filteredReturns.filter(d=>d.itemName.toLowerCase().includes(search.toLowerCase())).map(d=><tr key={d.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px', fontSize: '11px' }}>{d.date}</td><td style={{ padding: '8px' }}>{d.itemName}</td><td style={{ padding: '8px', color: 'green', fontWeight: '700' }}>+{d.qty}</td><td style={{ padding: '8px' }}>{d.reason}</td><td style={{ padding: '8px', fontWeight: '800' }}>Rs {d.price}</td></tr>)}</tbody>
                  <tfoot><tr style={{ background: '#c8e6c9', fontWeight: '900' }}><td colSpan={4} style={{ padding: '8px', textAlign: 'right' }}>Total Return</td><td style={{ padding: '8px', color: 'green' }}>Rs {totalReturnAmount}</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab==='unpaid' && (<div><h4>Unpaid Sales - {unpaidSales.length} bills</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#dc2626', color: 'white' }}><th style={{ padding: '10px' }}>Date</th><th>Table</th><th>Customer</th><th>Total</th><th>Paid</th><th>Unpaid</th></tr></thead><tbody>{unpaidSales.map(s=><tr key={s.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{new Date(s.date).toLocaleString()}</td><td style={{ padding: '10px' }}>{s.table}</td><td style={{ padding: '10px' }}>{customers.find(c=>c.id===s.customerId)?.name||'-'}</td><td style={{ padding: '10px' }}>Rs {s.total}</td><td style={{ padding: '10px' }}>Rs {s.paid}</td><td style={{ padding: '10px', color: 'red', fontWeight: '800' }}>Rs {Number(s.total||0)-Number(s.paid||0)}</td></tr>)}</tbody></table></div></div>)}
        {activeTab==='due' && (<div><h4>Due Bills - Customers and Suppliers</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px' }}>Type</th><th>Name</th><th>Phone</th><th>Due Amount</th></tr></thead><tbody>{dueBills.filter(d=>d.name.toLowerCase().includes(search.toLowerCase())).map((d,i)=><tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', background: d.type==='Customer'?'#dbeafe':'#fef3c7', fontSize: '11px', fontWeight: '700' }}>{d.type}</span></td><td style={{ padding: '10px', fontWeight: '700' }}>{d.name}</td><td style={{ padding: '10px' }}>{d.phone||'-'}</td><td style={{ padding: '10px', color: 'red', fontWeight: '800' }}>Rs {d.due}</td></tr>)}</tbody></table></div></div>)}
        {activeTab==='stock' && (<div><h4>Stock Movement Report</h4><div style={{ maxHeight: '500px', overflowY: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px' }}>Date</th><th>Type</th><th>Item</th><th>Qty</th><th>Supplier/Customer</th></tr></thead><tbody>{stockEntries.filter(e=> (e.date||'').slice(0,10) >= from && (e.date||'').slice(0,10) <= to && e.itemName.toLowerCase().includes(search.toLowerCase())).slice().reverse().map((e,i)=><tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{e.date}</td><td style={{ padding: '10px' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>IN</span></td><td style={{ padding: '10px' }}>{e.itemName}</td><td style={{ padding: '10px', color: 'green', fontWeight: '700' }}>+{e.qty||e.qtyPurchased||0}</td><td style={{ padding: '10px' }}>{e.supplierName||'-'}</td></tr>)}</tbody></table></div></div>)}
      </div>
    </div>
  )
}