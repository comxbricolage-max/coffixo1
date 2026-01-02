// 🧪 DEMO MODE – NO DATABASE
// Statistical Consumption Engine
// Automatically infers ingredient usage from inventory movements
// TODO: Replace with real database queries when MongoDB is connected

import {
  mockOrders,
  mockRawMaterials,
  mockProducts,
  mockPurchases,
  type Order,
  type RawMaterial,
} from './mock-data'

// ============================================
// DATA MODELS
// ============================================

// Product-Ingredient Relationship (NO QUANTITIES)
export interface ProductIngredientLink {
  productId: string
  ingredientId: string
  // No quantity field - system infers this
}

// Inventory Snapshot (for tracking changes)
export interface InventorySnapshot {
  id: string
  ingredientId: string
  quantity: number
  timestamp: Date
  type: 'purchase' | 'count' | 'adjustment' | 'waste'
  notes?: string
}

// Inferred Consumption Rate
export interface ConsumptionRate {
  productId: string
  ingredientId: string
  inferredQuantity: number // Per product unit
  unit: string
  confidence: number // 0-100% (based on data quality)
  sampleSize: number // Number of data points used
  lastCalculated: Date
  efficiencyScore?: number // 0-100 (lower waste = higher score)
}

// ============================================
// PRODUCT-INGREDIENT LINKS (NO QUANTITIES)
// ============================================

// Simple relationships - which ingredients are used by which products
export const productIngredientLinks: ProductIngredientLink[] = [
  // Coffee products
  { productId: 'prod-1', ingredientId: 'ingredient-1' }, // Espresso → Coffee Beans
  { productId: 'prod-2', ingredientId: 'ingredient-1' }, // Cappuccino → Coffee Beans
  { productId: 'prod-2', ingredientId: 'ingredient-2' }, // Cappuccino → Milk
  { productId: 'prod-3', ingredientId: 'ingredient-1' }, // Latte → Coffee Beans
  { productId: 'prod-3', ingredientId: 'ingredient-2' }, // Latte → Milk
  { productId: 'prod-4', ingredientId: 'ingredient-1' }, // Americano → Coffee Beans
  { productId: 'prod-13', ingredientId: 'ingredient-1' }, // Flat White → Coffee Beans
  { productId: 'prod-13', ingredientId: 'ingredient-2' }, // Flat White → Milk
  { productId: 'prod-14', ingredientId: 'ingredient-1' }, // Mocha → Coffee Beans
  { productId: 'prod-14', ingredientId: 'ingredient-2' }, // Mocha → Milk
  { productId: 'prod-15', ingredientId: 'ingredient-1' }, // Iced Coffee → Coffee Beans
  
  // Juice products
  { productId: 'prod-11', ingredientId: 'ingredient-7' }, // Orange Juice → Orange Juice Concentrate
  
  // Food products (would use ingredients like flour, tomatoes, etc.)
  // For demo, we'll track some basic relationships
]

// ============================================
// INVENTORY HISTORY (Mock - would be from DB)
// ============================================

// Mock inventory snapshots (simulating periodic counts)
const now = Date.now()
export const mockInventoryHistory: InventorySnapshot[] = [
  // Coffee Beans - 7 days ago
  { id: 'snap-1', ingredientId: 'ingredient-1', quantity: 30, timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000), type: 'count' },
  // Coffee Beans - 3 days ago (after purchase)
  { id: 'snap-2', ingredientId: 'ingredient-1', quantity: 50, timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), type: 'purchase' },
  // Coffee Beans - today
  { id: 'snap-3', ingredientId: 'ingredient-1', quantity: 25.5, timestamp: new Date(now), type: 'count' },
  
  // Milk - 5 days ago
  { id: 'snap-4', ingredientId: 'ingredient-2', quantity: 30, timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000), type: 'count' },
  // Milk - 3 days ago (after purchase)
  { id: 'snap-5', ingredientId: 'ingredient-2', quantity: 100, timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), type: 'purchase' },
  // Milk - today
  { id: 'snap-6', ingredientId: 'ingredient-2', quantity: 45, timestamp: new Date(now), type: 'count' },
  
  // Orange Juice - 4 days ago
  { id: 'snap-7', ingredientId: 'ingredient-7', quantity: 15, timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000), type: 'count' },
  // Orange Juice - today
  { id: 'snap-8', ingredientId: 'ingredient-7', quantity: 20, timestamp: new Date(now), type: 'count' },
]

// ============================================
// STATISTICAL INFERENCE ENGINE
// ============================================

/**
 * Calculate inferred consumption rate for a product-ingredient pair
 * Uses: Sales data + Inventory changes - Purchases - Waste
 */
export function inferConsumptionRate(
  productId: string,
  ingredientId: string,
  days: number = 30
): ConsumptionRate | null {
  // Get all links for this product
  const link = productIngredientLinks.find(
    l => l.productId === productId && l.ingredientId === ingredientId
  )
  if (!link) return null

  // Get ingredient info
  const ingredient = mockRawMaterials.find(m => m.id === ingredientId)
  if (!ingredient) return null

  // Get product sales in the period
  const periodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const periodOrders = mockOrders.filter(o => o.createdAt >= periodStart)
  
  let totalProductSales = 0
  periodOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.productId === productId) {
        totalProductSales += item.quantity
      }
    })
  })

  if (totalProductSales === 0) {
    // No sales data - return low confidence estimate
    return {
      productId,
      ingredientId,
      inferredQuantity: 0,
      unit: ingredient.unit,
      confidence: 0,
      sampleSize: 0,
      lastCalculated: new Date(),
    }
  }

  // Get inventory changes in the period
  const periodSnapshots = mockInventoryHistory
    .filter(s => s.ingredientId === ingredientId && s.timestamp >= periodStart)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  if (periodSnapshots.length < 2) {
    // Not enough data - return estimate based on industry averages
    return estimateFromIndustryAverage(productId, ingredientId, ingredient.unit)
  }

  // Calculate net consumption
  // Start quantity - End quantity + Purchases - Waste
  const startQuantity = periodSnapshots[0].quantity
  const endQuantity = periodSnapshots[periodSnapshots.length - 1].quantity
  
  // Get purchases in period
  const periodPurchases = mockPurchases
    .filter(p => p.purchaseDate >= periodStart && p.type === 'raw_material')
    .reduce((sum, p) => {
      const purchaseItem = p.items.find(i => i.rawMaterialId === ingredientId)
      return sum + (purchaseItem?.quantity || 0)
    }, 0)

  // Net consumption = (Start - End) + Purchases
  // (We assume waste is minimal for now, or tracked separately)
  const netConsumption = (startQuantity - endQuantity) + periodPurchases

  if (netConsumption <= 0) {
    // No consumption or data issue
    return estimateFromIndustryAverage(productId, ingredientId, ingredient.unit)
  }

  // Infer quantity per product unit
  const inferredQuantity = netConsumption / totalProductSales

  // Calculate confidence based on:
  // - Sample size (more sales = higher confidence)
  // - Data quality (more snapshots = higher confidence)
  // - Time span (longer period = higher confidence)
  const sampleSize = totalProductSales
  const dataPoints = periodSnapshots.length
  const timeSpan = days
  
  let confidence = 0
  if (sampleSize >= 50 && dataPoints >= 3 && timeSpan >= 7) {
    confidence = 85 // High confidence
  } else if (sampleSize >= 20 && dataPoints >= 2 && timeSpan >= 3) {
    confidence = 65 // Medium confidence
  } else if (sampleSize >= 10) {
    confidence = 45 // Low confidence
  } else {
    confidence = 25 // Very low confidence
  }

  // Calculate efficiency score (inverse of waste)
  // For now, assume efficiency based on consistency
  const efficiencyScore = Math.min(100, confidence + 10)

  return {
    productId,
    ingredientId,
    inferredQuantity,
    unit: ingredient.unit,
    confidence,
    sampleSize,
    lastCalculated: new Date(),
    efficiencyScore,
  }
}

/**
 * Estimate consumption from industry averages when data is insufficient
 */
function estimateFromIndustryAverage(
  productId: string,
  ingredientId: string,
  unit: string
): ConsumptionRate {
  // Industry average estimates (would be configurable)
  const averages: Record<string, Record<string, number>> = {
    'ingredient-1': { // Coffee Beans
      'prod-1': 0.01, // Espresso: ~10g
      'prod-2': 0.02, // Cappuccino: ~20g
      'prod-3': 0.02, // Latte: ~20g
      'prod-4': 0.01, // Americano: ~10g
    },
    'ingredient-2': { // Milk
      'prod-2': 0.15, // Cappuccino: ~150ml
      'prod-3': 0.20, // Latte: ~200ml
    },
    'ingredient-7': { // Orange Juice
      'prod-11': 0.25, // Orange Juice: ~250ml
    },
  }

  const avg = averages[ingredientId]?.[productId] || 0.1

  return {
    productId,
    ingredientId,
    inferredQuantity: avg,
    unit,
    confidence: 20, // Low confidence for estimates
    sampleSize: 0,
    lastCalculated: new Date(),
    efficiencyScore: 50, // Neutral efficiency
  }
}

/**
 * Get all consumption rates for a product
 */
export function getProductConsumptionRates(productId: string): ConsumptionRate[] {
  const links = productIngredientLinks.filter(l => l.productId === productId)
  return links
    .map(link => inferConsumptionRate(productId, link.ingredientId))
    .filter((rate): rate is ConsumptionRate => rate !== null)
}

/**
 * Calculate real product cost using inferred consumption rates
 */
export function calculateRealProductCost(productId: string): {
  cost: number
  confidence: number
  breakdown: Array<{ ingredient: string; quantity: number; cost: number }>
} {
  const rates = getProductConsumptionRates(productId)
  
  if (rates.length === 0) {
    // Check direct stock
    const { mockDirectStock } = require('./mock-data')
    const directStock = mockDirectStock.find(
      (s: any) => s.productId === productId
    )
    if (directStock) {
      return {
        cost: directStock.unitCost,
        confidence: 100, // Direct stock is 100% accurate
        breakdown: [{ ingredient: directStock.productName, quantity: 1, cost: directStock.unitCost }],
      }
    }
    
    return { cost: 0, confidence: 0, breakdown: [] }
  }

  let totalCost = 0
  const breakdown: Array<{ ingredient: string; quantity: number; cost: number }> = []
  let minConfidence = 100

  rates.forEach(rate => {
    const ingredient = mockRawMaterials.find(m => m.id === rate.ingredientId)
    if (ingredient) {
      const ingredientCost = ingredient.costPerUnit * rate.inferredQuantity
      totalCost += ingredientCost
      breakdown.push({
        ingredient: ingredient.name,
        quantity: rate.inferredQuantity,
        cost: ingredientCost,
      })
      minConfidence = Math.min(minConfidence, rate.confidence)
    }
  })

  return {
    cost: totalCost,
    confidence: minConfidence,
    breakdown,
  }
}

/**
 * Get all inferred consumption rates (for analytics)
 */
export function getAllConsumptionRates(): ConsumptionRate[] {
  const uniquePairs = new Set<string>()
  productIngredientLinks.forEach(link => {
    uniquePairs.add(`${link.productId}-${link.ingredientId}`)
  })

  const rates: ConsumptionRate[] = []
  uniquePairs.forEach(pair => {
    const [productId, ingredientId] = pair.split('-')
    const rate = inferConsumptionRate(productId, ingredientId)
    if (rate) rates.push(rate)
  })

  return rates
}

/**
 * Calculate waste estimation for a product
 * Based on variance in consumption rates
 */
export function calculateWasteEstimate(productId: string): {
  estimatedWaste: number
  wastePercentage: number
  efficiencyScore: number
} {
  const rates = getProductConsumptionRates(productId)
  
  if (rates.length === 0) {
    return { estimatedWaste: 0, wastePercentage: 0, efficiencyScore: 100 }
  }

  // Calculate average efficiency score
  const avgEfficiency = rates.reduce((sum, r) => sum + (r.efficiencyScore || 50), 0) / rates.length
  
  // Waste percentage is inverse of efficiency
  const wastePercentage = Math.max(0, 100 - avgEfficiency)
  
  // Estimate waste cost
  const costData = calculateRealProductCost(productId)
  const estimatedWaste = (costData.cost * wastePercentage) / 100

  return {
    estimatedWaste,
    wastePercentage,
    efficiencyScore: avgEfficiency,
  }
}

/**
 * Get products sorted by waste (most wasteful first)
 */
export function getMostWastefulProducts(): Array<{
  productId: string
  productName: string
  wastePercentage: number
  estimatedWaste: number
  efficiencyScore: number
}> {
  const products = mockProducts
    .map(product => {
      const waste = calculateWasteEstimate(product.id)
      return {
        productId: product.id,
        productName: product.name,
        wastePercentage: waste.wastePercentage,
        estimatedWaste: waste.estimatedWaste,
        efficiencyScore: waste.efficiencyScore,
      }
    })
    .filter(p => p.wastePercentage > 0)
    .sort((a, b) => b.wastePercentage - a.wastePercentage)

  return products
}

/**
 * Get ingredient efficiency scores
 */
export function getIngredientEfficiencyScores(): Array<{
  ingredientId: string
  ingredientName: string
  avgEfficiencyScore: number
  productsUsing: number
  totalConsumption: number
}> {
  const ingredientMap = new Map<string, {
    ingredientId: string
    ingredientName: string
    efficiencyScores: number[]
    productsUsing: Set<string>
    totalConsumption: number
  }>()

  getAllConsumptionRates().forEach(rate => {
    const ingredient = mockRawMaterials.find(m => m.id === rate.ingredientId)
    if (!ingredient) return

    const existing = ingredientMap.get(rate.ingredientId) || {
      ingredientId: rate.ingredientId,
      ingredientName: ingredient.name,
      efficiencyScores: [],
      productsUsing: new Set<string>(),
      totalConsumption: 0,
    }

    existing.efficiencyScores.push(rate.efficiencyScore || 50)
    existing.productsUsing.add(rate.productId)
    existing.totalConsumption += rate.inferredQuantity
    ingredientMap.set(rate.ingredientId, existing)
  })

  return Array.from(ingredientMap.values()).map(item => ({
    ingredientId: item.ingredientId,
    ingredientName: item.ingredientName,
    avgEfficiencyScore: item.efficiencyScores.length > 0
      ? item.efficiencyScores.reduce((sum, s) => sum + s, 0) / item.efficiencyScores.length
      : 50,
    productsUsing: item.productsUsing.size,
    totalConsumption: item.totalConsumption,
  }))
}

