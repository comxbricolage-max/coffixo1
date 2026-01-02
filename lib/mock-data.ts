// 🧪 MOCK DATA STORE
// TODO: Replace with MongoDB queries when database is connected
// This file contains all mock data structured exactly like real database data

export interface Order {
  id: string
  tableNumber: string
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
  total: number
  // Lifecycle timestamps
  createdAt: Date // QR submission time
  acceptedAt?: Date // Reception acceptance time
  startedAt?: Date // Kitchen start time
  readyAt?: Date // Ready for serving time
  servedAt?: Date // Served to customer time
  completedAt?: Date // Payment completed time
  // Staff assignments
  acceptedBy?: string // Staff ID who accepted
  preparedBy?: string // Staff ID who prepared (kitchen)
  servedBy?: string // Staff ID who served (waiter)
  // Calculated times (in minutes)
  preparationTime?: number // startedAt - acceptedAt
  serviceTime?: number // servedAt - readyAt
  totalCycleTime?: number // servedAt - createdAt
  notes?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  notes?: string
  customization?: {
    size?: 'small' | 'medium' | 'large'
    extras?: string[]
    specialInstructions?: string
  }
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  image?: string
  available: boolean
  createdAt: Date
  // Inventory relationship
  stockType?: 'direct' | 'ingredient' // How this product is stocked
  directStockId?: string // If using direct stock
  ingredientRecipe?: ProductIngredient[] // If using ingredients (DEPRECATED)
  // BOM (Bill of Materials) - Explicit raw material requirements
  bom?: BillOfMaterial[] // Raw materials required to make this product
  costPrice?: number // Calculated cost (direct stock cost or ingredient cost)
  profitMargin?: number // Calculated profit margin
}

// Direct Stock (Finished Products)
export interface DirectStock {
  id: string
  productId: string // Links to Product
  productName: string
  quantity: number
  unitCost: number // Cost per unit
  sellingPrice: number // Selling price
  margin: number // Calculated margin percentage
  lowStockThreshold: number
  unit: string // e.g., 'bottle', 'can', 'piece'
  supplierId?: string
  lastRestocked?: Date
  createdAt: Date
}

// Raw Material Stock (Ingredients)
export interface RawMaterial {
  id: string
  name: string
  unit: 'kg' | 'liter' | 'piece' | 'gram' | 'ml'
  currentQuantity: number
  costPerUnit: number
  supplierId: string
  expirationDate?: Date
  lowStockThreshold: number
  category?: string // e.g., 'dairy', 'produce', 'beverages'
  createdAt: Date
}

// Product-Ingredient Relationship (DEPRECATED - Use consumption-engine.ts)
// This is kept for backward compatibility but quantities are now inferred statistically
export interface ProductIngredient {
  ingredientId: string // RawMaterial ID
  ingredientName: string
  quantity: number // DEPRECATED: Now inferred by consumption engine
  unit: string // Unit of measurement
}

// Bill of Materials (BOM) - Explicit raw material requirements per product
export interface BillOfMaterial {
  rawMaterialId: string // RawMaterial ID
  quantityRequiredPerUnit: number // Required quantity per product unit
  unit: string // Unit of measurement (matches raw material unit)
}

// Inventory Count Snapshot
export interface InventoryCount {
  id: string
  rawMaterialId: string
  countedQuantity: number
  previousQuantity: number
  countedAt: Date
  countedBy?: string // Staff ID
  notes?: string
}

// Supplier
export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  createdAt: Date
}

// Purchase Entry
export interface Purchase {
  id: string
  supplierId: string
  supplierName: string
  type: 'direct_stock' | 'raw_material'
  items: PurchaseItem[]
  totalCost: number
  purchaseDate: Date
  invoiceNumber?: string
  notes?: string
  createdAt: Date
}

export interface PurchaseItem {
  id: string
  directStockId?: string // If purchasing direct stock
  rawMaterialId?: string // If purchasing raw material
  itemName: string
  quantity: number
  unitCost: number
  totalCost: number
  unit: string
}

export interface Category {
  id: string
  name: string
  description?: string
  order: number
  icon?: string
}

export interface Table {
  id: string
  number: string
  qrCode: string
  status: 'available' | 'occupied'
  currentOrderId?: string
}

export interface Staff {
  id: string
  name: string
  email: string
  role?: 'owner' | 'kitchen' | 'waiter' | 'cashier' // Optional - legacy support, use flexible-staff-system.ts for new system
  active: boolean
  onShift: boolean
  createdAt: Date
  // Note: Services are now managed via flexible-staff-system.ts (many-to-many)
}

export interface Client {
  id: string
  name?: string
  email?: string
  phone?: string
  favoriteItems: string[]
  totalOrders: number
  totalSpent: number
  lastOrderAt?: Date
}

export interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  currency: string
  language: string
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }
  logo?: string
}

// Mock Restaurant Data
export const mockRestaurant: Restaurant = {
  id: 'rest-1',
  name: 'Caffixo Café',
  description: 'A warm, modern café serving artisanal coffee and fresh food',
  address: '123 Main Street, City, Country',
  phone: '+1 234 567 8900',
  email: 'hello@caffixo.com',
  currency: 'USD',
  language: 'en',
  openingHours: {
    monday: { open: '07:00', close: '20:00' },
    tuesday: { open: '07:00', close: '20:00' },
    wednesday: { open: '07:00', close: '20:00' },
    thursday: { open: '07:00', close: '20:00' },
    friday: { open: '07:00', close: '21:00' },
    saturday: { open: '08:00', close: '21:00' },
    sunday: { open: '09:00', close: '19:00' },
  },
}

// Mock Categories
export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Coffee', description: 'Hot & Cold Coffee', order: 1, icon: '☕' },
  { id: 'cat-2', name: 'Food', description: 'Breakfast & Lunch', order: 2, icon: '🥐' },
  { id: 'cat-3', name: 'Desserts', description: 'Sweet Treats', order: 3, icon: '🍰' },
  { id: 'cat-4', name: 'Beverages', description: 'Drinks & Juices', order: 4, icon: '🥤' },
]

// Mock Products - Enhanced with more items
export const mockProducts: Product[] = [
  // Coffee
  { 
    id: 'prod-1', 
    name: 'Espresso', 
    description: 'Strong Italian coffee shot', 
    price: 3.50, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.01, unit: 'kg' } // 10g coffee beans per espresso
    ]
  },
  { 
    id: 'prod-2', 
    name: 'Cappuccino', 
    description: 'Espresso with steamed milk foam', 
    price: 4.50, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.02, unit: 'kg' }, // 20g coffee beans
      { rawMaterialId: 'ingredient-2', quantityRequiredPerUnit: 0.15, unit: 'liter' } // 150ml milk
    ]
  },
  { 
    id: 'prod-3', 
    name: 'Latte', 
    description: 'Espresso with lots of steamed milk', 
    price: 4.75, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.02, unit: 'kg' }, // 20g coffee beans
      { rawMaterialId: 'ingredient-2', quantityRequiredPerUnit: 0.20, unit: 'liter' } // 200ml milk
    ]
  },
  { 
    id: 'prod-4', 
    name: 'Americano', 
    description: 'Espresso with hot water', 
    price: 3.75, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.01, unit: 'kg' } // 10g coffee beans
    ]
  },
  { 
    id: 'prod-13', 
    name: 'Flat White', 
    description: 'Double espresso with microfoam', 
    price: 4.50, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.03, unit: 'kg' }, // 30g coffee beans (double shot)
      { rawMaterialId: 'ingredient-2', quantityRequiredPerUnit: 0.18, unit: 'liter' } // 180ml milk
    ]
  },
  { 
    id: 'prod-14', 
    name: 'Mocha', 
    description: 'Espresso with chocolate and milk', 
    price: 5.25, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.02, unit: 'kg' }, // 20g coffee beans
      { rawMaterialId: 'ingredient-2', quantityRequiredPerUnit: 0.20, unit: 'liter' } // 200ml milk
    ]
  },
  { 
    id: 'prod-15', 
    name: 'Iced Coffee', 
    description: 'Cold brew over ice', 
    price: 4.00, 
    categoryId: 'cat-1', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.02, unit: 'kg' } // 20g coffee beans
    ]
  },
  // Food
  { 
    id: 'prod-5', 
    name: 'Croissant', 
    description: 'Buttery French pastry', 
    price: 3.00, 
    categoryId: 'cat-2', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-5', quantityRequiredPerUnit: 0.15, unit: 'kg' }, // 150g flour
      { rawMaterialId: 'ingredient-6', quantityRequiredPerUnit: 0.05, unit: 'kg' } // 50g sugar
    ]
  },
  { 
    id: 'prod-6', 
    name: 'Avocado Toast', 
    description: 'Sourdough with smashed avocado', 
    price: 8.50, 
    categoryId: 'cat-2', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-3', quantityRequiredPerUnit: 0.2, unit: 'kg' }, // 200g avocado (bananas used as proxy)
      { rawMaterialId: 'ingredient-5', quantityRequiredPerUnit: 0.1, unit: 'kg' } // 100g bread (flour)
    ]
  },
  { 
    id: 'prod-7', 
    name: 'Caesar Salad', 
    description: 'Fresh romaine with parmesan', 
    price: 9.50, 
    categoryId: 'cat-2', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-4', quantityRequiredPerUnit: 0.3, unit: 'kg' } // 300g tomatoes/lettuce
    ]
  },
  { 
    id: 'prod-8', 
    name: 'Club Sandwich', 
    description: 'Triple decker with turkey & bacon', 
    price: 12.00, 
    categoryId: 'cat-2', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-5', quantityRequiredPerUnit: 0.2, unit: 'kg' }, // 200g bread (flour)
      { rawMaterialId: 'ingredient-4', quantityRequiredPerUnit: 0.15, unit: 'kg' } // 150g vegetables (tomatoes)
    ]
  },
  { id: 'prod-16', name: 'Eggs Benedict', description: 'Poached eggs on English muffin', price: 11.50, categoryId: 'cat-2', available: true, createdAt: new Date() },
  { id: 'prod-17', name: 'Quiche Lorraine', description: 'French savory tart', price: 8.00, categoryId: 'cat-2', available: true, createdAt: new Date() },
  // Desserts
  { 
    id: 'prod-9', 
    name: 'Chocolate Cake', 
    description: 'Rich chocolate layer cake', 
    price: 6.50, 
    categoryId: 'cat-3', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-5', quantityRequiredPerUnit: 0.25, unit: 'kg' }, // 250g flour
      { rawMaterialId: 'ingredient-6', quantityRequiredPerUnit: 0.15, unit: 'kg' } // 150g sugar
    ]
  },
  { 
    id: 'prod-10', 
    name: 'Tiramisu', 
    description: 'Classic Italian dessert', 
    price: 7.00, 
    categoryId: 'cat-3', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-1', quantityRequiredPerUnit: 0.01, unit: 'kg' }, // 10g coffee
      { rawMaterialId: 'ingredient-6', quantityRequiredPerUnit: 0.1, unit: 'kg' } // 100g sugar
    ]
  },
  { id: 'prod-18', name: 'Cheesecake', description: 'New York style cheesecake', price: 6.75, categoryId: 'cat-3', available: true, createdAt: new Date() },
  { id: 'prod-19', name: 'Apple Pie', description: 'Homemade with cinnamon', price: 5.50, categoryId: 'cat-3', available: true, createdAt: new Date() },
  // Beverages
  { 
    id: 'prod-11', 
    name: 'Fresh Orange Juice', 
    description: 'Freshly squeezed', 
    price: 4.00, 
    categoryId: 'cat-4', 
    available: true, 
    createdAt: new Date(),
    bom: [
      { rawMaterialId: 'ingredient-7', quantityRequiredPerUnit: 0.25, unit: 'liter' } // 250ml orange juice concentrate
    ]
  },
  { id: 'prod-12', name: 'Iced Tea', description: 'Refreshing iced tea', price: 3.50, categoryId: 'cat-4', available: true, createdAt: new Date() },
  { id: 'prod-20', name: 'Lemonade', description: 'Fresh lemonade', price: 3.75, categoryId: 'cat-4', available: true, createdAt: new Date() },
  { id: 'prod-21', name: 'Smoothie', description: 'Mixed berry smoothie', price: 5.50, categoryId: 'cat-4', available: true, createdAt: new Date() },
]

// Mock Tables
export const mockTables: Table[] = [
  { id: 'table-1', number: '1', qrCode: 'table-1-qr', status: 'available' },
  { id: 'table-2', number: '2', qrCode: 'table-2-qr', status: 'occupied', currentOrderId: 'order-1' },
  { id: 'table-3', number: '3', qrCode: 'table-3-qr', status: 'available' },
  { id: 'table-4', number: '4', qrCode: 'table-4-qr', status: 'occupied', currentOrderId: 'order-2' },
  { id: 'table-5', number: '5', qrCode: 'table-5-qr', status: 'available' },
  { id: 'table-6', number: '6', qrCode: 'table-6-qr', status: 'occupied', currentOrderId: 'order-3' },
  { id: 'table-7', number: '7', qrCode: 'table-7-qr', status: 'available' },
  { id: 'table-8', number: '8', qrCode: 'table-8-qr', status: 'occupied', currentOrderId: 'order-5' },
]

// Mock Orders - Enhanced with complete lifecycle tracking
const now = Date.now()
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    tableNumber: '2',
    items: [
      { id: 'item-1', productId: 'prod-2', productName: 'Cappuccino', quantity: 2, price: 4.50, customization: { size: 'large', extras: ['Extra shot'] } },
      { id: 'item-2', productId: 'prod-5', productName: 'Croissant', quantity: 1, price: 3.00 },
    ],
    status: 'preparing',
    total: 12.00,
    createdAt: new Date(now - 15 * 60000), // 15 minutes ago
    acceptedAt: new Date(now - 14 * 60000), // 14 minutes ago
    startedAt: new Date(now - 13 * 60000), // 13 minutes ago
    acceptedBy: 'staff-3', // John Waiter
    preparedBy: 'staff-2', // Maria Kitchen
    preparationTime: 1, // 1 minute from accepted to started
    notes: 'Extra hot cappuccino',
  },
  {
    id: 'order-2',
    tableNumber: '4',
    items: [
      { id: 'item-3', productId: 'prod-8', productName: 'Club Sandwich', quantity: 1, price: 12.00 },
      { id: 'item-4', productId: 'prod-11', productName: 'Fresh Orange Juice', quantity: 2, price: 4.00 },
    ],
    status: 'pending',
    total: 20.00,
    createdAt: new Date(now - 5 * 60000), // 5 minutes ago
    // Not yet accepted
  },
  {
    id: 'order-3',
    tableNumber: '6',
    items: [
      { id: 'item-5', productId: 'prod-1', productName: 'Espresso', quantity: 1, price: 3.50 },
      { id: 'item-6', productId: 'prod-9', productName: 'Chocolate Cake', quantity: 1, price: 6.50 },
    ],
    status: 'ready',
    total: 10.00,
    createdAt: new Date(now - 30 * 60000), // 30 minutes ago
    acceptedAt: new Date(now - 29 * 60000),
    startedAt: new Date(now - 28 * 60000),
    readyAt: new Date(now - 25 * 60000), // 25 minutes ago
    acceptedBy: 'staff-3',
    preparedBy: 'staff-5', // Tom Kitchen
    preparationTime: 3, // 3 minutes prep time
  },
  {
    id: 'order-4',
    tableNumber: '1',
    items: [
      { id: 'item-7', productId: 'prod-7', productName: 'Caesar Salad', quantity: 1, price: 9.50 },
    ],
    status: 'served',
    total: 9.50,
    createdAt: new Date(now - 2 * 3600000), // 2 hours ago
    acceptedAt: new Date(now - 2 * 3600000 + 1 * 60000),
    startedAt: new Date(now - 2 * 3600000 + 2 * 60000),
    readyAt: new Date(now - 2 * 3600000 + 8 * 60000),
    servedAt: new Date(now - 1.5 * 3600000),
    acceptedBy: 'staff-3',
    preparedBy: 'staff-2',
    servedBy: 'staff-3',
    preparationTime: 6, // 6 minutes
    serviceTime: 2, // 2 minutes from ready to served
    totalCycleTime: 30, // 30 minutes total
  },
  {
    id: 'order-5',
    tableNumber: '8',
    items: [
      { id: 'item-8', productId: 'prod-3', productName: 'Latte', quantity: 2, price: 4.75, customization: { size: 'medium' } },
      { id: 'item-9', productId: 'prod-6', productName: 'Avocado Toast', quantity: 1, price: 8.50 },
    ],
    status: 'pending',
    total: 18.00,
    createdAt: new Date(now - 2 * 60000), // 2 minutes ago
    // Not yet accepted
  },
  {
    id: 'order-6',
    tableNumber: '3',
    items: [
      { id: 'item-10', productId: 'prod-14', productName: 'Mocha', quantity: 1, price: 5.25 },
      { id: 'item-11', productId: 'prod-10', productName: 'Tiramisu', quantity: 1, price: 7.00 },
    ],
    status: 'completed',
    total: 12.25,
    createdAt: new Date(now - 3 * 3600000),
    acceptedAt: new Date(now - 3 * 3600000 + 1 * 60000),
    startedAt: new Date(now - 3 * 3600000 + 2 * 60000),
    readyAt: new Date(now - 3 * 3600000 + 10 * 60000),
    servedAt: new Date(now - 3 * 3600000 + 12 * 60000),
    completedAt: new Date(now - 2.5 * 3600000),
    acceptedBy: 'staff-3',
    preparedBy: 'staff-2',
    servedBy: 'staff-3',
    preparationTime: 8,
    serviceTime: 2,
    totalCycleTime: 12,
  },
]

// Mock Staff - Enhanced with roles
export const mockStaff: Staff[] = [
  { id: 'staff-1', name: 'Demo Owner', email: 'demo@caffixo.com', role: 'owner', active: true, onShift: true, createdAt: new Date() },
  { id: 'staff-2', name: 'Maria Kitchen', email: 'maria@caffixo.com', role: 'kitchen', active: true, onShift: true, createdAt: new Date() },
  { id: 'staff-3', name: 'John Waiter', email: 'john@caffixo.com', role: 'waiter', active: true, onShift: true, createdAt: new Date() },
  { id: 'staff-4', name: 'Sarah Cashier', email: 'sarah@caffixo.com', role: 'cashier', active: true, onShift: false, createdAt: new Date() },
  { id: 'staff-5', name: 'Tom Kitchen', email: 'tom@caffixo.com', role: 'kitchen', active: true, onShift: true, createdAt: new Date() },
]

// Mock Clients
export const mockClients: Client[] = [
  { id: 'client-1', name: 'Regular Customer', email: 'customer@example.com', totalOrders: 15, totalSpent: 245.50, favoriteItems: ['prod-2', 'prod-5'], lastOrderAt: new Date() },
  { id: 'client-2', name: 'Coffee Lover', totalOrders: 8, totalSpent: 120.00, favoriteItems: ['prod-1', 'prod-2'], lastOrderAt: new Date() },
  { id: 'client-3', name: 'Morning Regular', email: 'morning@example.com', totalOrders: 22, totalSpent: 312.75, favoriteItems: ['prod-2', 'prod-5', 'prod-6'], lastOrderAt: new Date() },
]

// Analytics Mock Data - Enhanced
export const mockAnalytics = {
  todayOrders: 24,
  todayRevenue: 342.50,
  avgOrderValue: 14.27,
  weekOrders: 156,
  weekRevenue: 2340.00,
  monthOrders: 642,
  monthRevenue: 9876.50,
  bestSellingProducts: [
    { productId: 'prod-2', name: 'Cappuccino', sales: 45, revenue: 202.50 },
    { productId: 'prod-5', name: 'Croissant', sales: 38, revenue: 114.00 },
    { productId: 'prod-1', name: 'Espresso', sales: 32, revenue: 112.00 },
    { productId: 'prod-3', name: 'Latte', sales: 28, revenue: 133.00 },
    { productId: 'prod-8', name: 'Club Sandwich', sales: 22, revenue: 264.00 },
  ],
  peakHours: [
    { hour: '07:00', orders: 8, revenue: 95.00 },
    { hour: '08:00', orders: 12, revenue: 142.50 },
    { hour: '09:00', orders: 18, revenue: 215.00 },
    { hour: '10:00', orders: 15, revenue: 180.00 },
    { hour: '11:00', orders: 14, revenue: 168.00 },
    { hour: '12:00', orders: 25, revenue: 312.50 },
    { hour: '13:00', orders: 22, revenue: 275.00 },
    { hour: '14:00', orders: 16, revenue: 192.00 },
    { hour: '15:00', orders: 12, revenue: 144.00 },
    { hour: '16:00', orders: 10, revenue: 120.00 },
    { hour: '17:00', orders: 15, revenue: 180.00 },
    { hour: '18:00', orders: 13, revenue: 156.00 },
  ],
  salesByDay: [
    { day: 'Mon', orders: 42, revenue: 598.50 },
    { day: 'Tue', orders: 38, revenue: 542.00 },
    { day: 'Wed', orders: 45, revenue: 641.25 },
    { day: 'Thu', orders: 41, revenue: 584.75 },
    { day: 'Fri', orders: 52, revenue: 741.00 },
    { day: 'Sat', orders: 48, revenue: 684.00 },
    { day: 'Sun', orders: 35, revenue: 499.25 },
  ],
  tableTurnover: {
    avgTime: 45, // minutes
    today: 3.2,
    week: 3.5,
  },
}

// Helper functions to get data
export function getOrdersByStatus(status: Order['status']): Order[] {
  return mockOrders.filter(order => order.status === status)
}

export function getProductsByCategory(categoryId: string): Product[] {
  return mockProducts.filter(product => product.categoryId === categoryId)
}

export function getTableByNumber(number: string): Table | undefined {
  return mockTables.find(table => table.number === number)
}

export function getTodayOrders(): Order[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return mockOrders.filter(order => order.createdAt >= today)
}

export function getTodayRevenue(): number {
  return getTodayOrders().reduce((sum, order) => sum + order.total, 0)
}

// Order lifecycle utility functions
export function calculateOrderTimes(order: Order): {
  preparationTime: number | null
  serviceTime: number | null
  totalCycleTime: number | null
  estimatedTimeRemaining: number | null
} {
  const now = Date.now()
  
  // Preparation time: from accepted to started (or ready if not started)
  let preparationTime: number | null = null
  if (order.acceptedAt && order.startedAt) {
    preparationTime = Math.round((order.startedAt.getTime() - order.acceptedAt.getTime()) / 60000)
  } else if (order.acceptedAt && order.readyAt) {
    preparationTime = Math.round((order.readyAt.getTime() - order.acceptedAt.getTime()) / 60000)
  }
  
  // Service time: from ready to served
  let serviceTime: number | null = null
  if (order.readyAt && order.servedAt) {
    serviceTime = Math.round((order.servedAt.getTime() - order.readyAt.getTime()) / 60000)
  }
  
  // Total cycle time: from creation to served
  let totalCycleTime: number | null = null
  if (order.servedAt) {
    totalCycleTime = Math.round((order.servedAt.getTime() - order.createdAt.getTime()) / 60000)
  }
  
  // Estimated time remaining based on current status
  let estimatedTimeRemaining: number | null = null
  if (order.status === 'pending') {
    // Average: 1 min to accept + 12 min prep + 2 min service = 15 min
    estimatedTimeRemaining = 15
  } else if (order.status === 'preparing') {
    // Average: 12 min prep + 2 min service = 14 min
    if (order.startedAt) {
      const elapsed = Math.round((now - order.startedAt.getTime()) / 60000)
      estimatedTimeRemaining = Math.max(0, 12 - elapsed + 2) // 12 min prep remaining + 2 min service
    } else {
      estimatedTimeRemaining = 14
    }
  } else if (order.status === 'ready') {
    // Average: 2 min service
    estimatedTimeRemaining = 2
  } else {
    estimatedTimeRemaining = 0
  }
  
  return {
    preparationTime,
    serviceTime,
    totalCycleTime,
    estimatedTimeRemaining,
  }
}

// Staff performance metrics
export interface StaffPerformance {
  staffId: string
  staffName: string
  role: string
  ordersHandled: number
  avgPrepTime?: number // For kitchen staff
  avgServiceTime?: number // For waiters
  delayedOrders: number
  delayedPercentage: number
}

export function getStaffPerformance(orders: Order[], staff: Staff[]): StaffPerformance[] {
  const performanceMap = new Map<string, StaffPerformance>()
  
  // Initialize performance for all staff
  staff.forEach(s => {
    performanceMap.set(s.id, {
      staffId: s.id,
      staffName: s.name,
      role: s.role || 'waiter', // Default to waiter if role is undefined
      ordersHandled: 0,
      delayedOrders: 0,
      delayedPercentage: 0,
    })
  })
  
  // Process orders
  orders.forEach(order => {
    const times = calculateOrderTimes(order)
    
    // Track accepted orders
    if (order.acceptedBy) {
      const perf = performanceMap.get(order.acceptedBy)
      if (perf) {
        perf.ordersHandled++
      }
    }
    
    // Track kitchen performance
    if (order.preparedBy) {
      const perf = performanceMap.get(order.preparedBy)
      if (perf && perf.role === 'kitchen') {
        perf.ordersHandled++
        if (times.preparationTime !== null) {
          if (!perf.avgPrepTime) perf.avgPrepTime = 0
          perf.avgPrepTime = (perf.avgPrepTime * (perf.ordersHandled - 1) + times.preparationTime) / perf.ordersHandled
        }
        // Delayed if prep time > 15 minutes
        if (times.preparationTime !== null && times.preparationTime > 15) {
          perf.delayedOrders++
        }
      }
    }
    
    // Track waiter performance
    if (order.servedBy) {
      const perf = performanceMap.get(order.servedBy)
      if (perf && perf.role === 'waiter') {
        perf.ordersHandled++
        if (times.serviceTime !== null) {
          if (!perf.avgServiceTime) perf.avgServiceTime = 0
          perf.avgServiceTime = (perf.avgServiceTime * (perf.ordersHandled - 1) + times.serviceTime) / perf.ordersHandled
        }
        // Delayed if service time > 5 minutes
        if (times.serviceTime !== null && times.serviceTime > 5) {
          perf.delayedOrders++
        }
      }
    }
  })
  
  // Calculate delayed percentages
  performanceMap.forEach(perf => {
    if (perf.ordersHandled > 0) {
      perf.delayedPercentage = Math.round((perf.delayedOrders / perf.ordersHandled) * 100)
    }
  })
  
  return Array.from(performanceMap.values())
}

// Get order by ID
export function getOrderById(orderId: string): Order | undefined {
  return mockOrders.find(order => order.id === orderId)
}

// Get order by table number (latest)
export function getOrderByTable(tableNumber: string): Order | undefined {
  return mockOrders
    .filter(order => order.tableNumber === tableNumber)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
}

// ============================================
// INVENTORY & PURCHASING SYSTEM
// ============================================

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Fresh Produce Co.',
    contactPerson: 'John Smith',
    email: 'john@freshproduce.com',
    phone: '+1 234 567 8901',
    address: '123 Farm Road, City',
    createdAt: new Date(),
  },
  {
    id: 'supplier-2',
    name: 'Dairy Direct',
    contactPerson: 'Mary Johnson',
    email: 'mary@dairydirect.com',
    phone: '+1 234 567 8902',
    createdAt: new Date(),
  },
  {
    id: 'supplier-3',
    name: 'Beverage Wholesale',
    contactPerson: 'Tom Wilson',
    email: 'tom@beveragewholesale.com',
    phone: '+1 234 567 8903',
    createdAt: new Date(),
  },
  {
    id: 'supplier-4',
    name: 'Coffee Bean Importers',
    contactPerson: 'Sarah Brown',
    email: 'sarah@coffeeimporters.com',
    phone: '+1 234 567 8904',
    createdAt: new Date(),
  },
]

// Mock Raw Materials (Ingredients)
export const mockRawMaterials: RawMaterial[] = [
  {
    id: 'ingredient-1',
    name: 'Coffee Beans',
    unit: 'kg',
    currentQuantity: 25.5,
    costPerUnit: 12.50,
    supplierId: 'supplier-4',
    lowStockThreshold: 10,
    category: 'beverages',
    createdAt: new Date(),
  },
  {
    id: 'ingredient-2',
    name: 'Milk',
    unit: 'liter',
    currentQuantity: 45.0,
    costPerUnit: 1.20,
    supplierId: 'supplier-2',
    lowStockThreshold: 20,
    category: 'dairy',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
  },
  {
    id: 'ingredient-3',
    name: 'Bananas',
    unit: 'kg',
    currentQuantity: 8.2,
    costPerUnit: 2.50,
    supplierId: 'supplier-1',
    lowStockThreshold: 5,
    category: 'produce',
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    createdAt: new Date(),
  },
  {
    id: 'ingredient-4',
    name: 'Tomatoes',
    unit: 'kg',
    currentQuantity: 12.0,
    costPerUnit: 3.00,
    supplierId: 'supplier-1',
    lowStockThreshold: 5,
    category: 'produce',
    createdAt: new Date(),
  },
  {
    id: 'ingredient-5',
    name: 'Flour',
    unit: 'kg',
    currentQuantity: 30.0,
    costPerUnit: 1.50,
    supplierId: 'supplier-1',
    lowStockThreshold: 10,
    category: 'baking',
    createdAt: new Date(),
  },
  {
    id: 'ingredient-6',
    name: 'Sugar',
    unit: 'kg',
    currentQuantity: 15.0,
    costPerUnit: 2.00,
    supplierId: 'supplier-1',
    lowStockThreshold: 5,
    category: 'baking',
    createdAt: new Date(),
  },
  {
    id: 'ingredient-7',
    name: 'Orange Juice (Concentrate)',
    unit: 'liter',
    currentQuantity: 20.0,
    costPerUnit: 3.50,
    supplierId: 'supplier-3',
    lowStockThreshold: 10,
    category: 'beverages',
    createdAt: new Date(),
  },
]

// Mock Direct Stock (Finished Products)
export const mockDirectStock: DirectStock[] = [
  {
    id: 'stock-1',
    productId: 'prod-water', // Would link to a water product
    productName: 'Bottled Water',
    quantity: 120,
    unitCost: 0.50,
    sellingPrice: 2.00,
    margin: 75, // 75% margin
    lowStockThreshold: 30,
    unit: 'bottle',
    supplierId: 'supplier-3',
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
  {
    id: 'stock-2',
    productId: 'prod-soda',
    productName: 'Soda Can',
    quantity: 85,
    unitCost: 0.75,
    sellingPrice: 2.50,
    margin: 70,
    lowStockThreshold: 25,
    unit: 'can',
    supplierId: 'supplier-3',
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
]

// Mock Product-Ingredient Recipes (DEPRECATED)
// Quantities are now inferred by the statistical consumption engine
// This is kept for backward compatibility only
// See consumption-engine.ts for the new system
export const mockProductRecipes: Record<string, ProductIngredient[]> = {
  // Recipes are now inferred automatically - no manual quantities needed
  // This data structure is maintained for compatibility but not used for calculations
}

// Mock Purchases
export const mockPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    supplierId: 'supplier-4',
    supplierName: 'Coffee Bean Importers',
    type: 'raw_material',
    items: [
      {
        id: 'purchase-item-1',
        rawMaterialId: 'ingredient-1',
        itemName: 'Coffee Beans',
        quantity: 50,
        unitCost: 12.50,
        totalCost: 625.00,
        unit: 'kg',
      },
    ],
    totalCost: 625.00,
    purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    invoiceNumber: 'INV-2024-001',
    createdAt: new Date(),
  },
  {
    id: 'purchase-2',
    supplierId: 'supplier-2',
    supplierName: 'Dairy Direct',
    type: 'raw_material',
    items: [
      {
        id: 'purchase-item-2',
        rawMaterialId: 'ingredient-2',
        itemName: 'Milk',
        quantity: 100,
        unitCost: 1.20,
        totalCost: 120.00,
        unit: 'liter',
      },
    ],
    totalCost: 120.00,
    purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    invoiceNumber: 'INV-2024-002',
    createdAt: new Date(),
  },
  {
    id: 'purchase-3',
    supplierId: 'supplier-3',
    supplierName: 'Beverage Wholesale',
    type: 'direct_stock',
    items: [
      {
        id: 'purchase-item-3',
        directStockId: 'stock-1',
        itemName: 'Bottled Water',
        quantity: 200,
        unitCost: 0.50,
        totalCost: 100.00,
        unit: 'bottle',
      },
    ],
    totalCost: 100.00,
    purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    invoiceNumber: 'INV-2024-003',
    createdAt: new Date(),
  },
]

// Inventory Utility Functions

// Calculate product cost based on stock type
// NOW USES STATISTICAL INFERENCE - no manual quantities needed
export function calculateProductCost(productId: string): number {
  // PRIORITY 1: Check if product has BOM (Bill of Materials)
  try {
    const bomEngine = require('./bom-cost-engine')
    const bomCost = bomEngine.calculateBOMProductCost(productId)
    if (bomCost.cost > 0) {
      return bomCost.cost
    }
  } catch (error) {
    // BOM engine not available, continue
  }

  // PRIORITY 2: Check if product uses direct stock
  const directStock = mockDirectStock.find(s => s.productId === productId)
  if (directStock) {
    return directStock.unitCost
  }
  
  // PRIORITY 3: Use statistical consumption engine as fallback
  try {
    const consumptionEngine = require('./consumption-engine')
    const costData = consumptionEngine.calculateRealProductCost(productId)
    return costData.cost || 0
  } catch (error) {
    // Fallback to 0 if engine not available
    return 0
  }
}

// Calculate profit margin for a product
export function calculateProductMargin(productId: string, sellingPrice: number): number {
  const cost = calculateProductCost(productId)
  if (cost === 0) return 0
  return ((sellingPrice - cost) / sellingPrice) * 100
}

// Deduct inventory when order is placed
// NOW USES STATISTICAL INFERENCE for ingredient quantities
export function deductInventoryForOrder(order: Order): {
  success: boolean
  errors: string[]
  deductedItems: Array<{ type: 'direct' | 'ingredient', id: string, quantity: number }>
} {
  const errors: string[] = []
  const deductedItems: Array<{ type: 'direct' | 'ingredient', id: string, quantity: number }> = []
  
  // Import consumption engine
  const consumptionEngine = require('./consumption-engine')
  const { getProductConsumptionRates, productIngredientLinks } = consumptionEngine
  
  order.items.forEach(item => {
    // Check direct stock first
    const directStock = mockDirectStock.find(s => s.productId === item.productId)
    if (directStock) {
      const needed = item.quantity
      if (directStock.quantity >= needed) {
        directStock.quantity -= needed
        deductedItems.push({ type: 'direct', id: directStock.id, quantity: needed })
      } else {
        errors.push(`Insufficient stock for ${item.productName}. Available: ${directStock.quantity}, Needed: ${needed}`)
      }
      return
    }
    
    // Use statistical inference for ingredients
    const links = productIngredientLinks.filter((l: { productId: string; ingredientId: string }) => l.productId === item.productId)
    if (links.length > 0) {
      const rates = getProductConsumptionRates(item.productId)
      
      rates.forEach((rate: { ingredientId: string; inferredQuantity: number }) => {
        const material = mockRawMaterials.find(m => m.id === rate.ingredientId)
        if (material) {
          // Use inferred quantity (per product unit) × order quantity
          const needed = rate.inferredQuantity * item.quantity
          if (material.currentQuantity >= needed) {
            material.currentQuantity -= needed
            deductedItems.push({ type: 'ingredient', id: material.id, quantity: needed })
          } else {
            errors.push(`Insufficient ${material.name} for ${item.productName}. Available: ${material.currentQuantity}${material.unit}, Needed: ${needed.toFixed(3)}${material.unit}`)
          }
        }
      })
    }
  })
  
  return {
    success: errors.length === 0,
    errors,
    deductedItems,
  }
}

// Get low stock items
export function getLowStockItems(): {
  directStock: DirectStock[]
  rawMaterials: RawMaterial[]
} {
  return {
    directStock: mockDirectStock.filter(s => s.quantity <= s.lowStockThreshold),
    rawMaterials: mockRawMaterials.filter(m => m.currentQuantity <= m.lowStockThreshold),
  }
}

// Calculate inventory valuation
export function calculateInventoryValuation(): {
  directStockValue: number
  rawMaterialValue: number
  totalValue: number
} {
  const directStockValue = mockDirectStock.reduce((sum, stock) => 
    sum + (stock.quantity * stock.unitCost), 0
  )
  
  const rawMaterialValue = mockRawMaterials.reduce((sum, material) => 
    sum + (material.currentQuantity * material.costPerUnit), 0
  )
  
  return {
    directStockValue,
    rawMaterialValue,
    totalValue: directStockValue + rawMaterialValue,
  }
}

// Get consumption rate (items consumed per day - mock calculation)
export function getConsumptionRate(materialId: string, days: number = 30): number {
  // Mock: calculate based on recent orders
  const recentOrders = mockOrders.filter(o => 
    o.createdAt.getTime() > Date.now() - days * 24 * 60 * 60 * 1000
  )
  
  let totalConsumed = 0
  recentOrders.forEach(order => {
    order.items.forEach(item => {
      const recipe = mockProductRecipes[item.productId]
      if (recipe) {
        const ingredient = recipe.find(r => r.ingredientId === materialId)
        if (ingredient) {
          totalConsumed += ingredient.quantity * item.quantity
        }
      }
    })
  })
  
  return totalConsumed / days // Average per day
}

// Get stock turnover rate
export function getStockTurnover(materialId: string): number {
  const material = mockRawMaterials.find(m => m.id === materialId)
  if (!material) return 0
  
  const consumptionRate = getConsumptionRate(materialId)
  if (consumptionRate === 0) return 0
  
  return material.currentQuantity / consumptionRate // Days until stockout
}
