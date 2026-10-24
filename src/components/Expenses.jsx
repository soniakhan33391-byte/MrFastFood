import React, { useState } from 'react'
import { useStore } from '../store/Store.jsx'
import { uid } from '../utils/storage.js'

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useStore()
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [category, setCategory] = useState('Other')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [paidBy, setPaidBy] = useState('')

  const handleAdd = () => {
    if (!amount) return alert('Amount likho!')
    addExpense({ id: uid(), date, category, amount: Number(amount), description: desc, paidBy, month: date.slice(0,7) })
    setAmount(''); setDesc(''); setPaidBy('')
  }

  const monthlyTotal = expenses.filter(e => (e.date||'').slice(0,7) === date.slice(0,7)).reduce((s,e)=>s+Number(e.amount||0),0)
  const currentMonthExpenses = expenses.filter(e => (e.date||'').slice(0,7) === date.slice(0,7))
  const totalAll = expenses.reduce((s,e)=>s+Number(e.amount||0),0)

  const printExpenses = (list, title) => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked!'); return; }
    const total = list.reduce((s,e)=>s+Number(e.amount||0),0)
    w.document.write(`
      <html><head><title>${title}</title><style>
        body{font-family:Arial; padding:15px} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:6px; font-size:12px}
      </style></head><body>
        <div style="text-align:center"><b style="font-size:20px">Mr Fast Food - ${title}</b><div>${new Date().toLocaleString()}</div><div style="margin-top:8px"><b>Total: Rs ${total}</b></div></div>
        <table style="margin-top:15px"><tr><th>#</th><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Paid By</th></tr>
        ${list.map((e,i)=>`<tr><td>${i+1}</td><td>${e.date}</td><td>${e.category}</td><td>Rs ${e.amount}</td><td>${e.description||'-'}</td><td>${e.paidBy||'-'}</td></tr>`).join('')}
        <tr style="font-weight:900; background:#eee"><td colspan=3 style="text-align:right">TOTAL</td><td>Rs ${total}</td><td colspan=2></td></tr>
        </table>
        <div style="text-align:center; margin-top:15px"><button onclick="window.print()" style="padding:10px 20px; background:#d32f2f; color:white; border:none; border-radius:6px; font-weight:900">🖨️ Print Now</button></div>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div style={{ padding: '16px', background: '#f5f7fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ color: '#d32f2f', fontWeight: '900', margin: 0 }}>Expense Management</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={()=>printExpenses(currentMonthExpenses, `Monthly Expenses (${date.slice(0,7)})`)} style={{ padding: '10px 14px', background: '#ff6f00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>🖨️ Print Monthly</button>
          <button onClick={()=>printExpenses(expenses, 'All Expenses')} style={{ padding: '10px 14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>🖨️ Print All</button>
        </div>
      </div>

      {/* ADD WALA - FIX UPAR RAHEGA */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '16px', position: 'sticky', top: 0, zIndex: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.5fr 1fr 0.6fr', gap: '10px', alignItems: 'center' }}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option>Other</option><option>Electricity Bill</option><option>Gas Bill</option><option>Rent</option><option>Salary</option><option>Purchase</option><option>Maintenance</option>
          </select>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount Rs" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <input value={paidBy} onChange={e=>setPaidBy(e.target.value)} placeholder="Paid By" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <button onClick={handleAdd} style={{ padding: '10px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Add</button>
        </div>
      </div>

      {/* MONTHLY TOTAL - SCROLL LAGA DIYA */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0 }}>Monthly Total ({date.slice(0,7)}): Rs. {monthlyTotal} <span style={{ fontWeight: '400', fontSize: '13px', color: '#666' }}> | All Time Total: Rs {totalAll}</span></h4>
        </div>
        
        {/* YE SCROLL WALA DIV HAI - IS SE ADD OPER HI RAHEGA */}
        <div style={{ maxHeight: '55vh', overflowY: 'auto', border: '2px solid #eee', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Paid By</th>
                <th>Del</th>
              </tr>
            </thead>
            <tbody>
              {currentMonthExpenses.slice().reverse().map(e=>(
                <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{e.date.split('-').reverse().join('-')}</td>
                  <td style={{ padding: '12px' }}>{e.category}</td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>Rs. {e.amount}</td>
                  <td style={{ padding: '12px' }}>{e.description||'-'}</td>
                  <td style={{ padding: '12px' }}>{e.paidBy||'-'}</td>
                  <td style={{ padding: '12px' }}><button onClick={()=>{ if(confirm('Delete?')) deleteExpense(e.id) }} style={{ padding: '6px 10px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '5px', fontWeight: '700', cursor: 'pointer' }}>Del</button></td>
                </tr>
              ))}
              {currentMonthExpenses.length===0 && <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#999' }}>No expenses for this month</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
          Showing {currentMonthExpenses.length} records for {date.slice(0,7)} - Scroll karo to aur dekho
        </div>
      </div>
    </div>
  )
}