// 🧪 DEMO MODE – NO DATABASE
// Business-focused analytics calculations
// TODO: Replace with real database queries when MongoDB is connected

import {
  mockOrders,
  mockProducts,
  mockRawMaterials,
  mockDirectStock,
  calculateProductCost,
  calculateProductMargin,
  calculateInventoryValuation,
  getLowStockItems,
  getStaffPerformance,
  mockStaff,
  mockAnalytics,
} from './mock-data'
import {
  calculateRealProductCost,
  calculateWasteEstimate,
  getMostWastefulProducts,
  getIngredientEfficiencyScores,
  getAllConsumptionRates,
} from './consumption-engine'

// ============================================
// OWNER ANALYTICS
// ============================================

export interface OwnerAnalytics {
  // Revenue & Profit
  todayRevenue: number
  todayCost: number
  todayGrossProfit: number
  grossMargin: number
  
  // Product Performance
  bestProducts: Array<{ productId: string; name: string; revenue: number; profit: number; margin: number; sales: number; costConfidence: number }>
  worstProducts: Array<{ productId: string; name: string; revenue: number; profit: number; margin: number; sales: number; costConfidence: number }>
  
  // Intelligence Metrics
  intelligenceMetrics: {
    avgCostConfidence: number
    mostWastefulProducts: Array<{ productId: string; name: string; wastePercentage: number; efficiencyScore: number }>
    ingredientEfficiency: Array<{ ingredientId: string; name: string; efficiencyScore: number }>
  }
  
  // Inventory
  inventoryValue: number
  lowStockCount: number
  wasteEstimate: number
  
  // Staff Performance Summary
  staffSummary: {
    totalStaff: number
    onShift: number
    avgPrepTime: number
    avgServiceTime: number
    delayedOrders: number
  }
  
  // Operations
  orderBottlenecks: {
    kitchenLoad: number
    readyOrdersWaiting: number
    avgWaitTime: number
  }
  
  // Trends
  peakHours: Array<{ hour: string; orders: number; revenue: number }>
  revenueTrend: 'up' | 'down' | 'stable'
  orderTrend: 'up' | 'down' | 'stable'
}

export function getOwnerAnalytics(): OwnerAnalytics {
  // Calculate today's revenue and costs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = mockOrders.filter(o => o.createdAt >= today)
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  
  // Calculate costs for today's orders
  let todayCost = 0
  todayOrders.forEach(order => {
    order.items.forEach(item => {
      const cost = calculateProductCost(item.productId)
      todayCost += cost * item.quantity
    })
  })
  
  const todayGrossProfit = todayRevenue - todayCost
  const grossMargin = todayRevenue > 0 ? (todayGrossProfit / todayRevenue) * 100 : 0
  
  // Product Performance
  const productStats = new Map<string, { revenue: number; cost: number; sales: number }>()
  
  mockOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = productStats.get(item.productId) || { revenue: 0, cost: 0, sales: 0 }
      existing.revenue += item.price * item.quantity
      existing.cost += calculateProductCost(item.productId) * item.quantity
      existing.sales += item.quantity
      productStats.set(item.productId, existing)
    })
  })
  
  const productPerformance = Array.from(productStats.entries()).map(([productId, stats]) => {
    const product = mockProducts.find(p => p.id === productId)
    // Get real cost with confidence from consumption engine
    const realCostData = calculateRealProductCost(productId)
    const actualCost = realCostData.cost > 0 ? realCostData.cost : stats.cost
    const actualProfit = stats.revenue - actualCost
    return {
      productId,
      name: product?.name || 'Unknown',
      revenue: stats.revenue,
      profit: actualProfit,
      margin: stats.revenue > 0 ? ((actualProfit) / stats.revenue) * 100 : 0,
      sales: stats.sales,
      costConfidence: realCostData.confidence,
    }
  })
  
  const bestProducts = productPerformance
    .filter(p => p.sales > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
  
  const worstProducts = productPerformance
    .filter(p => p.sales > 0)
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 5)
  
  // Inventory
  const inventory = calculateInventoryValuation()
  const lowStock = getLowStockItems()
  
  // Waste estimation (expired or near-expired items)
  const wasteEstimate = mockRawMaterials
    .filter(m => m.expirationDate && m.expirationDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, m) => sum + (m.currentQuantity * m.costPerUnit), 0)
  
  // Staff Performance
  const staffPerf = getStaffPerformance(mockOrders, mockStaff)
  const kitchenStaff = staffPerf.filter(s => s.role === 'kitchen')
  const waiters = staffPerf.filter(s => s.role === 'waiter')
  
  const avgPrepTime = kitchenStaff.length > 0
    ? kitchenStaff.reduce((sum, s) => sum + (s.avgPrepTime || 0), 0) / kitchenStaff.length
    : 0
  
  const avgServiceTime = waiters.length > 0
    ? waiters.reduce((sum, s) => sum + (s.avgServiceTime || 0), 0) / waiters.length
    : 0
  
  const delayedOrders = staffPerf.reduce((sum, s) => sum + s.delayedOrders, 0)
  
  // Order Bottlenecks
  const preparingOrders = mockOrders.filter(o => o.status === 'preparing')
  const readyOrders = mockOrders.filter(o => o.status === 'ready')
  
  const avgWaitTime = readyOrders.length > 0
    ? readyOrders.reduce((sum, o) => {
        if (o.readyAt) {
          return sum + (Date.now() - o.readyAt.getTime()) / 60000
        }
        return sum
      }, 0) / readyOrders.length
    : 0
  
  // Trends (mock - would be calculated from historical data)
  const revenueTrend: 'up' | 'down' | 'stable' = 'up'
  const orderTrend: 'up' | 'down' | 'stable' = 'up'
  
  // Intelligence Metrics
  const allRates = getAllConsumptionRates()
  const avgCostConfidence = allRates.length > 0
    ? allRates.reduce((sum, r) => sum + r.confidence, 0) / allRates.length
    : 0
  
  const wastefulProducts = getMostWastefulProducts().slice(0, 5)
  const ingredientEfficiency = getIngredientEfficiencyScores()
    .sort((a, b) => b.avgEfficiencyScore - a.avgEfficiencyScore)
    .slice(0, 5)
  
  return {
    todayRevenue,
    todayCost,
    todayGrossProfit,
    grossMargin,
    bestProducts,
    worstProducts,
    inventoryValue: inventory.totalValue,
    lowStockCount: lowStock.directStock.length + lowStock.rawMaterials.length,
    wasteEstimate,
    staffSummary: {
      totalStaff: mockStaff.length,
      onShift: mockStaff.filter(s => s.onShift).length,
      avgPrepTime: Math.round(avgPrepTime * 10) / 10,
      avgServiceTime: Math.round(avgServiceTime * 10) / 10,
      delayedOrders,
    },
    orderBottlenecks: {
      kitchenLoad: preparingOrders.length,
      readyOrdersWaiting: readyOrders.length,
      avgWaitTime: Math.round(avgWaitTime * 10) / 10,
    },
    peakHours: mockAnalytics.peakHours,
    revenueTrend,
    orderTrend,
    intelligenceMetrics: {
      avgCostConfidence: Math.round(avgCostConfidence),
      mostWastefulProducts: wastefulProducts.map(p => ({
        productId: p.productId,
        name: p.productName,
        wastePercentage: Math.round(p.wastePercentage),
        efficiencyScore: Math.round(p.efficiencyScore),
      })),
      ingredientEfficiency: ingredientEfficiency.map(i => ({
        ingredientId: i.ingredientId,
        name: i.ingredientName,
        efficiencyScore: Math.round(i.avgEfficiencyScore),
      })),
    },
  }
}

// ============================================
// KITCHEN ANALYTICS
// ============================================

export interface KitchenAnalytics {
  ordersInProgress: number
  avgPrepTime: number
  delayedOrders: number
  kitchenLoad: {
    current: number
    capacity: number
    percentage: number
  }
  stockImpact: {
    lowStockItems: number
    criticalItems: string[]
  }
  wasteAlert: number
}

export function getKitchenAnalytics(staffId?: string): KitchenAnalytics {
  const preparingOrders = mockOrders.filter(o => o.status === 'preparing')
  const readyOrders = mockOrders.filter(o => o.status === 'ready')
  
  // Calculate average prep time for kitchen staff
  const staffPerf = getStaffPerformance(mockOrders, mockStaff)
  const kitchenStaff = staffPerf.filter(s => s.role === 'kitchen')
  const avgPrepTime = kitchenStaff.length > 0
    ? kitchenStaff.reduce((sum, s) => sum + (s.avgPrepTime || 0), 0) / kitchenStaff.length
    : 0
  
  // Delayed orders (preparing for > 20 minutes)
  const delayedOrders = preparingOrders.filter(o => {
    const minutes = (Date.now() - o.createdAt.getTime()) / 60000
    return minutes > 20
  }).length
  
  // Kitchen load (assuming capacity of 10 orders)
  const kitchenCapacity = 10
  const currentLoad = preparingOrders.length
  const loadPercentage = (currentLoad / kitchenCapacity) * 100
  
  // Stock impact
  const lowStock = getLowStockItems()
  const criticalItems = [
    ...lowStock.rawMaterials.filter(m => m.category === 'dairy' || m.category === 'produce').map(m => m.name),
    ...lowStock.rawMaterials.filter(m => m.currentQuantity <= m.lowStockThreshold * 0.5).map(m => m.name),
  ]
  
  // Waste alert (expiring soon)
  const wasteAlert = mockRawMaterials
    .filter(m => m.expirationDate && m.expirationDate < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
    .length
  
  return {
    ordersInProgress: preparingOrders.length,
    avgPrepTime: Math.round(avgPrepTime * 10) / 10,
    delayedOrders,
    kitchenLoad: {
      current: currentLoad,
      capacity: kitchenCapacity,
      percentage: Math.round(loadPercentage),
    },
    stockImpact: {
      lowStockItems: lowStock.rawMaterials.length,
      criticalItems: criticalItems.slice(0, 5),
    },
    wasteAlert,
  }
}

// ============================================
// RECEPTION / CASHIER ANALYTICS
// ============================================

export interface ReceptionAnalytics {
  ordersReceived: number
  ordersServed: number
  pendingPayments: number
  paymentFlow: {
    pending: number
    ready: number
    served: number
  }
  orderDelays: {
    count: number
    avgDelay: number
    longestDelay: number
  }
  todayRevenue: number
}

export function getReceptionAnalytics(): ReceptionAnalytics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = mockOrders.filter(o => o.createdAt >= today)
  
  const ordersReceived = todayOrders.length
  const ordersServed = todayOrders.filter(o => o.status === 'served' || o.status === 'completed').length
  const pendingPayments = todayOrders.filter(o => o.status === 'ready' || o.status === 'served').length
  
  const paymentFlow = {
    pending: todayOrders.filter(o => o.status === 'pending').length,
    ready: todayOrders.filter(o => o.status === 'ready').length,
    served: todayOrders.filter(o => o.status === 'served').length,
  }
  
  // Order delays (orders waiting > 10 minutes)
  const delayedOrders = todayOrders.filter(o => {
    const minutes = (Date.now() - o.createdAt.getTime()) / 60000
    return minutes > 10 && o.status !== 'served'
  })
  
  const avgDelay = delayedOrders.length > 0
    ? delayedOrders.reduce((sum, o) => {
        const minutes = (Date.now() - o.createdAt.getTime()) / 60000
        return sum + minutes
      }, 0) / delayedOrders.length
    : 0
  
  const longestDelay = delayedOrders.length > 0
    ? Math.max(...delayedOrders.map(o => (Date.now() - o.createdAt.getTime()) / 60000))
    : 0
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  
  return {
    ordersReceived,
    ordersServed,
    pendingPayments,
    paymentFlow,
    orderDelays: {
      count: delayedOrders.length,
      avgDelay: Math.round(avgDelay * 10) / 10,
      longestDelay: Math.round(longestDelay),
    },
    todayRevenue,
  }
}

// ============================================
// WAITER ANALYTICS
// ============================================

export interface WaiterAnalytics {
  tablesServed: number
  avgServiceTime: number
  ordersDelivered: number
  activeTables: number
  currentLoad: {
    readyOrders: number
    tablesWaiting: number
  }
  performance: {
    ordersToday: number
    avgTimePerOrder: number
  }
}

export function getWaiterAnalytics(staffId?: string): WaiterAnalytics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = mockOrders.filter(o => o.createdAt >= today)
  
  // Tables served (unique table numbers)
  const tablesServed = new Set(
    todayOrders
      .filter(o => o.status === 'served' || o.status === 'completed')
      .map(o => o.tableNumber)
  ).size
  
  // Average service time (from ready to served)
  const servedOrders = todayOrders.filter(o => o.status === 'served' && o.readyAt && o.servedAt)
  const avgServiceTime = servedOrders.length > 0
    ? servedOrders.reduce((sum, o) => {
        if (o.readyAt && o.servedAt) {
          return sum + ((o.servedAt.getTime() - o.readyAt.getTime()) / 60000)
        }
        return sum
      }, 0) / servedOrders.length
    : 0
  
  const ordersDelivered = servedOrders.length
  const activeTables = new Set(todayOrders.map(o => o.tableNumber)).size
  
  // Current load
  const readyOrders = mockOrders.filter(o => o.status === 'ready')
  const tablesWaiting = new Set(readyOrders.map(o => o.tableNumber)).size
  
  // Performance
  const ordersToday = todayOrders.filter(o => o.servedBy === staffId || !staffId).length
  
  return {
    tablesServed,
    avgServiceTime: Math.round(avgServiceTime * 10) / 10,
    ordersDelivered,
    activeTables,
    currentLoad: {
      readyOrders: readyOrders.length,
      tablesWaiting,
    },
    performance: {
      ordersToday,
      avgTimePerOrder: avgServiceTime,
    },
  }
}

