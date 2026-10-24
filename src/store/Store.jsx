import React, { createContext, useContext, useEffect, useState } from 'react'
import { load, save, STORAGE_KEYS, uid } from '../utils/storage.js'
import { seedUsers, seedMenu, tableNames } from '../data/seed.js'

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [users, setUsers] = useState(() => load(STORAGE_KEYS.users, null) || seedUsers)
  const [menu, setMenu] = useState(() => load(STORAGE_KEYS.menu, null) || seedMenu)
  const [customers, setCustomers] = useState(() => load(STORAGE_KEYS.customers, []))
  const [expenses, setExpenses] = useState(() => load(STORAGE_KEYS.expenses, []))
  const [offers, setOffers] = useState(() => load(STORAGE_KEYS.offers, []))
  const [sales, setSales] = useState(() => load(STORAGE_KEYS.sales, []))
  const [settings, setSettings] = useState(() => load(STORAGE_KEYS.settings, { shopName: 'Mr Fast Food Mardan', address: 'Mardan' }))
  const [tables, setTables] = useState(() => {
    const saved = load(STORAGE_KEYS.tables, null)
    if (saved && !Array.isArray(saved) && typeof saved === 'object') return saved
    const init = {}
    tableNames.forEach(t => {
      init[t] = { items: [], status: 'Running', customerId: null, discount: 0, discountType: 'Rs', serviceCharge: 0, kitchenStatus: 'Empty', createdAt: null }
    })
    init['Takeaway'] = { items: [], status: 'Running', customerId: null, discount: 0, discountType: 'Rs', serviceCharge: 0, kitchenStatus: 'Empty', createdAt: null }
    init['Delivery'] = { items: [], status: 'Running', customerId: null, discount: 0, discountType: 'Rs', serviceCharge: 0, kitchenStatus: 'Empty', createdAt: null }
    return init
  })
  const [user, setUser] = useState(() => load('mff_session', null))
  const [activeTable, setActiveTable] = useState(() => tableNames[0])
  const [suppliers, setSuppliers] = useState(() => load(STORAGE_KEYS.suppliers, []))
  const [stockEntries, setStockEntries] = useState(() => load(STORAGE_KEYS.stock, []))
  const [kitchenOrders, setKitchenOrders] = useState(() => load('mff_kitchen', []))
  const [damageReturns, setDamageReturns] = useState(() => load('mff_damage', []))
  const [productReturns, setProductReturns] = useState(() => load('mff_returns', []))
  const [printData, setPrintData] = useState(null)

  useEffect(() => save(STORAGE_KEYS.users, users), [users])
  useEffect(() => save(STORAGE_KEYS.menu, menu), [menu])
  useEffect(() => save(STORAGE_KEYS.tables, tables), [tables])
  useEffect(() => save(STORAGE_KEYS.sales, sales), [sales])
  useEffect(() => save(STORAGE_KEYS.expenses, expenses), [expenses])
  useEffect(() => save(STORAGE_KEYS.customers, customers), [customers])
  useEffect(() => save(STORAGE_KEYS.offers, offers), [offers])
  useEffect(() => save(STORAGE_KEYS.settings, settings), [settings])
  useEffect(() => save(STORAGE_KEYS.suppliers, suppliers), [suppliers])
  useEffect(() => save(STORAGE_KEYS.stock, stockEntries), [stockEntries])
  useEffect(() => save('mff_session', user), [user])
  useEffect(() => save('mff_kitchen', kitchenOrders), [kitchenOrders])
  useEffect(() => save('mff_damage', damageReturns), [damageReturns])
  useEffect(() => save('mff_returns', productReturns), [productReturns])

  function printKOT(table, items) {
    setPrintData({ type: 'kot', table, items, time: new Date().toISOString() })
    setTimeout(() => { window.print() }, 300)
  }
  function printBill(sale) {
    setPrintData({ type: 'bill', sale })
    setTimeout(() => { window.print() }, 300)
  }

  function tableOrder(t) {
    return tables[t] || { items: [], status: 'Running', customerId: null, discount: 0, discountType: 'Rs', serviceCharge: 0, kitchenStatus: 'Empty' }
  }
  function addToTable(t, menuItem) {
    setTables(prev => {
      const cur = prev[t]
      if (!cur) return prev
      const ex = cur.items.find(i => i.menuId === menuItem.id)
      let items
      if (ex) items = cur.items.map(i => i.menuId === menuItem.id ? { ...i, qty: i.qty + 1 } : i)
      else items = [...cur.items, { lineId: uid(), menuId: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1 }]
      return { ...prev, [t]: { ...cur, items, kitchenStatus: 'Pending', createdAt: cur.createdAt || new Date().toISOString() } }
    })
  }
  function updateQty(t, lineId, delta) {
    setTables(prev => {
      const cur = prev[t]
      const items = cur.items.map(i => i.lineId === lineId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
      return { ...prev, [t]: { ...cur, items } }
    })
  }
  function removeFromTable(t, lineId) {
    setTables(prev => {
      const cur = prev[t]
      return { ...prev, [t]: { ...cur, items: cur.items.filter(i => i.lineId !== lineId) } }
    })
  }
  function clearTable(t) {
    setTables(prev => ({ ...prev, [t]: { items: [], status: 'Running', customerId: null, discount: 0, discountType: 'Rs', serviceCharge: 0, kitchenStatus: 'Empty', createdAt: null } }))
  }
  function setTableCustomer(t, id) { setTables(prev => ({ ...prev, [t]: { ...prev[t], customerId: id } })) }
  function setTableDiscount(t, d, type) { setTables(prev => ({ ...prev, [t]: { ...prev[t], discount: d, discountType: type } })) }
  function setTableServiceCharge(t, sc) { setTables(prev => ({ ...prev, [t]: { ...prev[t], serviceCharge: sc } })) }
  function calcTotal(order) {
    const subtotal = (order?.items || []).reduce((s, i) => s + i.price * i.qty, 0)
    let disc = Number(order?.discount || 0)
    if (order?.discountType === '%') disc = subtotal * disc / 100
    const sc = Number(order?.serviceCharge || 0)
    const total = Math.max(0, subtotal - disc + sc)
    return { subtotal, discountAmount: disc, serviceCharge: sc, total }
  }
  function checkout(table, method, paidAmount, orderType = 'Dine-In') {
    const order = tableOrder(table)
    const totals = calcTotal(order)
    const sale = { 
      id: uid(), 
      date: new Date().toISOString(), 
      table, 
      items: order.items, 
      ...totals, 
      method, 
      paid: Number(paidAmount || 0), 
      customerId: order.customerId,
      orderType: orderType || 'Dine-In'
    }
    setSales(s => [...s, sale])
    setMenu(prevMenu => prevMenu.map(mItem => {
      const soldItem = order.items.find(i => i.menuId === mItem.id)
      if (soldItem) {
        const currentStock = Number(mItem.stock || 0)
        const newStock = Math.max(0, currentStock - soldItem.qty)
        return { ...mItem, stock: newStock }
      }
      return mItem
    }))
    clearTable(table)
    setKitchenOrders(k => k.filter(x => x.table !== table))
    return sale
  }

  // --- ONLINE ORDER FIX - YE NEW FUNCTION ADD KIYA HAI ---
  function addOnlineSale(order){
    const sale = { 
      id: uid(), 
      billNo: `MFF-${String(sales.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString(), 
      table: order.tableNo || order.table || 'T1', 
      items: order.items.map(i => ({
        lineId: uid(),
        menuId: i.menuId || i.id,
        name: i.name,
        price: i.price,
        qty: i.qty || 1
      })), 
      subtotal: order.total,
      discountAmount: 0,
      serviceCharge: 0,
      total: order.total, 
      method: 'Cash', 
      paid: order.total,
      customerId: null,
      orderType: 'Online',
      customerName: order.customerName || 'Online Customer'
    }
    setSales(s => [...s, sale])
    setMenu(prevMenu => prevMenu.map(mItem => {
      const soldItem = order.items.find(i => i.menuId === mItem.id || i.id === mItem.id || i.name === mItem.name)
      if (soldItem) {
        return { ...mItem, stock: Math.max(0, Number(mItem.stock || 0) - (soldItem.qty||1)) }
      }
      return mItem
    }))
    return sale
  }

  function addToKitchen(table, order, orderType) {
    const kot = { id: uid(), table, type: orderType, items: [...order.items], time: new Date().toISOString(), status: 'Pending' }
    setKitchenOrders(prev => [...prev, kot])
    setTables(prev => ({ ...prev, [table]: { ...prev[table], kitchenStatus: 'Pending', createdAt: prev[table]?.createdAt || new Date().toISOString() } }))
  }
  function updateKitchenStatus(table, status) {
    setTables(prev => ({ ...prev, [table]: { ...prev[table], kitchenStatus: status } }))
    setKitchenOrders(prev => prev.map(k => k.table === table ? { ...k, status } : k))
  }
  function login(u, p) { const f = users.find(x => x.username === u && x.password === p); if (f) { setUser(f); return true } return false }
  function logout() { setUser(null) }
  function isAdmin() { return user?.role === 'admin' }
  function addMenuItem(i) { setMenu(m => [...m, { ...i, id: uid() }]) }
  function updateMenuItem(id, patch) { setMenu(m => m.map(x => x.id === id ? { ...x, ...patch } : x)) }
  function deleteMenuItem(id) { setMenu(m => m.filter(x => x.id !== id)) }
  function addCustomer(c) { setCustomers(x => [...x, { ...c, id: uid() }]) }
  function updateCustomer(id, patch) { setCustomers(x => x.map(c => c.id === id ? { ...c, ...patch } : c)) }
  function deleteCustomer(id) { setCustomers(x => x.filter(c => c.id !== id)) }
  function payCustomer(id, amt) { setCustomers(x => x.map(c => c.id === id ? { ...c, totalPaid: (c.totalPaid || 0) + Number(amt), due: Math.max(0, (c.due || 0) - Number(amt)) } : c)) }
  function addExpense(e) { setExpenses(x => [...x, { ...e, id: uid() }]) }
  function deleteExpense(id) { setExpenses(x => x.filter(e => e.id !== id)) }
  function addOffer(o) { setOffers(x => [...x, { ...o, id: uid() }]) }
  function updateOffer(id, patch) { setOffers(x => x.map(o => o.id === id ? { ...o, ...patch } : o)) }
  function deleteOffer(id) { setOffers(x => x.filter(o => o.id !== id)) }
  function todayOffer() { const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; return offers.find(o => o.active && (o.weekday === names[new Date().getDay()] || o.weekday === 'Everyday')) }
  function addUser(u) { setUsers(x => [...x, { ...u, id: uid() }]) }
  function updateUser(id, patch) { setUsers(x => x.map(u => u.id === id ? { ...u, ...patch } : u)) }
  function deleteUser(id) { setUsers(x => x.filter(u => u.id !== id)) }
  function addStockEntry(e) { setStockEntries(s => [...s, e]) }
  function deleteStockEntry(id) { setStockEntries(s => s.filter(x => x.id !== id)) }
  function addSupplier(s) { setSuppliers(x => [...x, s]) }
  function updateSupplier(id, p) { setSuppliers(x => x.map(s => s.id === id ? { ...s, ...p } : s)) }
  function deleteSupplier(id) { setSuppliers(x => x.filter(s => s.id !== id)) }
  function paySupplier(id, amt) { setSuppliers(x => x.map(s => s.id === id ? { ...s, totalPaid: (s.totalPaid || 0) + Number(amt) } : s)) }
  function setTableStatus(t, s) { setTables(prev => ({ ...prev, [t]: { ...prev[t], status: s } })) }
  function addDamageReturn(e) { setDamageReturns(s => [...s, e]) }
  function deleteDamageReturn(id) { setDamageReturns(s => s.filter(x => x.id !== id)) }
  function addProductReturn(e) { setProductReturns(s => [...s, e]) }
  function deleteProductReturn(id) { setProductReturns(s => s.filter(x => x.id !== id)) }

  const value = { 
    users, user, login, logout, isAdmin, 
    menu, addMenuItem, updateMenuItem, deleteMenuItem, 
    tables, tableOrder, activeTable, setActiveTable, addToTable, updateQty, removeFromTable, clearTable, setTableCustomer, setTableDiscount, setTableServiceCharge, setTableStatus, calcTotal, checkout, addOnlineSale,
    customers, addCustomer, updateCustomer, deleteCustomer, payCustomer, 
    expenses, addExpense, deleteExpense, 
    offers, addOffer, updateOffer, deleteOffer, todayOffer, 
    sales, settings, setSettings, 
    stockEntries, addStockEntry, deleteStockEntry, 
    suppliers, addSupplier, updateSupplier, deleteSupplier, paySupplier, 
    addUser, updateUser, deleteUser, 
    tableNames, kitchenOrders, addToKitchen, updateKitchenStatus, 
    damageReturns, addDamageReturn, deleteDamageReturn, 
    productReturns, addProductReturn, deleteProductReturn,
    printData, setPrintData, printKOT, printBill
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() { return useContext(StoreCtx) }