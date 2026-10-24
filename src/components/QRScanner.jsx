import React, { useState, useEffect } from 'react'

export default function QRScanner() {
  const [manual, setManual] = useState('')
  const [lastOrder, setLastOrder] = useState(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
    script.onload = () => {
      if (window.Html5QrcodeScanner) {
        const scanner = new window.Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false)
        scanner.render((decodedText) => {
          try { 
            const order = JSON.parse(decodedText)
            const old = JSON.parse(localStorage.getItem('mff_sales') || '[]')
            if(old.find(s=>String(s.id)===String(order.id))){ alert('Ye Order Pehle Add Hai'); return }
            localStorage.setItem('mff_sales', JSON.stringify([...old, {...order, id: order.id || Date.now().toString()}]))
            setLastOrder(order)
            alert(`✅ Order Add - Table ${order.table} - Rs ${order.total}`)
          } catch(e){}
        }, () => {})
      }
    }
    document.body.appendChild(script)
  }, [])

  const handleManual = () => {
    try { 
      const order = JSON.parse(manual)
      const old = JSON.parse(localStorage.getItem('mff_sales') || '[]')
      localStorage.setItem('mff_sales', JSON.stringify([...old, order]))
      setLastOrder(order)
      alert(`✅ Order Add - Table ${order.table}`)
    } catch{ alert('QR Data Galat Hai') }
  }

  return (
    <div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ background: '#0f172a', color: 'white', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, color: '#22c55e' }}>📷 QR Scanner</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: 'white', padding: '12px', borderRadius: '12px' }}>
          <h4>Camera Scan</h4>
          <div id="reader"></div>
        </div>
        <div style={{ background: 'white', padding: '12px', borderRadius: '12px' }}>
          <h4>Manual</h4>
          <textarea value={manual} onChange={e=>setManual(e.target.value)} style={{ width: '100%', height: '120px', border:'1px solid #ddd', borderRadius:'8px', padding:'8px' }} />
          <button onClick={handleManual} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', marginTop:'8px' }}>✅ Order Add Karo</button>
          {lastOrder && <div style={{ marginTop:'10px', background:'#dcfce7', padding:'8px', borderRadius:'8px' }}>Last: {lastOrder.table} - Rs {lastOrder.total}</div>}
        </div>
      </div>
    </div>
  )
}