// 🧪 ADVANCED RESTAURANT ANALYTICS & PERFORMANCE INTELLIGENCE
// Business-focused analytics with explainable metrics
// TODO: Replace with real database queries when MongoDB is connected

import {
  mockOrders,
  mockProducts,
  mockStaff,
  mockTables,
  calculateOrderTimes,
  getStaffPerformance,
  type Order,
  type Staff,
} from './mock-data'

// ============================================
// REVENUE GROWTH ANALYTICS
// ============================================

export interface RevenueGrowth {
  today: number
  yesterday: number
  thisWeek: number
  lastWeek: number
  thisMonth: number
  lastMonth: number
  dayGrowth: number // Percentage
  weekGrowth: number
  monthGrowth: number
  trend: 'up' | 'down' | 'stable'
}

export function calculateRevenueGrowth(): RevenueGrowth {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const calculateRevenue = (start: Date, end: Date) => {
    return mockOrders
      .filter(o => o.createdAt >= start && o.createdAt < end)
      .reduce((sum, o) => sum + o.total, 0)
  }

  const todayRevenue = calculateRevenue(today, new Date(today.getTime() + 24 * 60 * 60 * 1000))
  const yesterdayRevenue = calculateRevenue(yesterday, today)
  const thisWeekRevenue = calculateRevenue(thisWeekStart, new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000))
  const lastWeekRevenue = calculateRevenue(lastWeekStart, thisWeekStart)
  const thisMonthRevenue = calculateRevenue(thisMonthStart, new Date(now.getFullYear(), now.getMonth() + 1, 1))
  const lastMonthRevenue = calculateRevenue(lastMonthStart, lastMonthEnd)

  const dayGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
  const weekGrowth = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0
  const monthGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (dayGrowth > 5) trend = 'up'
  else if (dayGrowth < -5) trend = 'down'

  return {
    today: todayRevenue,
    yesterday: yesterdayRevenue,
    thisWeek: thisWeekRevenue,
    lastWeek: lastWeekRevenue,
    thisMonth: thisMonthRevenue,
    lastMonth: lastMonthRevenue,
    dayGrowth: Math.round(dayGrowth * 10) / 10,
    weekGrowth: Math.round(weekGrowth * 10) / 10,
    monthGrowth: Math.round(monthGrowth * 10) / 10,
    trend,
  }
}

// ============================================
// ORDER LIFECYCLE ANALYTICS
// ============================================

export interface OrderLifecycleMetrics {
  avgPreparationTime: number // minutes
  avgServiceTime: number // minutes
  avgTotalDuration: number // minutes
  preparationTimeDistribution: {
    fast: number // < 10 min
    normal: number // 10-20 min
    slow: number // > 20 min
  }
  serviceTimeDistribution: {
    fast: number // < 2 min
    normal: number // 2-5 min
    slow: number // > 5 min
  }
  bottleneckPeriods: Array<{
    hour: number
    avgPrepTime: number
    avgServiceTime: number
    orderCount: number
  }>
}

export function calculateOrderLifecycleMetrics(): OrderLifecycleMetrics {
  const completedOrders = mockOrders.filter(o => o.servedAt)
  
  let totalPrepTime = 0
  let totalServiceTime = 0
  let totalDuration = 0
  let prepCount = 0
  let serviceCount = 0
  let durationCount = 0

  const prepDistribution = { fast: 0, normal: 0, slow: 0 }
  const serviceDistribution = { fast: 0, normal: 0, slow: 0 }

  // Group by hour for bottleneck detection
  const hourlyMetrics = new Map<number, { prepTimes: number[]; serviceTimes: number[]; count: number }>()

  completedOrders.forEach(order => {
    const times = calculateOrderTimes(order)
    
    if (times.preparationTime !== null) {
      totalPrepTime += times.preparationTime
      prepCount++
      
      if (times.preparationTime < 10) prepDistribution.fast++
      else if (times.preparationTime <= 20) prepDistribution.normal++
      else prepDistribution.slow++

      const hour = order.createdAt.getHours()
      if (!hourlyMetrics.has(hour)) {
        hourlyMetrics.set(hour, { prepTimes: [], serviceTimes: [], count: 0 })
      }
      const hourData = hourlyMetrics.get(hour)!
      hourData.prepTimes.push(times.preparationTime)
      hourData.count++
    }

    if (times.serviceTime !== null) {
      totalServiceTime += times.serviceTime
      serviceCount++
      
      if (times.serviceTime < 2) serviceDistribution.fast++
      else if (times.serviceTime <= 5) serviceDistribution.normal++
      else serviceDistribution.slow++

      const hour = order.createdAt.getHours()
      if (!hourlyMetrics.has(hour)) {
        hourlyMetrics.set(hour, { prepTimes: [], serviceTimes: [], count: 0 })
      }
      const hourData = hourlyMetrics.get(hour)!
      hourData.serviceTimes.push(times.serviceTime)
    }

    if (times.totalCycleTime !== null) {
      totalDuration += times.totalCycleTime
      durationCount++
    }
  })

  const bottleneckPeriods = Array.from(hourlyMetrics.entries())
    .map(([hour, data]) => ({
      hour,
      avgPrepTime: data.prepTimes.length > 0
        ? data.prepTimes.reduce((sum, t) => sum + t, 0) / data.prepTimes.length
        : 0,
      avgServiceTime: data.serviceTimes.length > 0
        ? data.serviceTimes.reduce((sum, t) => sum + t, 0) / data.serviceTimes.length
        : 0,
      orderCount: data.count,
    }))
    .filter(b => b.orderCount > 0)
    .sort((a, b) => b.avgPrepTime - a.avgPrepTime) // Sort by slowest prep time
    .slice(0, 5)

  return {
    avgPreparationTime: prepCount > 0 ? Math.round((totalPrepTime / prepCount) * 10) / 10 : 0,
    avgServiceTime: serviceCount > 0 ? Math.round((totalServiceTime / serviceCount) * 10) / 10 : 0,
    avgTotalDuration: durationCount > 0 ? Math.round((totalDuration / durationCount) * 10) / 10 : 0,
    preparationTimeDistribution: prepDistribution,
    serviceTimeDistribution: serviceDistribution,
    bottleneckPeriods,
  }
}

// ============================================
// BOTTLENECK DETECTION
// ============================================

export interface BottleneckAnalysis {
  kitchenOverload: {
    detected: boolean
    currentLoad: number
    capacity: number
    overloadPeriods: Array<{ hour: number; load: number }>
  }
  slowServiceAlerts: Array<{
    orderId: string
    tableNumber: string
    waitingTime: number // minutes
    status: string
  }>
  kitchenSlowItems: Array<{
    productId: string
    productName: string
    avgPrepTime: number
    orderCount: number
  }>
}

export function detectBottlenecks(): BottleneckAnalysis {
  const KITCHEN_CAPACITY = 10 // Max concurrent orders
  const SLOW_SERVICE_THRESHOLD = 5 // minutes waiting for service
  const SLOW_PREP_THRESHOLD = 20 // minutes for preparation

  // Kitchen overload detection
  const preparingOrders = mockOrders.filter(o => o.status === 'preparing')
  const currentLoad = preparingOrders.length
  const isOverloaded = currentLoad >= KITCHEN_CAPACITY * 0.8 // 80% capacity threshold

  // Group by hour to find overload periods
  const hourlyLoad = new Map<number, number>()
  mockOrders.forEach(order => {
    if (order.status === 'preparing' || order.startedAt) {
      const hour = order.createdAt.getHours()
      hourlyLoad.set(hour, (hourlyLoad.get(hour) || 0) + 1)
    }
  })

  const overloadPeriods = Array.from(hourlyLoad.entries())
    .filter(([_, load]) => load >= KITCHEN_CAPACITY * 0.8)
    .map(([hour, load]) => ({ hour, load }))
    .sort((a, b) => b.load - a.load)

  // Slow service alerts (ready orders waiting too long)
  const readyOrders = mockOrders.filter(o => o.status === 'ready' && o.readyAt)
  const slowServiceAlerts = readyOrders
    .map(order => {
      const waitingTime = (Date.now() - order.readyAt!.getTime()) / 60000
      return {
        orderId: order.id,
        tableNumber: order.tableNumber,
        waitingTime: Math.round(waitingTime * 10) / 10,
        status: order.status,
      }
    })
    .filter(alert => alert.waitingTime > SLOW_SERVICE_THRESHOLD)
    .sort((a, b) => b.waitingTime - a.waitingTime)

  // Slow kitchen items (products that take too long to prepare)
  const productPrepTimes = new Map<string, { times: number[]; count: number }>()
  mockOrders.forEach(order => {
    if (order.startedAt && order.readyAt) {
      const prepTime = (order.readyAt.getTime() - order.startedAt.getTime()) / 60000
      order.items.forEach(item => {
        if (!productPrepTimes.has(item.productId)) {
          productPrepTimes.set(item.productId, { times: [], count: 0 })
        }
        const data = productPrepTimes.get(item.productId)!
        data.times.push(prepTime)
        data.count += item.quantity
      })
    }
  })

  const kitchenSlowItems = Array.from(productPrepTimes.entries())
    .map(([productId, data]) => {
      const avgPrepTime = data.times.reduce((sum, t) => sum + t, 0) / data.times.length
      const product = mockProducts.find(p => p.id === productId)
      return {
        productId,
        productName: product?.name || 'Unknown',
        avgPrepTime: Math.round(avgPrepTime * 10) / 10,
        orderCount: data.count,
      }
    })
    .filter(item => item.avgPrepTime > SLOW_PREP_THRESHOLD)
    .sort((a, b) => b.avgPrepTime - a.avgPrepTime)
    .slice(0, 5)

  return {
    kitchenOverload: {
      detected: isOverloaded,
      currentLoad,
      capacity: KITCHEN_CAPACITY,
      overloadPeriods,
    },
    slowServiceAlerts,
    kitchenSlowItems,
  }
}

// ============================================
// PEAK HOURS & DEAD HOURS
// ============================================

export interface PeakHoursAnalysis {
  peakHours: Array<{ hour: number; hourLabel: string; orders: number; revenue: number; avgOrderValue: number }>
  deadHours: Array<{ hour: number; hourLabel: string; orders: number; revenue: number }>
  busiestHour: { hour: number; hourLabel: string; orders: number; revenue: number } | null
  quietestHour: { hour: number; hourLabel: string; orders: number; revenue: number } | null
}

export function analyzePeakHours(): PeakHoursAnalysis {
  const hourlyStats = new Map<number, { orders: number; revenue: number }>()

  mockOrders.forEach(order => {
    const hour = order.createdAt.getHours()
    const existing = hourlyStats.get(hour) || { orders: 0, revenue: 0 }
    existing.orders++
    existing.revenue += order.total
    hourlyStats.set(hour, existing)
  })

  const allHours = Array.from(hourlyStats.entries())
    .map(([hour, stats]) => ({
      hour,
      hourLabel: `${hour}:00`,
      orders: stats.orders,
      revenue: stats.revenue,
      avgOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0,
    }))
    .sort((a, b) => b.orders - a.orders)

  const avgOrders = allHours.length > 0
    ? allHours.reduce((sum, h) => sum + h.orders, 0) / allHours.length
    : 0

  const peakHours = allHours.filter(h => h.orders > avgOrders * 1.2).slice(0, 5)
  const deadHours = allHours.filter(h => h.orders < avgOrders * 0.5).slice(0, 5)

  const busiestHour = allHours.length > 0 ? allHours[0] : null
  const quietestHour = allHours.length > 0 ? allHours[allHours.length - 1] : null

  return {
    peakHours,
    deadHours,
    busiestHour,
    quietestHour,
  }
}

// ============================================
// TABLE TURNOVER EFFICIENCY
// ============================================

export interface TableTurnoverMetrics {
  avgTurnoverTime: number // minutes
  todayTurnover: number // times
  weeklyAvgTurnover: number
  efficiencyScore: number // 0-100
  slowTables: Array<{ tableNumber: string; avgTime: number; orderCount: number }>
}

export function calculateTableTurnover(): TableTurnoverMetrics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = mockOrders.filter(o => o.createdAt >= today)

  // Group orders by table
  const tableOrders = new Map<string, Order[]>()
  todayOrders.forEach(order => {
    const existing = tableOrders.get(order.tableNumber) || []
    existing.push(order)
    tableOrders.set(order.tableNumber, existing)
  })

  // Calculate turnover time per table (time between first and last order)
  const tableTurnoverTimes: number[] = []
  tableOrders.forEach((orders, tableNumber) => {
    if (orders.length > 1) {
      const sorted = orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      const firstOrder = sorted[0]
      const lastOrder = sorted[sorted.length - 1]
      const turnoverTime = (lastOrder.createdAt.getTime() - firstOrder.createdAt.getTime()) / 60000
      tableTurnoverTimes.push(turnoverTime)
    }
  })

  const avgTurnoverTime = tableTurnoverTimes.length > 0
    ? tableTurnoverTimes.reduce((sum, t) => sum + t, 0) / tableTurnoverTimes.length
    : 0

  // Calculate today's turnover (how many times tables were used)
  const todayTurnover = tableOrders.size

  // Weekly average (mock - would use historical data)
  const weeklyAvgTurnover = todayTurnover * 7 // Simplified

  // Efficiency score (lower turnover time = higher score, max 100)
  const IDEAL_TURNOVER_TIME = 60 // 1 hour ideal
  const efficiencyScore = Math.max(0, Math.min(100, 100 - ((avgTurnoverTime - IDEAL_TURNOVER_TIME) / IDEAL_TURNOVER_TIME) * 50))

  // Slow tables (tables with long average time)
  const slowTables = Array.from(tableOrders.entries())
    .map(([tableNumber, orders]) => {
      if (orders.length === 0) return null
      const sorted = orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      const firstOrder = sorted[0]
      const lastOrder = sorted[sorted.length - 1]
      const avgTime = (lastOrder.createdAt.getTime() - firstOrder.createdAt.getTime()) / 60000 / orders.length
      return {
        tableNumber,
        avgTime: Math.round(avgTime * 10) / 10,
        orderCount: orders.length,
      }
    })
    .filter((t): t is { tableNumber: string; avgTime: number; orderCount: number } => t !== null)
    .filter(t => t.avgTime > 90) // More than 90 minutes average
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 5)

  return {
    avgTurnoverTime: Math.round(avgTurnoverTime * 10) / 10,
    todayTurnover,
    weeklyAvgTurnover,
    efficiencyScore: Math.round(efficiencyScore),
    slowTables,
  }
}

// ============================================
// STAFF PERFORMANCE ANALYTICS (DETAILED)
// ============================================

export interface DetailedStaffPerformance {
  staffId: string
  staffName: string
  role: string
  ordersHandled: number
  avgHandlingTime: number // minutes
  errors: number
  delays: number
  ordersPerHour: number
  efficiencyScore: number // 0-100, calculated
  shiftPerformance: {
    morning: { orders: number; avgTime: number }
    afternoon: { orders: number; avgTime: number }
    evening: { orders: number; avgTime: number }
  }
}

export function getDetailedStaffPerformance(staffId?: string): DetailedStaffPerformance[] {
  const staffPerf = getStaffPerformance(mockOrders, mockStaff)
  const filteredPerf = staffId ? staffPerf.filter(s => s.staffId === staffId) : staffPerf

  return filteredPerf.map(perf => {
    const staff = mockStaff.find(s => s.id === perf.staffId)
    if (!staff) return null

    // Calculate orders per hour (assuming 8-hour shift)
    const SHIFT_HOURS = 8
    const ordersPerHour = perf.ordersHandled / SHIFT_HOURS

    // Calculate efficiency score
    // Base score: 100, deduct for delays and slow times
    let efficiencyScore = 100
    if (perf.role === 'kitchen' && perf.avgPrepTime) {
      // Ideal prep time: 12 minutes
      const idealTime = 12
      const timeDiff = Math.abs(perf.avgPrepTime - idealTime)
      efficiencyScore -= timeDiff * 2 // Deduct 2 points per minute difference
    }
    if (perf.role === 'waiter' && perf.avgServiceTime) {
      // Ideal service time: 3 minutes
      const idealTime = 3
      const timeDiff = Math.abs(perf.avgServiceTime - idealTime)
      efficiencyScore -= timeDiff * 5 // Deduct 5 points per minute difference
    }
    // Deduct for delays
    const delayPenalty = (perf.delayedPercentage / 100) * 30 // Max 30 point penalty
    efficiencyScore -= delayPenalty
    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore))

    // Calculate shift performance (mock - would use actual shift data)
    const shiftPerformance = {
      morning: { orders: Math.floor(perf.ordersHandled * 0.3), avgTime: perf.avgPrepTime || perf.avgServiceTime || 0 },
      afternoon: { orders: Math.floor(perf.ordersHandled * 0.5), avgTime: perf.avgPrepTime || perf.avgServiceTime || 0 },
      evening: { orders: Math.floor(perf.ordersHandled * 0.2), avgTime: perf.avgPrepTime || perf.avgServiceTime || 0 },
    }

    // Calculate average handling time
    let avgHandlingTime = 0
    if (perf.role === 'kitchen' && perf.avgPrepTime) {
      avgHandlingTime = perf.avgPrepTime
    } else if (perf.role === 'waiter' && perf.avgServiceTime) {
      avgHandlingTime = perf.avgServiceTime
    }

    return {
      staffId: perf.staffId,
      staffName: perf.staffName,
      role: perf.role,
      ordersHandled: perf.ordersHandled,
      avgHandlingTime: Math.round(avgHandlingTime * 10) / 10,
      errors: 0, // Would be calculated from actual error tracking
      delays: perf.delayedOrders,
      ordersPerHour: Math.round(ordersPerHour * 10) / 10,
      efficiencyScore: Math.round(efficiencyScore),
      shiftPerformance,
    }
  }).filter((p): p is DetailedStaffPerformance => p !== null)
}

// ============================================
// KITCHEN PERFORMANCE ANALYTICS
// ============================================

export interface KitchenPerformanceMetrics {
  ordersPerHour: number
  avgPrepTimePerItem: number // minutes
  slowItems: Array<{ productId: string; productName: string; avgPrepTime: number; orderCount: number }>
  rushHourPerformance: {
    hour: number
    hourLabel: string
    orders: number
    avgPrepTime: number
    efficiency: number // 0-100
  }[]
  kitchenLoadIndicator: 'low' | 'medium' | 'high'
}

export function getKitchenPerformanceMetrics(): KitchenPerformanceMetrics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = mockOrders.filter(o => o.createdAt >= today && o.status !== 'pending')

  // Orders per hour (assuming 8-hour operation)
  const OPERATION_HOURS = 8
  const ordersPerHour = todayOrders.length / OPERATION_HOURS

  // Average prep time per item
  let totalPrepTime = 0
  let totalItems = 0
  todayOrders.forEach(order => {
    if (order.startedAt && order.readyAt) {
      const prepTime = (order.readyAt.getTime() - order.startedAt.getTime()) / 60000
      totalPrepTime += prepTime
      totalItems += order.items.length
    }
  })
  const avgPrepTimePerItem = totalItems > 0 ? totalPrepTime / totalItems : 0

  // Slow items (from bottleneck detection)
  const bottlenecks = detectBottlenecks()
  const slowItems = bottlenecks.kitchenSlowItems

  // Rush hour performance
  const hourlyKitchen = new Map<number, { orders: Order[]; prepTimes: number[] }>()
  todayOrders.forEach(order => {
    if (order.startedAt && order.readyAt) {
      const hour = order.createdAt.getHours()
      const prepTime = (order.readyAt.getTime() - order.startedAt.getTime()) / 60000
      if (!hourlyKitchen.has(hour)) {
        hourlyKitchen.set(hour, { orders: [], prepTimes: [] })
      }
      const data = hourlyKitchen.get(hour)!
      data.orders.push(order)
      data.prepTimes.push(prepTime)
    }
  })

  const rushHourPerformance = Array.from(hourlyKitchen.entries())
    .map(([hour, data]) => {
      const avgPrepTime = data.prepTimes.length > 0
        ? data.prepTimes.reduce((sum, t) => sum + t, 0) / data.prepTimes.length
        : 0
      // Efficiency: ideal is 12 min, calculate score
      const idealTime = 12
      const efficiency = Math.max(0, Math.min(100, 100 - ((avgPrepTime - idealTime) / idealTime) * 50))
      return {
        hour,
        hourLabel: `${hour}:00`,
        orders: data.orders.length,
        avgPrepTime: Math.round(avgPrepTime * 10) / 10,
        efficiency: Math.round(efficiency),
      }
    })
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5)

  // Kitchen load indicator
  const preparingOrders = mockOrders.filter(o => o.status === 'preparing')
  const KITCHEN_CAPACITY = 10
  const loadPercentage = (preparingOrders.length / KITCHEN_CAPACITY) * 100
  let loadIndicator: 'low' | 'medium' | 'high' = 'low'
  if (loadPercentage >= 80) loadIndicator = 'high'
  else if (loadPercentage >= 50) loadIndicator = 'medium'

  return {
    ordersPerHour: Math.round(ordersPerHour * 10) / 10,
    avgPrepTimePerItem: Math.round(avgPrepTimePerItem * 10) / 10,
    slowItems,
    rushHourPerformance,
    kitchenLoadIndicator: loadIndicator,
  }
}

// ============================================
// SERVICE FLOW ANALYTICS
// ============================================

export interface ServiceFlowMetrics {
  pendingTooLong: Array<{
    orderId: string
    tableNumber: string
    waitingTime: number // minutes
    status: string
  }>
  tableWaitingTime: {
    avg: number
    max: number
    tablesWaiting: number
  }
  serviceSpeedRanking: Array<{
    staffId: string
    staffName: string
    avgServiceTime: number
    ordersServed: number
    rank: number
  }>
}

export function getServiceFlowMetrics(): ServiceFlowMetrics {
  const PENDING_THRESHOLD = 10 // minutes

  // Orders pending too long
  const pendingOrders = mockOrders.filter(o => o.status === 'pending' || o.status === 'preparing')
  const pendingTooLong = pendingOrders
    .map(order => {
      const waitingTime = (Date.now() - order.createdAt.getTime()) / 60000
      return {
        orderId: order.id,
        tableNumber: order.tableNumber,
        waitingTime: Math.round(waitingTime * 10) / 10,
        status: order.status,
      }
    })
    .filter(alert => alert.waitingTime > PENDING_THRESHOLD)
    .sort((a, b) => b.waitingTime - a.waitingTime)

  // Table waiting time
  const readyOrders = mockOrders.filter(o => o.status === 'ready' && o.readyAt)
  const waitingTimes = readyOrders.map(order => {
    return (Date.now() - order.readyAt!.getTime()) / 60000
  })
  const avgWaitingTime = waitingTimes.length > 0
    ? waitingTimes.reduce((sum, t) => sum + t, 0) / waitingTimes.length
    : 0
  const maxWaitingTime = waitingTimes.length > 0 ? Math.max(...waitingTimes) : 0
  const tablesWaiting = new Set(readyOrders.map(o => o.tableNumber)).size

  // Service speed ranking
  const staffPerf = getStaffPerformance(mockOrders, mockStaff)
  const waiters = staffPerf.filter(s => s.role === 'waiter' && s.avgServiceTime)
  const serviceSpeedRanking = waiters
    .map(waiter => ({
      staffId: waiter.staffId,
      staffName: waiter.staffName,
      avgServiceTime: waiter.avgServiceTime || 0,
      ordersServed: waiter.ordersHandled,
      rank: 0, // Will be set after sorting
    }))
    .sort((a, b) => a.avgServiceTime - b.avgServiceTime) // Faster = better rank
    .map((waiter, index) => ({
      ...waiter,
      rank: index + 1,
    }))

  return {
    pendingTooLong,
    tableWaitingTime: {
      avg: Math.round(avgWaitingTime * 10) / 10,
      max: Math.round(maxWaitingTime),
      tablesWaiting,
    },
    serviceSpeedRanking,
  }
}

