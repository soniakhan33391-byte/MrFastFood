import React, { useState } from 'react'
import { useStore } from '../store/Store'

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Everyday']

export default function Offers() {
  const { offers, addOffer, updateOffer, deleteOffer, customers, settings } = useStore()
  const [form, setForm] = useState({ name: '', discountType: '%', value: '', weekday: 'Friday', active: true })
  const [selected, setSelected] = useState([])
  const [message, setMessage] = useState('Assalamu Alaikum! Mr Fast Food Mardan ki taraf se Jumma Offer - Har Burger pe 10% OFF! Rs only. Visit today!')

  function submit(e) { e.preventDefault(); addOffer({ ...form, value: Number(form.value) }); setForm({ name: '', discountType: '%', value: '', weekday: 'Friday', active: true }) }

  function toggle(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }

  // --- NAYA - SELECT ALL ---
  const isAllSelected = customers.length > 0 && selected.length === customers.length
  function toggleAll() {
    if (isAllSelected) {
      setSelected([])
    } else {
      setSelected(customers.map(c => c.id))
    }
  }

  function broadcast() {
    const msg = encodeURIComponent(message)
    const targets = customers.filter(c => selected.includes(c.id) && c.phone)
    if (targets.length === 0) { alert('Select customers with phone'); return }
    targets.forEach(c => {
      const phone = c.phone.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-orange-600">Weekend Offer & WhatsApp Marketing</h2>
      <form onSubmit={submit} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-6 gap-2">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Offer name" className="border rounded px-2 py-1" />
        <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="border rounded px-2 py-1">
          <option>%</option><option>Rs</option>
        </select>
        <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Value" className="border rounded px-2 py-1" />
        <select value={form.weekday} onChange={e => setForm({ ...form, weekday: e.target.value })} className="border rounded px-2 py-1">
          {days.map(d => <option key={d}>{d}</option>)}
        </select>
        <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active</label>
        <button className="bg-orange-600 text-white rounded px-3 py-1">Add Offer</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Type</th><th className="p-2">Value</th><th className="p-2">Weekday</th><th className="p-2">Active</th><th className="p-2">Del</th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.name}</td>
                <td className="p-2 text-center">{o.discountType}</td>
                <td className="p-2 text-center">{o.value}</td>
                <td className="p-2 text-center">{o.weekday}</td>
                <td className="p-2 text-center">
                  <input type="checkbox" checked={o.active} onChange={e => updateOffer(o.id, { active: e.target.checked })} />
                </td>
                <td className="p-2 text-center"><button onClick={() => deleteOffer(o.id)} className="text-red-600">Del</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-semibold">WhatsApp Broadcast</h3>
        <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full border rounded p-2 text-sm" rows={3} />
        
        {/* --- NAYA SELECT ALL YAHAN ADD KIYA --- */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" checked={isAllSelected} onChange={toggleAll} className="w-5 h-5" />
            ✅ Select All ({selected.length}/{customers.length})
          </label>
          <button onClick={() => setSelected([])} className="text-xs bg-white border rounded px-2 py-1">Clear All</button>
        </div>

        <div className="max-h-48 overflow-y-auto border rounded p-2">
          {customers.map(c => (
            <label key={c.id} className={`flex items-center gap-2 text-sm py-1 px-2 rounded cursor-pointer ${selected.includes(c.id) ? 'bg-green-50 font-bold' : ''}`}>
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
              {c.name} - {c.phone}
            </label>
          ))}
        </div>
        <button onClick={broadcast} className="bg-green-600 text-white rounded px-4 py-2">Send WhatsApp to Selected ({selected.length})</button>
      </div>
    </div>
  )
}