import React, { useState } from 'react'
import { useStore } from '../store/Store.jsx'
import { uid } from '../utils/storage.js'

export default function Customers() {
  const { customers, addCustomer, deleteCustomer, sales } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [payCustomerId, setPayCustomerId] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0,10))

  const handleAdd = () => {
    if (!name) return alert('Name likho!')
    addCustomer({ name, phone, address, totalBills: 0, totalPaid: 0, due: 0, payments: [] })
    setName(''); setPhone(''); setAddress('')
  }

  const handlePay = () => {
    if (!payCustomerId || !payAmount) return alert('Customer aur Amount likho!')
    const cust = customers.find(c => c.id === payCustomerId)
    if (!cust) return
    const amt = Number(payAmount)
    // Store me direct update ke liye - payCustomer function hai to use karo warna updateCustomer
    const { payCustomer, updateCustomer } = useStore.getState ? useStore.getState() : {}
    // Fallback simple logic
    const newPayments = [...(cust.payments||[]), { id: uid(), amount: amt, date: payDate }]
    const newPaid = (Number(cust.totalPaid||0) || 0) + amt
    const newDue = Math.max(0, (Number(cust.due||0) || Number(cust.totalBills||0) - newPaid))
    // Agar updateCustomer available hai
    if (cust) {
      // Direct set via localStorage update - using store function
      // Hum yahan customers state ko update karenge via updateCustomer agar hai
      const store = useStore()
      if (store.updateCustomer) {
        store.updateCustomer(cust.id, { totalPaid: newPaid, due: newDue, payments: newPayments })
      } else if (store.payCustomer) {
        store.payCustomer(cust.id, amt)
      }
    }
    setPayAmount('')
  }

  // SINGLE CUSTOMER PRINT
  const printOneCustomer = (c) => {
    const custSales = sales.filter(s => s.customerId === c.id)
    const w = window.open('', '_blank', 'width=420,height=700')
    if (!w) { alert('Popup blocked! Allow popup'); return; }
    w.document.write(`
      <html><head><title>${c.name} - Bill</title><style>
        body{font-family:monospace; width:360px; margin:auto; padding:10px; font-size:12px}
        .c{text-align:center} .b{font-weight:bold} .line{border-top:1px dashed #000; margin:8px 0}
        .row{display:flex; justify-content:space-between} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:4px; font-size:11px}
      </style></head><body>
        <div class="c"><div class="b" style="font-size:20px">Mr Fast Food - Mardan</div><div class="b">CUSTOMER LEDGER</div><div>${new Date().toLocaleString()}</div></div>
        <div class="line"></div>
        <div class="row"><span>Customer:</span><span class="b">${c.name}</span></div>
        <div class="row"><span>Phone:</span><span>${c.phone||'-'}</span></div>
        <div class="row"><span>Address:</span><span>${c.address||'-'}</span></div>
        <div class="line"></div>
        <div class="row"><span>Total Bills:</span><span>Rs ${c.totalBills||0}</span></div>
        <div class="row"><span>Paid:</span><span>Rs ${c.totalPaid||0}</span></div>
        <div class="row b" style="font-size:16px"><span>DUE:</span><span>Rs ${c.due||0}</span></div>
        <div class="line"></div>
        <div class="b">Payment History:</div>
        <table><tr><th>Date</th><th>Amount</th></tr>
        ${(c.payments||[]).map(p=>`<tr><td>${p.date}</td><td>Rs ${p.amount}</td></tr>`).join('') || '<tr><td colspan=2>No payments</td></tr>'}
        </table>
        <div class="b" style="margin-top:10px">Order History:</div>
        <table><tr><th>Date</th><th>Table</th><th>Total</th></tr>
        ${custSales.map(s=>`<tr><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.table}</td><td>Rs ${s.total||0}</td></tr>`).join('') || '<tr><td colspan=3>No orders</td></tr>'}
        </table>
        <div style="text-align:center; margin-top:15px"><button onclick="window.print()" style="padding:10px 20px; background:#d32f2f; color:white; border:none; border-radius:6px; font-weight:900">🖨️ Print Now</button></div>
        <div class="c b" style="margin-top:10px">Thank You!</div>
      </body></html>
    `)
    w.document.close()
  }

  const printAllCustomers = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Popup blocked!'); return; }
    w.document.write(`
      <html><head><title>All Customers Ledger</title><style>
        body{font-family:Arial; padding:15px} table{width:100%; border-collapse:collapse} th,td{border:1px solid #000; padding:6px; font-size:12px}
      </style></head><body>
        <div style="text-align:center"><b style="font-size:20px">Mr Fast Food - All Customers Ledger</b><div>${new Date().toLocaleString()}</div></div>
        <table style="margin-top:15px"><tr><th>#</th><th>Name</th><th>Phone</th><th>Address</th><th>Total Bills</th><th>Paid</th><th>Due</th></tr>
        ${customers.map((c,i)=>`<tr><td>${i+1}</td><td>${c.name}</td><td>${c.phone||'-'}</td><td>${c.address||'-'}</td><td>Rs ${c.totalBills||0}</td><td>Rs ${c.totalPaid||0}</td><td><b>Rs ${c.due||0}</b></td></tr>`).join('')}
        </table>
        <div style="text-align:center; margin-top:15px"><button onclick="window.print()" style="padding:10px 20px; background:#d32f2f; color:white; border:none; border-radius:6px; font-weight:900">🖨️ Print All Now</button></div>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div style={{ padding: '16px', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ color: '#d32f2f', fontWeight: '900', margin: 0 }}>Customer Management</h2>
        <button onClick={printAllCustomers} style={{ padding: '10px 18px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>🖨️ Print All Customers</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
          <h4>Customer Entry</h4>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (WhatsApp)" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={handleAdd} style={{ width: '100%', padding: '10px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800' }}>Add Customer</button>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
          <h4>Receive Payment</h4>
          <select value={payCustomerId} onChange={e=>setPayCustomerId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            <option value="">Select Customer</option>
            {customers.map(c=><option key={c.id} value={c.id}>{c.name} - Due Rs {c.due||0}</option>)}
          </select>
          <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder="Amount" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={()=>{ if(!payCustomerId||!payAmount) return alert('Customer aur Amount likho!'); const { payCustomer } = useStore(); /* payCustomer via hook already */ handlePay(); }} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800' }}>Pay</button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Customer Ledger - Scroll wala ({customers.length})</h4>
        {/* SCROLL LAGAYA HAI YAHAN */}
        <div style={{ maxHeight: '450px', overflowY: 'auto', border: '2px solid #eee', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
              <tr><th style={{ padding: '12px', textAlign: 'left' }}>Name</th><th>Phone</th><th>Address</th><th>Total Bills</th><th>Paid</th><th>Due</th><th>Payment History</th><th>Print</th><th>Del</th></tr>
            </thead>
            <tbody>
              {customers.map(c=>(
                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: '700' }}>{c.name}</td>
                  <td style={{ padding: '10px' }}>{c.phone||'-'}</td>
                  <td style={{ padding: '10px' }}>{c.address||'-'}</td>
                  <td style={{ padding: '10px' }}>Rs. {c.totalBills||0}</td>
                  <td style={{ padding: '10px' }}>Rs. {c.totalPaid||0}</td>
                  <td style={{ padding: '10px', color: 'red', fontWeight: '800' }}>Rs. {c.due||0}</td>
                  <td style={{ padding: '10px', fontSize: '11px' }}>{(c.payments||[]).slice(-2).map(p=>`${p.date}: Rs ${p.amount}`).join(', ') || '-'}</td>
                  <td style={{ padding: '10px' }}><button onClick={()=>printOneCustomer(c)} style={{ padding: '6px 10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', fontWeight: '700', cursor: 'pointer' }}>🖨️</button></td>
                  <td style={{ padding: '10px' }}><button onClick={()=>{ if(confirm('Delete '+c.name+'?')) deleteCustomer(c.id) }} style={{ padding: '6px 10px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '5px', fontWeight: '700', cursor: 'pointer' }}>Del</button></td>
                </tr>
              ))}
              {customers.length===0 && <tr><td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: '#999' }}>No customers</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}