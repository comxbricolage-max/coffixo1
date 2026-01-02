// 🧪 DEMO MODE – NO DATABASE
// Flexible Staff & Stock Responsibility System
// Data-first approach: Every action is tracked and analyzed
// TODO: Replace with real database queries when MongoDB is connected

import { mockStaff, mockOrders, mockRawMaterials, mockDirectStock } from './mock-data'

// ============================================
// CORE DATA MODELS
// ============================================

// Service Types (not roles - flexible)
export type ServiceType = 'kitchen' | 'waiter' | 'cashier' | 'stock' | 'management'

// Staff Service Assignment (many-to-many)
export interface StaffService {
  id: string
  staffId: string
  serviceType: ServiceType
  assignedAt: Date
  assignedBy: string // Staff ID or 'system' or 'owner'
  active: boolean
  notes?: string
}

// Service Activity (who did what, when)
export interface ServiceActivity {
  id: string
  staffId: string
  serviceType: ServiceType
  action: string // e.g., 'prepared_order', 'served_table', 'processed_payment', 'counted_stock'
  targetId?: string // Order ID, Table ID, Stock ID, etc.
  timestamp: Date
  metadata?: Record<string, any> // Additional context
}

// Stock Responsibility Assignment
export interface StockResponsibility {
  id: string
  stockId: string // RawMaterial or DirectStock ID
  stockType: 'raw_material' | 'direct_stock'
  assignedTo: string // Staff ID, 'owner', or 'system'
  assignedAt: Date
  assignedBy: string
  mode: 'manual' | 'automated' | 'owner'
  notes?: string
}

// Stock Action (who did what stock task, when)
export interface StockAction {
  id: string
  stockId: string
  stockType: 'raw_material' | 'direct_stock'
  actionType: 'inventory_count' | 'purchase' | 'adjustment' | 'waste_record' | 'transfer'
  performedBy: string // Staff ID, 'owner', or 'system'
  timestamp: Date
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  reason?: string
  notes?: string
  metadata?: Record<string, any>
}

// Inventory Session (periodic stock counting)
export interface InventorySession {
  id: string
  sessionDate: Date
  frequency: '6_hours' | 'daily' | 'weekly' | 'manual'
  performedBy: string // Staff ID or 'owner'
  status: 'in_progress' | 'completed' | 'cancelled'
  items: InventorySessionItem[]
  expectedTotalValue: number
  countedTotalValue: number
  differenceValue: number
  variancePercentage: number
  completedAt?: Date
  notes?: string
}

export interface InventorySessionItem {
  id: string
  stockId: string
  stockType: 'raw_material' | 'direct_stock'
  expectedQuantity: number
  countedQuantity: number
  difference: number
  variancePercentage: number
  notes?: string
}

// ============================================
// MOCK DATA (for demo mode)
// ============================================

export const mockStaffServices: StaffService[] = [
  // Staff can have multiple services
  { id: 'ss-1', staffId: 'staff-1', serviceType: 'kitchen', assignedAt: new Date(), assignedBy: 'owner', active: true },
  { id: 'ss-2', staffId: 'staff-1', serviceType: 'waiter', assignedAt: new Date(), assignedBy: 'owner', active: true },
  { id: 'ss-3', staffId: 'staff-2', serviceType: 'kitchen', assignedAt: new Date(), assignedBy: 'owner', active: true },
  { id: 'ss-4', staffId: 'staff-3', serviceType: 'waiter', assignedAt: new Date(), assignedBy: 'owner', active: true },
  { id: 'ss-5', staffId: 'staff-3', serviceType: 'cashier', assignedAt: new Date(), assignedBy: 'owner', active: true },
  { id: 'ss-6', staffId: 'staff-4', serviceType: 'stock', assignedAt: new Date(), assignedBy: 'owner', active: true },
  { id: 'ss-7', staffId: 'staff-4', serviceType: 'cashier', assignedAt: new Date(), assignedBy: 'owner', active: true },
]

export const mockServiceActivities: ServiceActivity[] = [
  // Recent activities (last 7 days)
  { id: 'act-1', staffId: 'staff-1', serviceType: 'kitchen', action: 'prepared_order', targetId: 'order-1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), metadata: { orderId: 'order-1', prepTime: 12 } },
  { id: 'act-2', staffId: 'staff-1', serviceType: 'waiter', action: 'served_table', targetId: 'table-1', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), metadata: { tableNumber: '1' } },
  { id: 'act-3', staffId: 'staff-2', serviceType: 'kitchen', action: 'prepared_order', targetId: 'order-2', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), metadata: { orderId: 'order-2', prepTime: 15 } },
  { id: 'act-4', staffId: 'staff-3', serviceType: 'waiter', action: 'served_table', targetId: 'table-2', timestamp: new Date(Date.now() - 30 * 60 * 1000), metadata: { tableNumber: '2' } },
  { id: 'act-5', staffId: 'staff-3', serviceType: 'cashier', action: 'processed_payment', targetId: 'order-3', timestamp: new Date(Date.now() - 20 * 60 * 1000), metadata: { orderId: 'order-3', amount: 45.50 } },
  { id: 'act-6', staffId: 'staff-4', serviceType: 'stock', action: 'counted_stock', targetId: 'ingredient-1', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), metadata: { stockId: 'ingredient-1', variance: 0.02 } },
]

export const mockStockActions: StockAction[] = [
  { id: 'sa-1', stockId: 'ingredient-1', stockType: 'raw_material', actionType: 'inventory_count', performedBy: 'staff-4', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), quantityBefore: 30, quantityAfter: 25.5, quantityChange: -4.5, reason: 'usage', notes: 'Regular count' },
  { id: 'sa-2', stockId: 'ingredient-2', stockType: 'raw_material', actionType: 'purchase', performedBy: 'owner', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), quantityBefore: 30, quantityAfter: 100, quantityChange: 70, reason: 'restock' },
  { id: 'sa-3', stockId: 'ingredient-7', stockType: 'raw_material', actionType: 'adjustment', performedBy: 'system', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), quantityBefore: 15, quantityAfter: 20, quantityChange: 5, reason: 'correction', notes: 'System correction based on sales' },
]

export const mockInventorySessions: InventorySession[] = [
  {
    id: 'inv-1',
    sessionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    frequency: 'daily',
    performedBy: 'staff-4',
    status: 'completed',
    items: [
      { id: 'item-1', stockId: 'ingredient-1', stockType: 'raw_material', expectedQuantity: 30, countedQuantity: 25.5, difference: -4.5, variancePercentage: -15 },
      { id: 'item-2', stockId: 'ingredient-2', stockType: 'raw_material', expectedQuantity: 45, countedQuantity: 45, difference: 0, variancePercentage: 0 },
    ],
    expectedTotalValue: 150.00,
    countedTotalValue: 142.50,
    differenceValue: -7.50,
    variancePercentage: -5,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

// Staff Performance Metrics (derived from data)
export interface StaffPerformanceMetrics {
  staffId: string
  staffName: string
  services: ServiceType[]
  reliabilityScore: number // 0-100 (stock accuracy, error rate)
  efficiencyScore: number // 0-100 (speed, multitasking)
  totalActivities: number
  activitiesByService: Record<ServiceType, number>
  avgPrepTime?: number
  avgServiceTime?: number
  stockAccuracy?: number // Variance in stock counts
  errorRate?: number
  profitImpact: number // Estimated impact on profit
}

// Service Combination Analysis
export interface ServiceCombinationAnalysis {
  combination: ServiceType[]
  frequency: number // How often this combination is used
  avgEfficiency: number
  avgReliability: number
  staffCount: number
  recommendation: 'optimal' | 'good' | 'needs_review'
}

// Inventory Frequency Recommendation
export interface InventoryFrequencyRecommendation {
  recommendedFrequency: '6_hours' | 'daily' | 'weekly' | 'manual'
  confidence: number // 0-100
  reasoning: string[]
  currentVariance: number
  projectedVariance: number
  costImpact: number
}

// Process Error Analysis (not people-focused)
export interface ProcessErrorAnalysis {
  errorType: string
  frequency: number
  commonContext: string[]
  suggestedImprovement: string
  impact: 'high' | 'medium' | 'low'
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Calculate staff performance metrics from activity data
 */
export function calculateStaffPerformance(staffId: string): StaffPerformanceMetrics {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff) {
    throw new Error(`Staff ${staffId} not found`)
  }

  // Get staff services
  const services = mockStaffServices
    .filter(ss => ss.staffId === staffId && ss.active)
    .map(ss => ss.serviceType)

  // Get activities for this staff
  const activities = mockServiceActivities.filter(a => a.staffId === staffId)
  const activitiesByService: Record<ServiceType, number> = {
    kitchen: 0,
    waiter: 0,
    cashier: 0,
    stock: 0,
    management: 0,
  }

  activities.forEach(act => {
    activitiesByService[act.serviceType] = (activitiesByService[act.serviceType] || 0) + 1
  })

  // Calculate efficiency (based on speed, multitasking)
  let efficiencyScore = 50 // Base score
  const kitchenActivities = activities.filter(a => a.serviceType === 'kitchen')
  const waiterActivities = activities.filter(a => a.serviceType === 'waiter')
  
  if (kitchenActivities.length > 0) {
    const avgPrepTime = kitchenActivities.reduce((sum, a) => {
      return sum + (a.metadata?.prepTime || 15)
    }, 0) / kitchenActivities.length
    efficiencyScore += avgPrepTime < 12 ? 20 : avgPrepTime < 15 ? 10 : 0
  }

  // Multitasking bonus (multiple services)
  if (services.length > 1) {
    efficiencyScore += 15
  }

  efficiencyScore = Math.min(100, efficiencyScore)

  // Calculate reliability (stock accuracy, error rate)
  const stockActions = mockStockActions.filter(sa => sa.performedBy === staffId)
  let reliabilityScore = 70 // Base score
  
  if (stockActions.length > 0) {
    const variances = stockActions.map(sa => {
      if (sa.quantityBefore > 0) {
        return Math.abs(sa.quantityChange / sa.quantityBefore) * 100
      }
      return 0
    })
    const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length
    reliabilityScore = Math.max(0, 100 - (avgVariance * 2)) // Lower variance = higher reliability
  }

  // Calculate profit impact (estimated)
  const profitImpact = activities.length * 2.5 // Simplified calculation

  return {
    staffId,
    staffName: staff.name,
    services,
    reliabilityScore: Math.round(reliabilityScore),
    efficiencyScore: Math.round(efficiencyScore),
    totalActivities: activities.length,
    activitiesByService,
    stockAccuracy: stockActions.length > 0 ? Math.round(reliabilityScore) : undefined,
    profitImpact: Math.round(profitImpact),
  }
}

/**
 * Analyze service combinations
 */
export function analyzeServiceCombinations(): ServiceCombinationAnalysis[] {
  const combinations = new Map<string, {
    combination: ServiceType[]
    staffIds: Set<string>
    activities: ServiceActivity[]
  }>()

  mockStaffServices.forEach(ss => {
    if (!ss.active) return
    
    const staffServices = mockStaffServices
      .filter(s => s.staffId === ss.staffId && s.active)
      .map(s => s.serviceType)
      .sort()
    
    const key = staffServices.join('+')
    if (!combinations.has(key)) {
      combinations.set(key, {
        combination: staffServices,
        staffIds: new Set(),
        activities: [],
      })
    }
    
    const combo = combinations.get(key)!
    combo.staffIds.add(ss.staffId)
  })

  // Get activities for each combination
  combinations.forEach((combo, key) => {
    combo.staffIds.forEach(staffId => {
      const staffActivities = mockServiceActivities.filter(a => a.staffId === staffId)
      combo.activities.push(...staffActivities)
    })
  })

  return Array.from(combinations.values()).map(combo => {
    const avgEfficiency = combo.staffIds.size > 0
      ? Array.from(combo.staffIds).reduce((sum, id) => {
          const perf = calculateStaffPerformance(id)
          return sum + perf.efficiencyScore
        }, 0) / combo.staffIds.size
      : 50

    const avgReliability = combo.staffIds.size > 0
      ? Array.from(combo.staffIds).reduce((sum, id) => {
          const perf = calculateStaffPerformance(id)
          return sum + perf.reliabilityScore
        }, 0) / combo.staffIds.size
      : 50

    let recommendation: 'optimal' | 'good' | 'needs_review' = 'good'
    if (avgEfficiency >= 80 && avgReliability >= 80) {
      recommendation = 'optimal'
    } else if (avgEfficiency < 60 || avgReliability < 60) {
      recommendation = 'needs_review'
    }

    return {
      combination: combo.combination,
      frequency: combo.staffIds.size,
      avgEfficiency: Math.round(avgEfficiency),
      avgReliability: Math.round(avgReliability),
      staffCount: combo.staffIds.size,
      recommendation,
    }
  })
}

/**
 * Recommend inventory frequency based on variance patterns
 */
export function recommendInventoryFrequency(): InventoryFrequencyRecommendation {
  const recentSessions = mockInventorySessions
    .filter(s => s.status === 'completed')
    .slice(-10) // Last 10 sessions

  if (recentSessions.length === 0) {
    return {
      recommendedFrequency: 'daily',
      confidence: 50,
      reasoning: ['Insufficient data - defaulting to daily'],
      currentVariance: 0,
      projectedVariance: 0,
      costImpact: 0,
    }
  }

  const avgVariance = recentSessions.reduce((sum, s) => sum + Math.abs(s.variancePercentage), 0) / recentSessions.length
  const maxVariance = Math.max(...recentSessions.map(s => Math.abs(s.variancePercentage)))

  let recommendedFrequency: '6_hours' | 'daily' | 'weekly' | 'manual' = 'daily'
  const reasoning: string[] = []
  let confidence = 70

  if (maxVariance > 15 || avgVariance > 10) {
    recommendedFrequency = '6_hours'
    reasoning.push('High variance detected - more frequent counts recommended')
    confidence = 85
  } else if (maxVariance < 5 && avgVariance < 3) {
    recommendedFrequency = 'weekly'
    reasoning.push('Low variance - weekly counts may be sufficient')
    confidence = 75
  } else {
    reasoning.push('Daily counts provide good balance')
  }

  const projectedVariance = recommendedFrequency === '6_hours' 
    ? avgVariance * 0.6
    : recommendedFrequency === 'weekly'
    ? avgVariance * 1.2
    : avgVariance

  const costImpact = Math.abs(projectedVariance - avgVariance) * 10 // Simplified

  return {
    recommendedFrequency,
    confidence,
    reasoning,
    currentVariance: Math.round(avgVariance * 10) / 10,
    projectedVariance: Math.round(projectedVariance * 10) / 10,
    costImpact: Math.round(costImpact),
  }
}

/**
 * Analyze process errors (not people-focused)
 */
export function analyzeProcessErrors(): ProcessErrorAnalysis[] {
  const errors: ProcessErrorAnalysis[] = []

  // Stock variance errors
  const highVarianceSessions = mockInventorySessions.filter(s => Math.abs(s.variancePercentage) > 10)
  if (highVarianceSessions.length > 0) {
    errors.push({
      errorType: 'Stock Variance',
      frequency: highVarianceSessions.length,
      commonContext: ['Inventory counting', 'Stock management'],
      suggestedImprovement: 'Consider more frequent inventory counts or automated tracking',
      impact: 'high',
    })
  }

  // Missing stock actions
  const recentDays = 7
  const expectedActions = recentDays * 2 // Expected 2 actions per day
  const actualActions = mockStockActions.filter(sa => {
    const daysAgo = (Date.now() - sa.timestamp.getTime()) / (24 * 60 * 60 * 1000)
    return daysAgo <= recentDays
  }).length

  if (actualActions < expectedActions * 0.7) {
    errors.push({
      errorType: 'Incomplete Stock Tracking',
      frequency: expectedActions - actualActions,
      commonContext: ['Stock management', 'Inventory'],
      suggestedImprovement: 'Automate stock tracking or set reminders for regular counts',
      impact: 'medium',
    })
  }

  return errors
}

/**
 * Get all staff with their performance metrics
 */
export function getAllStaffPerformance(): StaffPerformanceMetrics[] {
  return mockStaff.map(s => calculateStaffPerformance(s.id))
}

/**
 * Get staff services for a staff member
 */
export function getStaffServices(staffId: string): ServiceType[] {
  return mockStaffServices
    .filter(ss => ss.staffId === staffId && ss.active)
    .map(ss => ss.serviceType)
}

