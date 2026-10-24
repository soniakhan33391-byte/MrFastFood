import React, { useState } from 'react'
import { useStore } from '../store/Store.jsx'

export default function MenuManager() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem } = useStore()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Burgers')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [stock, setStock] = useState('')
  const [editId, setEditId] = useState(null)

  const categories = ['Burgers', 'Juices', 'Fries', 'Paratha', 'Shawarma', 'Drinks', 'Pizza', 'Extras', 'Others']

  const getCost = (item) => Number(item.cost ?? item.costPrice ?? item.companyPrice ?? 0)
  const getStock = (item) => Number(item.stock ?? item.stockQty ?? 0)

  const totalAmountPreview = (Number(cost) || 0) * (Number(stock) || 0)

  const handleAdd = () => {
    if (!name || !price) return alert('Name aur Price likho!')
    const data = {
      name: name.trim(),
      category,
      price: Number(price),
      cost: Number(cost) || 0,
      costPrice: Number(cost) || 0,
      companyPrice: Number(cost) || 0,
      stock: Number(stock) || 0,
      stockQty: Number(stock) || 0,
    }
    if (editId) {
      updateMenuItem(editId, data)
      setEditId(null)
    } else {
      addMenuItem(data)
    }
    setName(''); setPrice(''); setCost(''); setStock('')
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setName(item.name)
    setCategory(item.category)
    setPrice(item.price)
    setCost(getCost(item))
    setStock(getStock(item))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Total calculations - FIXED FOR OLD DATA
  const totalInvestment = menu.reduce((s, i) => s + (getCost(i) * getStock(i)), 0)
  const totalSellingValue = menu.reduce((s, i) => s + (Number(i.price || 0) * getStock(i)), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f7fb', overflow: 'hidden' }}>
      
      {/* FIXED HEADER - ADD FORM UPAR FIX RAHEGA */}
      <div style={{ padding: '16px 16px 0 16px', flexShrink: 0, background: '#f5f7fb' }}>
        <h2 style={{ color: '#d32f2f', fontWeight: '900', marginBottom: '12px', marginTop: 0 }}>Menu & Price Management</h2>
        <div style={{ background: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: '8px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#666' }}>Item Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#666' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#1976d2' }}>Selling Price Rs</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price Rs" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #90caf9', fontSize: '13px', fontWeight: '700' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#ef6c00' }}>Company Price</label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="Cost Price" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #ffcc80', fontSize: '13px', fontWeight: '700' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#2e7d32' }}>Stock Qty {cost && stock ? `(Total Rs ${totalAmountPreview})` : ''}</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock Qty" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #a5d6a7', fontSize: '13px', fontWeight: '700' }} />
          </div>
          <button onClick={handleAdd} style={{ padding: '11px', borderRadius: '8px', border: 'none', background: editId ? '#ff9800' : '#d32f2f', color: 'white', fontWeight: '900', cursor: 'pointer', height: '42px' }}>
            {editId ? 'Update' : 'Add'}
          </button>
        </div>
      </div>

      {/* SCROLLABLE LIST - ZINGER BURGER WALI JAGAH PE SCROLL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', marginTop: '8px' }}>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr 1fr 100px', gap: '10px', padding: '12px 16px', background: '#0f172a', color: 'white', fontWeight: '800', fontSize: '12px', position: 'sticky', top: 0, zIndex: 2 }}>
            <span>Name</span><span>Category</span><span>Selling Price</span><span>Company Price</span><span>Stock</span><span>Total Amount</span><span>Profit / Item</span><span>Actions</span>
          </div>
          {menu.map(item => {
            const compPrice = getCost(item)
            const stockQty = getStock(item)
            const total = compPrice * stockQty
            const profitItem = (item.price || 0) - compPrice
            const lowStock = stockQty <= 5
            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr 1fr 100px', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', background: lowStock ? '#fff3e0' : 'white', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{item.name} {lowStock && <span style={{ color: 'red', fontSize: '10px' }}>⚠️ LOW</span>}</span>
                <span>{item.category}</span>
                <span style={{ fontWeight: '800', color: '#1976d2' }}>Rs. {item.price}</span>
                <span style={{ fontWeight: '700', color: '#ef6c00' }}>Rs. {compPrice}</span>
                <span style={{ fontWeight: '800', background: lowStock ? '#ff5722' : '#e8f5e9', color: lowStock ? 'white' : '#2e7d32', padding: '4px 8px', borderRadius: '12px', textAlign: 'center' }}>{stockQty}</span>
                <span style={{ fontWeight: '900', color: '#0f172a' }}>Rs. {total}</span>
                <span style={{ fontWeight: '700', color: profitItem > 0 ? '#16a34a' : 'red' }}>Rs. {profitItem}</span>
                <span style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(item)} style={{ border: 'none', background: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: '700' }}>Edit</button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMenuItem(item.id) }} style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: '700' }}>Del</button>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* FIXED FOOTER - TOTAL INVESTMENT AB SAHI AYEGA */}
      <div style={{ flexShrink: 0, padding: '12px 16px', background: 'white', borderTop: '2px solid #e0e0e0', display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '800', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <span>Total Items: {menu.length}</span>
        <span style={{ color: '#ef6c00', background: '#fff3e0', padding: '4px 12px', borderRadius: '20px' }}>Total Company Investment: Rs. {totalInvestment.toLocaleString()}</span>
        <span style={{ color: '#1976d2', background: '#e3f2fd', padding: '4px 12px', borderRadius: '20px' }}>Total Selling Value: Rs. {totalSellingValue.toLocaleString()}</span>
        <span style={{ color: '#16a34a', background: '#e8f5e9', padding: '4px 12px', borderRadius: '20px' }}>Expected Profit: Rs. {(totalSellingValue - totalInvestment).toLocaleString()}</span>
      </div>
    </div>
  )
}