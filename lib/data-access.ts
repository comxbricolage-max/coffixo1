/**
 * Unified Data Access Layer
 * 
 * This file re-exports all data access functions from db-queries.ts
 * and provides a single import point for all pages.
 * 
 * Usage in pages:
 *   import { getAllOrders, getProductsByCategory } from '@/lib/data-access'
 * 
 * This automatically uses MongoDB if connected, otherwise falls back to mock data.
 */

// Re-export all query functions
export {
  // Orders
  getAllOrders,
  getOrdersByStatus,
  getOrderById,
  getTodayOrders,
  getTodayRevenue,
  createOrder,
  updateOrder,
  
  // Products
  getAllProducts,
  getProductsByCategory,
  getProductById,
  
  // Categories
  getAllCategories,
  
  // Tables
  getAllTables,
  getTableByNumber,
  
  // Staff
  getAllStaff,
  
  // Clients
  getAllClients,
  
  // Raw Materials
  getAllRawMaterials,
  updateRawMaterialQuantity,
  
  // Direct Stock
  getAllDirectStock,
  
  // Suppliers
  getAllSuppliers,
  
  // Purchases
  getAllPurchases,
} from './db-queries'

// Re-export types for convenience
export type {
  Order,
  OrderItem,
  Product,
  Category,
  Table,
  Staff,
  Client,
  RawMaterial,
  DirectStock,
  Supplier,
  Purchase,
  BillOfMaterial,
  Restaurant,
} from './mock-data'

// Re-export mock data for backward compatibility (will be used as fallback)
export {
  mockOrders,
  mockProducts,
  mockCategories,
  mockTables,
  mockStaff,
  mockClients,
  mockRawMaterials,
  mockDirectStock,
  mockSuppliers,
  mockPurchases,
  mockRestaurant,
  mockAnalytics,
} from './mock-data'

// Re-export helper functions from mock-data (these are pure functions, not DB queries)
export {
  calculateOrderTimes,
  getStaffPerformance,
  type StaffPerformance,
} from './mock-data'

