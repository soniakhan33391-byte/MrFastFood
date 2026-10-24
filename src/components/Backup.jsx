import React, { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store/Store.jsx'
import { load, save, STORAGE_KEYS } from '../utils/storage.js'

export default function Backup() {
  const store = useStore()
  const [backups, setBackups] = useState(() => load('mff_backups_list', []))
  const [autoBackup, setAutoBackup] = useState(() => load('mff_auto_backup', false))
  const [lastBackup, setLastBackup] = useState(() => load('mff_last_backup', null))

  // Auto Backup - Har 1 ghante me
  useEffect(() => {
    if (!autoBackup) return
    const id = setInterval(() => {
      doBackup(true)
    }, 60 * 60 * 1000) // 1 ghanta
    return () => clearInterval(id)
  }, [autoBackup])

  useEffect(() => save('mff_backups_list', backups), [backups])
  useEffect(() => save('mff_auto_backup', autoBackup), [autoBackup])
  useEffect(() => save('mff_last_backup', lastBackup), [lastBackup])

  const allData = useMemo(() => {
    return {
      version: 'Mr Fast Food v2',
      date: new Date().toISOString(),
      users: store.users,
      menu: store.menu,
      customers: store.customers,
      expenses: store.expenses,
      offers: store.offers,
      sales: store.sales,
      settings: store.settings,
      tables: load(STORAGE_KEYS.tables, {}),
      suppliers: load(STORAGE_KEYS.suppliers, []),
      stock: load(STORAGE_KEYS.stock, []),
      kitchen: load('mff_kitchen', []),
      damage: load('mff_damage', []),
      returns: load('mff_returns', []),
    }
  }, [store])

  function doBackup(isAuto = false) {
    const dataStr = JSON.stringify(allData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const fileName = `MFF_BACKUP_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`
    
    // Auto save to list
    const newBackup = { id: Date.now(), name: fileName, date: new Date().toISOString(), size: (blob.size/1024).toFixed(1)+' KB', isAuto }
    setBackups(b => [newBackup, ...b].slice(0, 50)) // 50 backup tak rakhega
    setLastBackup(new Date().toISOString())
    localStorage.setItem('mff_backup_' + newBackup.id, dataStr)

    if (!isAuto) {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      alert('Backup Export Ho Gaya - ' + fileName)
    }
  }

  function exportData() { doBackup(false) }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!confirm(`Backup Import Karna Hai? Date: ${data.date} - ${data.sales?.length||0} Sales - Ye aap ka purana data REPLACE kar dega!`)) return
        
        // Restore all
        Object.values(STORAGE_KEYS).forEach(key => {
          if (data[key.replace('mff_','')] || data[key]) {}
        })
        save(STORAGE_KEYS.users, data.users || [])
        save(STORAGE_KEYS.menu, data.menu || [])
        save(STORAGE_KEYS.customers, data.customers || [])
        save(STORAGE_KEYS.expenses, data.expenses || [])
        save(STORAGE_KEYS.offers, data.offers || [])
        save(STORAGE_KEYS.sales, data.sales || [])
        save(STORAGE_KEYS.settings, data.settings || {})
        save(STORAGE_KEYS.tables, data.tables || {})
        save(STORAGE_KEYS.suppliers, data.suppliers || [])
        save(STORAGE_KEYS.stock, data.stock || [])
        save('mff_kitchen', data.kitchen || [])
        save('mff_damage', data.damage || [])
        save('mff_returns', data.returns || [])
        
        alert('Import Success - Page Reload Hoga!')
        window.location.reload()
      } catch (err) { alert('File Galat Hai - ' + err.message) }
    }
    reader.readAsText(file)
  }

  function restoreFromList(id) {
    const dataStr = localStorage.getItem('mff_backup_' + id)
    if (!dataStr) { alert('Backup Data Nahi Mila'); return }
    const data = JSON.parse(dataStr)
    if (!confirm('Is Backup Ko Restore Karna Hai?')) return
    save(STORAGE_KEYS.users, data.users)
    save(STORAGE_KEYS.menu, data.menu)
    save(STORAGE_KEYS.customers, data.customers)
    save(STORAGE_KEYS.expenses, data.expenses)
    save(STORAGE_KEYS.sales, data.sales)
    save(STORAGE_KEYS.settings, data.settings)
    save(STORAGE_KEYS.tables, data.tables)
    window.location.reload()
  }

  function downloadListBackup(id) {
    const dataStr = localStorage.getItem('mff_backup_' + id)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backups.find(b=>b.id===id)?.name || 'backup.json'
    a.click()
  }

  return (
    <div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#ff6b35' }}>💾 Backup & Restore - Mr Fast Food</h2>
        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '6px' }}>Last Backup: {lastBackup ? new Date(lastBackup).toLocaleString() : 'Kabhi Nahi'} | Total Sales: {allData.sales?.length} | Menu: {allData.menu?.length}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #22c55e' }}>
          <h3>📤 Export Backup</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Sare data ka JSON file download hoga - Sales, Menu, Customers, Sab kuch!</p>
          <button onClick={exportData} style={{ width: '100%', padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', marginTop: '10px' }}>⬇️ Backup Download Karo</button>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #3b82f6' }}>
          <h3>📥 Import Backup</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Purana backup wapas load karo - Dosray PC pe data le jane ke liye best!</p>
          <input type="file" accept=".json" onChange={importData} style={{ width: '100%', marginTop: '10px' }} />
          <div style={{ background: '#fff3cd', padding: '8px', borderRadius: '6px', marginTop: '10px', fontSize: '11px' }}>⚠️ Import se purana data replace ho jayega - Pehle Export kar lo!</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${autoBackup?'#f59e0b':'#94a3b8'}` }}>
          <h3>🤖 Auto Backup</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Har 1 ghante me khud backup banega - Bhoolne ki tension khatam!</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoBackup} onChange={e=>setAutoBackup(e.target.checked)} style={{ width: '20px', height: '20px' }} />
            <span style={{ fontWeight: '800' }}>{autoBackup ? '✅ Auto Backup ON Hai' : '❌ Auto Backup OFF Hai'}</span>
          </label>
          <div style={{ fontSize: '11px', marginTop: '8px' }}>{autoBackup ? 'Har 1 ghante me background me backup banega' : 'ON karo to safe rahega'}</div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
        <h3>📋 Backup History ({backups.length})</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#0f172a', color: 'white' }}><th style={{ padding: '10px', textAlign: 'left' }}>Date</th><th>File Name</th><th>Size</th><th>Type</th><th>Action</th></tr></thead>
            <tbody>
              {backups.length===0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Koi Backup Nahi - Export Karo</td></tr>}
              {backups.map(b=>(
                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{new Date(b.date).toLocaleString()}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{b.name}</td>
                  <td style={{ padding: '10px' }}>{b.size}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '3px 8px', borderRadius: '10px', background: b.isAuto?'#fef3c7':'#dcfce7', fontSize: '10px', fontWeight: '700' }}>{b.isAuto?'AUTO':'MANUAL'}</span></td>
                  <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                    <button onClick={()=>downloadListBackup(b.id)} style={{ padding: '6px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Download</button>
                    <button onClick={()=>restoreFromList(b.id)} style={{ padding: '6px 10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Restore</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: '#e0f2f1', padding: '14px', borderRadius: '10px', marginTop: '16px', fontSize: '12px' }}>
        <b>💡 Dosray PC me kaise le jana hai:</b> 1) Is PC se Export Karo 2) File ko USB / WhatsApp se dosray PC pe bhejo 3) Dosray PC pe Reports ke baad ye Backup page kholo or Import Karo - Sara data chala jayega!
      </div>
    </div>
  )
}