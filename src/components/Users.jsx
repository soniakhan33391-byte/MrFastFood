import React, { useState } from 'react'
import { useStore } from '../store/Store'
import { uid } from '../utils/storage.js'

export default function Users() {
  const { users, addUser, deleteUser } = useStore()
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'cashier' })

  function submit(e) { 
    e.preventDefault(); 
    if(!form.name || !form.username || !form.password) return alert('Name, Username, Password likho!')
    addUser({ id: uid(), ...form }); 
    setForm({ name: '', username: '', password: '', role: 'cashier' }) 
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-orange-600">User Management - Admin Full Control | Cashier Only POS</h2>
      <form onSubmit={submit} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-5 gap-2">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="border rounded px-2 py-1" />
        <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" className="border rounded px-2 py-1" />
        <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" className="border rounded px-2 py-1" />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="border rounded px-2 py-1 font-bold">
          <option value="admin">Admin - Full Control</option>
          <option value="cashier">Cashier - Only Sale</option>
        </select>
        <button className="bg-orange-600 text-white rounded px-3 py-1 font-bold">Add</button>
      </form>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Username</th><th className="p-2">Role</th><th className="p-2">Access</th><th className="p-2">Del</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2 font-bold">{u.name}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role==='admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                <td className="p-2 text-center text-xs">{u.role==='admin' ? 'Full Control' : 'Only POS'}</td>
                <td className="p-2 text-center"><button onClick={() => { if(u.username==='admin') return alert('Main admin delete nahi ho sakta!'); if(confirm('Delete?')) deleteUser(u.id) }} className="text-red-600 font-bold">Del</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}