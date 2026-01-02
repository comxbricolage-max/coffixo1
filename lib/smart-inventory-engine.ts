// 🧪 SMART INVENTORY & COST ENGINE
// Automatic inventory management with yield rules, waste factors, and cost calculation
// TODO: Replace with real database queries when MongoDB is connected

import {
  mockDirectStock,
  mockRawMaterials,
  mockProducts,
  mockOrders,
  mockPurchases,
  type DirectStock,
  type RawMaterial,
  type Product,
  type Order,
} from './mock-data'
import { calculateRealProductCost } from './consumption-engine'

// ============================================
// INVENTORY TYPES & MODELS
// ============================================

export interface SimpleStock extends DirectStock {
  // Already has: id, productId, productName, quantity, unitCost, sellingPrice, margin, lowStockThreshold, unit
  // Auto-decreases on order
}

export interface RawMaterialStock extends RawMaterial {
  // Already has: id, name, unit, currentQuantity, costPerUnit, supplierId, expirationDate, lowStockThreshold, category
  // Additional fields for smart engine:
  yieldRules?: YieldRule[]
  wasteFactor?: number // Percentage (0-100) of waste expected
  averageYield?: number // Average yield per purchase unit
}

export interface YieldRule {
  id: string
  rawMaterialId: string
  outputProductId?: string // If specific to a product
  outputQuantity: number // How many units produced from 1 purchase unit
  outputUnit: string
  efficiency: number // 0-100% (how efficient the yield is)
  notes?: string
}

// Product-Ingredient Binding (Enhanced)
export interface ProductIngredientBinding {
  productId: string
  ingredientId: string
  // System calculates quantity automatically using:
  // - Statistical inference (from consumption-engine)
  // - Yield rules
  // - Historical consumption
  calculatedQuantity?: number // Auto-calculated, not manual
  lastCalculated?: Date
}

// ============================================
// YIELD RULES (Mock Data)
// ============================================

export const mockYieldRules: YieldRule[] = [
  // Coffee Beans: 1kg = ~80 espresso shots (industry average)
  {
    id: 'yield-1',
    rawMaterialId: 'ingredient-1', // Coffee Beans
    outputQuantity: 80,
    outputUnit: 'shot',
    efficiency: 85, // 85% efficiency (some waste)
    notes: '1kg coffee beans = ~80 espresso shots',
  },
  // Milk: 1L = ~4 cappuccinos/lattes
  {
    id: 'yield-2',
    rawMaterialId: 'ingredient-2', // Milk
    outputQuantity: 4,
    outputUnit: 'drink',
    efficiency: 90, // 90% efficiency
    notes: '1L milk = ~4 milk-based drinks',
  },
  // Orange Juice Concentrate: 1L = ~10 glasses
  {
    id: 'yield-3',
    rawMaterialId: 'ingredient-7', // Orange Juice Concentrate
    outputQuantity: 10,
    outputUnit: 'glass',
    efficiency: 95, // 95% efficiency
    notes: '1L concentrate = ~10 glasses of juice',
  },
]

// ============================================
// PRODUCT-INGREDIENT BINDINGS
// ============================================

export const productIngredientBindings: ProductIngredientBinding[] = [
  // Coffee products
  { productId: 'prod-1', ingredientId: 'ingredient-1' }, // Espresso → Coffee Beans
  { productId: 'prod-2', ingredientId: 'ingredient-1' }, // Cappuccino → Coffee Beans
  { productId: 'prod-2', ingredientId: 'ingredient-2' }, // Cappuccino → Milk
  { productId: 'prod-3', ingredientId: 'ingredient-1' }, // Latte → Coffee Beans
  { productId: 'prod-3', ingredientId: 'ingredient-2' }, // Latte → Milk
  { productId: 'prod-9', ingredientId: 'ingredient-1' }, // Americano → Coffee Beans
  { productId: 'prod-19', ingredientId: 'ingredient-1' }, // Iced Coffee → Coffee Beans
  { productId: 'prod-19', ingredientId: 'ingredient-2' }, // Iced Coffee → Milk
  
  // Juice products
  { productId: 'prod-7', ingredientId: 'ingredient-7' }, // Orange Juice → Orange Concentrate
  { productId: 'prod-18', ingredientId: 'ingredient-2' }, // Smoothie → Milk
  { productId: 'prod-18', ingredientId: 'ingredient-15' }, // Smoothie → Banana
  
  // Food products
  { productId: 'prod-4', ingredientId: 'ingredient-3' }, // Croissant → Flour
  { productId: 'prod-4', ingredientId: 'ingredient-4' }, // Croissant → Butter
  { productId: 'prod-5', ingredientId: 'ingredient-3' }, // Muffin → Flour
  { productId: 'prod-5', ingredientId: 'ingredient-5' }, // Muffin → Sugar
]

// ============================================
// COST CALCULATION ENGINE
// ============================================

/**
 * Calculate real cost per product using yield rules and consumption rates
 */
export function calculateSmartProductCost(productId: string): {
  cost: number
  confidence: number
  breakdown: Array<{
    ingredient: string
    quantity: number
    unit: string
    unitCost: number
    totalCost: number
    source: 'direct_stock' | 'yield_rule' | 'statistical' | 'estimated'
  }>
  margin?: number
  profit?: number
} {
  const product = mockProducts.find(p => p.id === productId)
  if (!product) {
    return { cost: 0, confidence: 0, breakdown: [] }
  }

  // Check if product uses direct stock
  const directStock = mockDirectStock.find(s => s.productId === productId)
  if (directStock) {
    return {
      cost: directStock.unitCost,
      confidence: 100,
      breakdown: [{
        ingredient: directStock.productName,
        quantity: 1,
        unit: directStock.unit,
        unitCost: directStock.unitCost,
        totalCost: directStock.unitCost,
        source: 'direct_stock',
      }],
      margin: directStock.margin,
      profit: directStock.sellingPrice - directStock.unitCost,
    }
  }

  // Use consumption engine for ingredient-based products
  let costData
  try {
    costData = calculateRealProductCost(productId)
  } catch (error) {
    console.error(`Error calculating real product cost for ${productId}:`, error)
    return { cost: 0, confidence: 0, breakdown: [] }
  }
  
  const breakdown = costData.breakdown.map(item => ({
    ingredient: item.ingredient,
    quantity: item.quantity,
    unit: mockRawMaterials.find(m => m.name === item.ingredient)?.unit || 'unit',
    unitCost: mockRawMaterials.find(m => m.name === item.ingredient)?.costPerUnit || 0,
    totalCost: item.cost,
    source: 'statistical' as const,
  }))

  const profit = product.price - costData.cost
  const margin = product.price > 0 ? (profit / product.price) * 100 : 0

  return {
    cost: costData.cost,
    confidence: costData.confidence,
    breakdown,
    margin: Math.round(margin * 10) / 10,
    profit: Math.round(profit * 100) / 100,
  }
}

/**
 * Calculate inventory consumption for an order (automatic deduction)
 */
export function calculateOrderInventoryConsumption(order: Order): {
  success: boolean
  errors: string[]
  consumption: Array<{
    type: 'direct_stock' | 'raw_material'
    itemId: string
    itemName: string
    quantity: number
    unit: string
    cost: number
  }>
  totalCost: number
} {
  const errors: string[] = []
  const consumption: Array<{
    type: 'direct_stock' | 'raw_material'
    itemId: string
    itemName: string
    quantity: number
    unit: string
    cost: number
  }> = []
  let totalCost = 0

  order.items.forEach(item => {
    // Check direct stock first
    const directStock = mockDirectStock.find(s => s.productId === item.productId)
    if (directStock) {
      const needed = item.quantity
      if (directStock.quantity >= needed) {
        consumption.push({
          type: 'direct_stock',
          itemId: directStock.id,
          itemName: directStock.productName,
          quantity: needed,
          unit: directStock.unit,
          cost: directStock.unitCost * needed,
        })
        totalCost += directStock.unitCost * needed
      } else {
        errors.push(`Insufficient stock for ${item.productName}. Available: ${directStock.quantity}, Needed: ${needed}`)
      }
      return
    }

    // Use consumption engine for ingredients
    let costData
    try {
      costData = calculateRealProductCost(item.productId)
    } catch (error) {
      console.error(`Error calculating cost for product ${item.productId}:`, error)
      errors.push(`Error calculating cost for ${item.productName}`)
      return // Skip this item
    }
    
    if (costData && costData.breakdown.length > 0) {
      costData.breakdown.forEach(ingredient => {
        const material = mockRawMaterials.find(m => m.name === ingredient.ingredient)
        if (material) {
          // Calculate quantity needed: inferred quantity per product × order quantity
          const needed = ingredient.quantity * item.quantity
          if (material.currentQuantity >= needed) {
            consumption.push({
              type: 'raw_material',
              itemId: material.id,
              itemName: material.name,
              quantity: needed,
              unit: material.unit,
              cost: material.costPerUnit * needed,
            })
            totalCost += material.costPerUnit * needed
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
    consumption,
    totalCost: Math.round(totalCost * 100) / 100,
  }
}

// ============================================
// INVENTORY VALUATION
// ============================================

export interface InventoryValuation {
  totalValue: number
  directStockValue: number
  rawMaterialValue: number
  byCategory: Array<{
    category: string
    value: number
    items: number
  }>
  lowStockValue: number // Value of items below threshold
  overstockValue: number // Value of items above optimal level
}

export function calculateInventoryValuation(): InventoryValuation {
  // Direct stock valuation
  const directStockValue = mockDirectStock.reduce((sum, stock) => {
    return sum + (stock.quantity * stock.unitCost)
  }, 0)

  // Raw material valuation
  const rawMaterialValue = mockRawMaterials.reduce((sum, material) => {
    return sum + (material.currentQuantity * material.costPerUnit)
  }, 0)

  // By category
  const categoryMap = new Map<string, { value: number; items: number }>()
  mockRawMaterials.forEach(material => {
    const category = material.category || 'uncategorized'
    const existing = categoryMap.get(category) || { value: 0, items: 0 }
    existing.value += material.currentQuantity * material.costPerUnit
    existing.items += 1
    categoryMap.set(category, existing)
  })

  const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    value: Math.round(data.value * 100) / 100,
    items: data.items,
  }))

  // Low stock value
  const lowStockValue = [
    ...mockDirectStock.filter(s => s.quantity <= s.lowStockThreshold),
    ...mockRawMaterials.filter(m => m.currentQuantity <= m.lowStockThreshold),
  ].reduce((sum, item) => {
    if ('unitCost' in item) {
      return sum + (item.quantity * item.unitCost)
    } else {
      return sum + (item.currentQuantity * item.costPerUnit)
    }
  }, 0)

  // Overstock detection (items > 2x lowStockThreshold)
  const overstockValue = [
    ...mockDirectStock.filter(s => s.quantity > s.lowStockThreshold * 2),
    ...mockRawMaterials.filter(m => m.currentQuantity > m.lowStockThreshold * 2),
  ].reduce((sum, item) => {
    if ('unitCost' in item) {
      return sum + (item.quantity * item.unitCost)
    } else {
      return sum + (item.currentQuantity * item.costPerUnit)
    }
  }, 0)

  return {
    totalValue: Math.round((directStockValue + rawMaterialValue) * 100) / 100,
    directStockValue: Math.round(directStockValue * 100) / 100,
    rawMaterialValue: Math.round(rawMaterialValue * 100) / 100,
    byCategory,
    lowStockValue: Math.round(lowStockValue * 100) / 100,
    overstockValue: Math.round(overstockValue * 100) / 100,
  }
}

// ============================================
// PRODUCT PROFITABILITY
// ============================================

export interface ProductProfitability {
  productId: string
  productName: string
  sellingPrice: number
  cost: number
  profit: number
  margin: number
  costConfidence: number
  sales: number
  totalRevenue: number
  totalProfit: number
  profitabilityScore: number // 0-100 (combines margin + sales volume)
}

export function calculateProductProfitability(): ProductProfitability[] {
  const productStats = new Map<string, { sales: number; revenue: number }>()

  // Calculate sales and revenue
  mockOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = productStats.get(item.productId) || { sales: 0, revenue: 0 }
      existing.sales += item.quantity
      existing.revenue += item.price * item.quantity
      productStats.set(item.productId, existing)
    })
  })

  // Calculate profitability for each product
  const profitability = mockProducts.map(product => {
    const stats = productStats.get(product.id) || { sales: 0, revenue: 0 }
    let costData
    try {
      costData = calculateSmartProductCost(product.id)
    } catch (error) {
      console.error(`Error calculating cost for product ${product.id}:`, error)
      costData = { cost: 0, confidence: 0, breakdown: [] }
    }
    
    const profit = product.price - costData.cost
    const margin = product.price > 0 ? (profit / product.price) * 100 : 0
    const totalProfit = profit * stats.sales

    // Profitability score: combines margin (40%) and sales volume (60%)
    const marginScore = Math.min(100, margin * 2) // Max 50% margin = 100 points
    const salesScore = Math.min(100, (stats.sales / 50) * 100) // 50 sales = 100 points
    const profitabilityScore = (marginScore * 0.4) + (salesScore * 0.6)

    return {
      productId: product.id,
      productName: product.name,
      sellingPrice: product.price,
      cost: Math.round(costData.cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 10) / 10,
      costConfidence: costData.confidence,
      sales: stats.sales,
      totalRevenue: Math.round(stats.revenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitabilityScore: Math.round(profitabilityScore),
    }
  })

  return profitability.sort((a, b) => b.totalProfit - a.totalProfit)
}

// ============================================
// INVENTORY LOSS ESTIMATION
// ============================================

export interface InventoryLossEstimation {
  totalEstimatedLoss: number
  byCategory: Array<{
    category: string
    lossValue: number
    lossPercentage: number
  }>
  expiredItems: Array<{
    itemId: string
    itemName: string
    quantity: number
    value: number
    daysExpired: number
  }>
  wasteEstimate: number // Based on waste factors
}

export function estimateInventoryLoss(): InventoryLossEstimation {
  const now = new Date()
  const expiredItems: Array<{
    itemId: string
    itemName: string
    quantity: number
    value: number
    daysExpired: number
  }> = []

  // Check raw materials for expiration
  mockRawMaterials.forEach(material => {
    if (material.expirationDate && material.expirationDate < now) {
      const daysExpired = Math.floor((now.getTime() - material.expirationDate.getTime()) / (24 * 60 * 60 * 1000))
      expiredItems.push({
        itemId: material.id,
        itemName: material.name,
        quantity: material.currentQuantity,
        value: material.currentQuantity * material.costPerUnit,
        daysExpired,
      })
    }
  })

  // Calculate waste estimate based on waste factors
  let wasteEstimate = 0
  mockRawMaterials.forEach(material => {
    // Check if material has wasteFactor (optional property)
    const wasteFactor = (material as any).wasteFactor as number | undefined
    if (wasteFactor && typeof wasteFactor === 'number') {
      const wasteAmount = (material.currentQuantity * wasteFactor) / 100
      wasteEstimate += wasteAmount * material.costPerUnit
    } else {
      // Default 5% waste for materials without specified factor
      wasteEstimate += (material.currentQuantity * 0.05) * material.costPerUnit
    }
  })

  // Loss by category
  const categoryLoss = new Map<string, { loss: number; total: number }>()
  expiredItems.forEach(item => {
    const material = mockRawMaterials.find(m => m.id === item.itemId)
    if (material) {
      const category = material.category || 'uncategorized'
      const existing = categoryLoss.get(category) || { loss: 0, total: 0 }
      existing.loss += item.value
      existing.total += material.currentQuantity * material.costPerUnit
      categoryLoss.set(category, existing)
    }
  })

  const byCategory = Array.from(categoryLoss.entries()).map(([category, data]) => ({
    category,
    lossValue: Math.round(data.loss * 100) / 100,
    lossPercentage: data.total > 0 ? Math.round((data.loss / data.total) * 100 * 10) / 10 : 0,
  }))

  const totalEstimatedLoss = expiredItems.reduce((sum, item) => sum + item.value, 0) + wasteEstimate

  return {
    totalEstimatedLoss: Math.round(totalEstimatedLoss * 100) / 100,
    byCategory,
    expiredItems,
    wasteEstimate: Math.round(wasteEstimate * 100) / 100,
  }
}

// ============================================
// PROFIT CALCULATIONS
// ============================================

export interface ProfitMetrics {
  todayProfit: number
  todayRevenue: number
  todayCost: number
  todayMargin: number
  byProduct: Array<{
    productId: string
    productName: string
    revenue: number
    cost: number
    profit: number
    margin: number
    sales: number
  }>
  byStaff?: Array<{
    staffId: string
    staffName: string
    ordersHandled: number
    revenue: number
    cost: number
    profit: number
  }>
}

export function calculateProfitMetrics(period: 'today' | 'week' | 'month' = 'today'): ProfitMetrics {
  const now = new Date()
  let periodStart: Date

  switch (period) {
    case 'today':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  const periodOrders = mockOrders.filter(o => o.createdAt >= periodStart)
  
  let todayRevenue = 0
  let todayCost = 0
  const productStats = new Map<string, { revenue: number; cost: number; sales: number }>()

  periodOrders.forEach(order => {
    try {
      todayRevenue += order.total
      
      // Calculate cost for this order
      const consumption = calculateOrderInventoryConsumption(order)
      todayCost += consumption.totalCost

      // Track by product
      order.items.forEach(item => {
        try {
          const existing = productStats.get(item.productId) || { revenue: 0, cost: 0, sales: 0 }
          existing.revenue += item.price * item.quantity
          const costData = calculateSmartProductCost(item.productId)
          existing.cost += costData.cost * item.quantity
          existing.sales += item.quantity
          productStats.set(item.productId, existing)
        } catch (error) {
          console.error(`Error processing item ${item.productId}:`, error)
          // Continue with other items
        }
      })
    } catch (error) {
      console.error(`Error processing order ${order.id}:`, error)
      // Continue with other orders
    }
  })

  const todayProfit = todayRevenue - todayCost
  const todayMargin = todayRevenue > 0 ? (todayProfit / todayRevenue) * 100 : 0

  const byProduct = Array.from(productStats.entries()).map(([productId, stats]) => {
    const product = mockProducts.find(p => p.id === productId)
    const profit = stats.revenue - stats.cost
    const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0
    return {
      productId,
      productName: product?.name || 'Unknown',
      revenue: Math.round(stats.revenue * 100) / 100,
      cost: Math.round(stats.cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 10) / 10,
      sales: stats.sales,
    }
  }).sort((a, b) => b.profit - a.profit)

  return {
    todayProfit: Math.round(todayProfit * 100) / 100,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    todayCost: Math.round(todayCost * 100) / 100,
    todayMargin: Math.round(todayMargin * 10) / 10,
    byProduct,
  }
}

// ============================================
// LOW STOCK & OVERSTOCK DETECTION
// ============================================

export interface StockAlerts {
  lowStock: Array<{
    type: 'direct_stock' | 'raw_material'
    id: string
    name: string
    current: number
    threshold: number
    unit: string
    value: number
    urgency: 'critical' | 'warning' | 'low'
  }>
  overstock: Array<{
    type: 'direct_stock' | 'raw_material'
    id: string
    name: string
    current: number
    optimal: number
    unit: string
    value: number
    excessValue: number
  }>
}

export function getStockAlerts(): StockAlerts {
  const lowStock: StockAlerts['lowStock'] = []
  const overstock: StockAlerts['overstock'] = []

  // Check direct stock
  mockDirectStock.forEach(stock => {
    if (stock.quantity <= stock.lowStockThreshold) {
      const urgency = stock.quantity <= stock.lowStockThreshold * 0.5 
        ? 'critical' 
        : stock.quantity <= stock.lowStockThreshold * 0.75 
        ? 'warning' 
        : 'low'
      lowStock.push({
        type: 'direct_stock',
        id: stock.id,
        name: stock.productName,
        current: stock.quantity,
        threshold: stock.lowStockThreshold,
        unit: stock.unit,
        value: stock.quantity * stock.unitCost,
        urgency,
      })
    }
    // Overstock: > 2x threshold
    if (stock.quantity > stock.lowStockThreshold * 2) {
      const optimal = stock.lowStockThreshold * 1.5
      overstock.push({
        type: 'direct_stock',
        id: stock.id,
        name: stock.productName,
        current: stock.quantity,
        optimal,
        unit: stock.unit,
        value: stock.quantity * stock.unitCost,
        excessValue: (stock.quantity - optimal) * stock.unitCost,
      })
    }
  })

  // Check raw materials
  mockRawMaterials.forEach(material => {
    if (material.currentQuantity <= material.lowStockThreshold) {
      const urgency = material.currentQuantity <= material.lowStockThreshold * 0.5 
        ? 'critical' 
        : material.currentQuantity <= material.lowStockThreshold * 0.75 
        ? 'warning' 
        : 'low'
      lowStock.push({
        type: 'raw_material',
        id: material.id,
        name: material.name,
        current: material.currentQuantity,
        threshold: material.lowStockThreshold,
        unit: material.unit,
        value: material.currentQuantity * material.costPerUnit,
        urgency,
      })
    }
    // Overstock: > 2x threshold
    if (material.currentQuantity > material.lowStockThreshold * 2) {
      const optimal = material.lowStockThreshold * 1.5
      overstock.push({
        type: 'raw_material',
        id: material.id,
        name: material.name,
        current: material.currentQuantity,
        optimal,
        unit: material.unit,
        value: material.currentQuantity * material.costPerUnit,
        excessValue: (material.currentQuantity - optimal) * material.costPerUnit,
      })
    }
  })

  return { lowStock, overstock }
}

