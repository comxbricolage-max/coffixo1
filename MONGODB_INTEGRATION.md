# 🗄️ MongoDB Integration Guide

This guide explains how MongoDB has been integrated into the Caffixo application and how to use it.

## 📋 Overview

The application now supports **both MongoDB and demo mode** seamlessly:

- **With MongoDB**: All data is stored and retrieved from MongoDB Atlas
- **Without MongoDB**: Falls back to mock data automatically (demo mode)

## 🏗️ Architecture

### Data Access Layers

1. **`lib/db-queries.ts`** - MongoDB query functions with automatic fallback
2. **`lib/data-access.ts`** - Unified export point for all data access
3. **`lib/mock-data.ts`** - Mock data (used as fallback)
4. **`lib/db-collections.ts`** - MongoDB collection accessors

### How It Works

```typescript
// All query functions check MongoDB connection first
export async function getAllOrders(): Promise<Order[]> {
  if (!isMongoConnected()) {
    return mockOrders  // Fallback to mock data
  }
  
  // Query MongoDB
  const collection = await getOrdersCollection()
  const orders = await collection.find({}).toArray()
  return orders
}
```

## 🚀 Setup

### 1. Configure MongoDB Connection

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://comx2025:YOUR_PASSWORD@caffixo.m1zvqsz.mongodb.net/?appName=caffixo
MONGODB_DB_NAME=caffexo
```

### 2. Seed the Database

Run the seed script to populate MongoDB with initial data:

```bash
npm run seed
# or
npx tsx scripts/seed-db.ts
```

This will:
- Create demo user (email: `demo@caffixo.com`, password: `demo123`)
- Seed all collections with mock data
- Create necessary indexes

### 3. Verify Connection

The app automatically detects MongoDB connection. If connected, you'll see data from MongoDB. If not, it falls back to mock data.

## 📝 Usage in Pages

### Before (Using Mock Data Directly)

```typescript
import { mockOrders, mockProducts } from '@/lib/mock-data'

export default function OrdersPage() {
  const orders = mockOrders  // Static mock data
  // ...
}
```

### After (Using Data Access Layer)

```typescript
import { getAllOrders, getAllProducts } from '@/lib/data-access'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  
  useEffect(() => {
    async function loadData() {
      const data = await getAllOrders()  // MongoDB or mock
      setOrders(data)
    }
    loadData()
  }, [])
  
  // ...
}
```

### For Client Components (Recommended Pattern)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getAllOrders, type Order } from '@/lib/data-access'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAllOrders()
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>{order.id}</div>
      ))}
    </div>
  )
}
```

## 🔄 Migration Checklist

To migrate a page from mock data to MongoDB:

1. ✅ Change imports from `@/lib/mock-data` to `@/lib/data-access`
2. ✅ Replace static `mockOrders` with `await getAllOrders()`
3. ✅ Use `useState` + `useEffect` for async data loading (client components)
4. ✅ Add loading states
5. ✅ Handle errors gracefully
6. ✅ Test with and without MongoDB connection

## 📦 Available Functions

### Orders
- `getAllOrders()` - Get all orders
- `getOrdersByStatus(status)` - Filter by status
- `getOrderById(id)` - Get single order
- `getTodayOrders()` - Get today's orders
- `getTodayRevenue()` - Calculate today's revenue
- `createOrder(orderData)` - Create new order
- `updateOrder(id, updates)` - Update order

### Products
- `getAllProducts()` - Get all products
- `getProductsByCategory(categoryId)` - Filter by category
- `getProductById(id)` - Get single product

### Categories
- `getAllCategories()` - Get all categories

### Tables
- `getAllTables()` - Get all tables
- `getTableByNumber(number)` - Find table by number

### Staff
- `getAllStaff()` - Get all staff members

### Clients
- `getAllClients()` - Get all clients

### Raw Materials
- `getAllRawMaterials()` - Get all raw materials
- `updateRawMaterialQuantity(id, quantity)` - Update quantity

### Direct Stock
- `getAllDirectStock()` - Get all direct stock items

### Suppliers
- `getAllSuppliers()` - Get all suppliers

### Purchases
- `getAllPurchases()` - Get all purchases

## 🧪 Testing

### Test with MongoDB
1. Set `MONGODB_URI` in `.env.local`
2. Run `npm run seed` to populate data
3. Start app: `npm run dev`
4. Data should come from MongoDB

### Test without MongoDB (Demo Mode)
1. Remove or comment `MONGODB_URI` in `.env.local`
2. Start app: `npm run dev`
3. Data should come from mock data
4. App should work exactly the same

## 🔍 Debugging

### Check MongoDB Connection

```typescript
import { isMongoConnected } from '@/lib/mongodb'

console.log('MongoDB connected:', isMongoConnected())
```

### Check Data Source

All query functions automatically log to console if there's an error. Check browser console for:
- `Error fetching orders:` - MongoDB query failed, using mock data
- No errors - Using MongoDB successfully

## 📚 Next Steps

1. **Migrate Pages**: Update all dashboard pages to use `data-access.ts`
2. **Add More Queries**: Add more specific queries as needed
3. **Optimize**: Add caching, pagination, etc.
4. **Real-time**: Consider adding real-time updates with MongoDB Change Streams

## ⚠️ Important Notes

- **No Breaking Changes**: All existing mock data imports still work
- **Automatic Fallback**: If MongoDB fails, app uses mock data automatically
- **Type Safety**: All functions are fully typed
- **Error Handling**: All queries have try-catch with fallback

## 🎯 Example: Complete Page Migration

### Before
```typescript
import { mockOrders, type Order } from '@/lib/mock-data'

export default function OrdersPage() {
  const orders = mockOrders
  return <div>{orders.length} orders</div>
}
```

### After
```typescript
'use client'

import { useState, useEffect } from 'react'
import { getAllOrders, type Order } from '@/lib/data-access'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getAllOrders().then(data => {
      setOrders(data)
      setLoading(false)
    })
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return <div>{orders.length} orders</div>
}
```

---

**Questions?** Check the code in `lib/db-queries.ts` for implementation details.

