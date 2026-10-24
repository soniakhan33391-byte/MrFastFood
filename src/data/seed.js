import { uid } from '../utils/storage'

export const seedUsers = [
  { id: uid(), name: 'Admin', username: 'admin', password: 'admin123', role: 'admin' },
  { id: uid(), name: 'Cashier', username: 'cashier', password: 'cashier123', role: 'cashier' },
]

export const categories = ['Burgers', 'Juices', 'Fries', 'Paratha', 'Shawarma', 'Drinks', 'Extras']

export const seedMenu = [
  { id: uid(), name: 'Zinger Burger', category: 'Burgers', price: 350, costPrice: 180, stock: 40, image: '' },
  { id: uid(), name: 'Beef Burger', category: 'Burgers', price: 450, costPrice: 220, stock: 30, image: '' },
  { id: uid(), name: 'Chicken Burger', category: 'Burgers', price: 300, costPrice: 150, stock: 50, image: '' },
  { id: uid(), name: 'Mango Juice', category: 'Juices', price: 200, costPrice: 80, stock: 25, image: '' },
  { id: uid(), name: 'Orange Juice', category: 'Juices', price: 180, costPrice: 70, stock: 20, image: '' },
  { id: uid(), name: 'French Fries (Reg)', category: 'Fries', price: 150, costPrice: 60, stock: 60, image: '' },
  { id: uid(), name: 'French Fries (Large)', category: 'Fries', price: 250, costPrice: 100, stock: 40, image: '' },
  { id: uid(), name: 'Chicken Paratha Roll', category: 'Paratha', price: 220, costPrice: 90, stock: 35, image: '' },
  { id: uid(), name: 'Beef Paratha', category: 'Paratha', price: 260, costPrice: 110, stock: 30, image: '' },
  { id: uid(), name: 'Chicken Shawarma', category: 'Shawarma', price: 250, costPrice: 100, stock: 45, image: '' },
  { id: uid(), name: 'Beef Shawarma', category: 'Shawarma', price: 300, costPrice: 120, stock: 40, image: '' },
  { id: uid(), name: 'Coke 345ml', category: 'Drinks', price: 120, costPrice: 80, stock: 100, image: '' },
  { id: uid(), name: 'Sprite 345ml', category: 'Drinks', price: 120, costPrice: 80, stock: 80, image: '' },
  { id: uid(), name: 'Mayo Sauce', category: 'Extras', price: 30, costPrice: 10, stock: 200, image: '' },
  { id: uid(), name: 'Cheese Slice', category: 'Extras', price: 50, costPrice: 25, stock: 150, image: '' },
]

export const tableNames = [
  ...Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`),
  'Takeaway', 'Delivery', 'Direct Bill',
]

export const expenseCategories = ['Electricity Bill', 'Shop Rent', 'Employee Salary', 'Printing', 'Other']
