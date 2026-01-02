// 🧪 BOM-BASED COST ENGINE
// Calculate product costs from explicit Bill of Materials (BOM)
// Products are composed of raw materials with explicit quantities
// TODO: Replace with real database queries when MongoDB is connected

import {
  mockProducts,
  mockRawMaterials,
  type Product,
  type RawMaterial,
  type BillOfMaterial,
} from './mock-data'

// Raw Material Inventory Entry (per material in a snapshot)
export interface RawMaterialInventoryEntry {
  rawMaterialId: string
  rawMaterialName: string
  quantityBefore: number
  quantityAfter: number
  difference: number
  unit: string
  unitCost: number
  financialImpact: number // difference × unitCost
}

// Inventory Snapshot (immutable audit record)
export interface InventorySnapshot {
  id: string
  snapshotType: 'daily' | 'weekly' | 'monthly' | 'manual'
  performedBy: {
    userId?: string
    name: string
    role?: string
  }
  performedAt: Date
  timezone: string
  note?: string
  // Financial summary
  totalValueBefore: number
  totalValueAfter: number
  totalFinancialImpact: number
  // Per-material details
  materials: RawMaterialInventoryEntry[]
  // Metadata
  createdAt: Date
  isImmutable: true // Always true - cannot be edited or deleted
}

// Legacy InventoryCount (kept for backward compatibility)
export interface InventoryCount {
  id: string
  rawMaterialId: string
  countedQuantity: number
  previousQuantity: number
  countedAt: Date
  countedBy?: string
  notes?: string
}

// Store inventory snapshots (in real app, this would be in database)
let inventorySnapshotHistory: InventorySnapshot[] = []
let inventoryCountHistory: InventoryCount[] = [] // Legacy support

/**
 * Calculate product cost from BOM
 * Cost = SUM(rawMaterialQuantity × rawMaterialUnitCost)
 */
export function calculateBOMProductCost(productId: string): {
  cost: number
  breakdown: Array<{
    rawMaterialId: string
    rawMaterialName: string
    quantityRequired: number
    unit: string
    unitCost: number
    totalCost: number
  }>
  margin?: number
  profit?: number
} {
  const product = mockProducts.find(p => p.id === productId)
  if (!product) {
    return { cost: 0, breakdown: [] }
  }

  // If product has BOM, use it
  if (product.bom && product.bom.length > 0) {
    let totalCost = 0
    const breakdown: Array<{
      rawMaterialId: string
      rawMaterialName: string
      quantityRequired: number
      unit: string
      unitCost: number
      totalCost: number
    }> = []

    product.bom.forEach(bomItem => {
      const rawMaterial = mockRawMaterials.find(rm => rm.id === bomItem.rawMaterialId)
      if (rawMaterial) {
        const itemCost = bomItem.quantityRequiredPerUnit * rawMaterial.costPerUnit
        totalCost += itemCost
        breakdown.push({
          rawMaterialId: rawMaterial.id,
          rawMaterialName: rawMaterial.name,
          quantityRequired: bomItem.quantityRequiredPerUnit,
          unit: bomItem.unit,
          unitCost: rawMaterial.costPerUnit,
          totalCost: itemCost,
        })
      }
    })

    const margin = product.price > 0 ? ((product.price - totalCost) / product.price) * 100 : 0
    const profit = product.price - totalCost

    return {
      cost: totalCost,
      breakdown,
      margin,
      profit,
    }
  }

  // Fallback: no BOM defined
  return { cost: 0, breakdown: [] }
}

/**
 * Get all products with BOM cost calculation
 */
export function getAllProductsWithBOMCost(): Array<{
  product: Product
  cost: number
  margin: number
  profit: number
  breakdown: Array<{
    rawMaterialId: string
    rawMaterialName: string
    quantityRequired: number
    unit: string
    unitCost: number
    totalCost: number
  }>
}> {
  return mockProducts
    .map(product => {
      const costData = calculateBOMProductCost(product.id)
      return {
        product,
        cost: costData.cost,
        margin: costData.margin || 0,
        profit: costData.profit || 0,
        breakdown: costData.breakdown,
      }
    })
    .filter(p => p.cost > 0) // Only products with BOM
}

/**
 * Create inventory snapshot (immutable audit record)
 * This is the main function for creating inventory records
 */
export function createInventorySnapshot(
  materials: Array<{
    rawMaterialId: string
    countedQuantity: number
  }>,
  performedBy: {
    userId?: string
    name: string
    role?: string
  },
  snapshotType: 'daily' | 'weekly' | 'monthly' | 'manual',
  note?: string
): InventorySnapshot {
  const performedAt = new Date()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Calculate values before update
  const totalValueBefore = mockRawMaterials.reduce((sum, rm) => {
    return sum + (rm.currentQuantity * rm.costPerUnit)
  }, 0)

  // Build material entries with before/after/difference
  const materialEntries: RawMaterialInventoryEntry[] = materials.map(({ rawMaterialId, countedQuantity }) => {
    const rawMaterial = mockRawMaterials.find(rm => rm.id === rawMaterialId)
    if (!rawMaterial) {
      throw new Error(`Raw material ${rawMaterialId} not found`)
    }

    const quantityBefore = rawMaterial.currentQuantity
    const quantityAfter = countedQuantity
    const difference = quantityAfter - quantityBefore
    const financialImpact = difference * rawMaterial.costPerUnit

    return {
      rawMaterialId,
      rawMaterialName: rawMaterial.name,
      quantityBefore,
      quantityAfter,
      difference,
      unit: rawMaterial.unit,
      unitCost: rawMaterial.costPerUnit,
      financialImpact,
    }
  })

  // Update raw material quantities (in real app, this would be a database transaction)
  materialEntries.forEach(entry => {
    const rawMaterial = mockRawMaterials.find(rm => rm.id === entry.rawMaterialId)
    if (rawMaterial) {
      rawMaterial.currentQuantity = entry.quantityAfter
    }
  })

  // Calculate values after update
  const totalValueAfter = mockRawMaterials.reduce((sum, rm) => {
    return sum + (rm.currentQuantity * rm.costPerUnit)
  }, 0)

  const totalFinancialImpact = materialEntries.reduce((sum, entry) => sum + entry.financialImpact, 0)

  // Create immutable snapshot
  const snapshot: InventorySnapshot = {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    snapshotType,
    performedBy,
    performedAt,
    timezone,
    note,
    totalValueBefore,
    totalValueAfter,
    totalFinancialImpact,
    materials: materialEntries,
    createdAt: new Date(),
    isImmutable: true,
  }

  // Save to history (immutable - cannot be edited or deleted)
  inventorySnapshotHistory.push(snapshot)

  // Also create legacy InventoryCount entries for backward compatibility
  materials.forEach(({ rawMaterialId, countedQuantity }) => {
    const rawMaterial = mockRawMaterials.find(rm => rm.id === rawMaterialId)
    if (rawMaterial) {
      const previousQuantity = rawMaterial.currentQuantity
      inventoryCountHistory.push({
        id: `count-${Date.now()}-${rawMaterialId}`,
        rawMaterialId,
        countedQuantity,
        previousQuantity,
        countedAt: performedAt,
        countedBy: performedBy.userId,
        notes: note,
      })
    }
  })

  return snapshot
}

/**
 * Save inventory count (legacy function - wraps createInventorySnapshot)
 * @deprecated Use createInventorySnapshot for new code
 */
export function saveInventoryCount(
  rawMaterialId: string,
  countedQuantity: number,
  countedBy?: string,
  notes?: string
): InventoryCount {
  const snapshot = createInventorySnapshot(
    [{ rawMaterialId, countedQuantity }],
    {
      userId: countedBy,
      name: countedBy || 'System',
      role: undefined,
    },
    'manual',
    notes
  )

  // Return legacy format
  return {
    id: snapshot.id,
    rawMaterialId,
    countedQuantity,
    previousQuantity: snapshot.materials[0]?.quantityBefore || 0,
    countedAt: snapshot.performedAt,
    countedBy,
    notes,
  }
}

/**
 * Get all inventory snapshots (read-only, immutable)
 */
export function getAllInventorySnapshots(): InventorySnapshot[] {
  return [...inventorySnapshotHistory].sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime())
}

/**
 * Get inventory snapshot by ID
 */
export function getInventorySnapshotById(snapshotId: string): InventorySnapshot | undefined {
  return inventorySnapshotHistory.find(s => s.id === snapshotId)
}

/**
 * Get inventory snapshots for a specific raw material
 */
export function getInventorySnapshotsForMaterial(rawMaterialId: string): InventorySnapshot[] {
  return inventorySnapshotHistory
    .filter(snapshot => snapshot.materials.some(m => m.rawMaterialId === rawMaterialId))
    .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime())
}

/**
 * Get inventory count history (legacy function)
 */
export function getInventoryCountHistory(rawMaterialId?: string): InventoryCount[] {
  if (rawMaterialId) {
    return inventoryCountHistory.filter(c => c.rawMaterialId === rawMaterialId)
  }
  return [...inventoryCountHistory]
}

/**
 * Get all raw materials ready for inventory count
 */
export function getRawMaterialsForInventory(): Array<{
  rawMaterial: RawMaterial
  lastCounted?: InventorySnapshot
  daysSinceLastCount?: number
}> {
  return mockRawMaterials.map(rawMaterial => {
    const snapshots = getInventorySnapshotsForMaterial(rawMaterial.id)
    const lastSnapshot = snapshots.length > 0 ? snapshots[0] : undefined
    
    const daysSinceLastCount = lastSnapshot
      ? Math.floor((Date.now() - lastSnapshot.performedAt.getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    return {
      rawMaterial,
      lastCounted: lastSnapshot,
      daysSinceLastCount,
    }
  })
}

/**
 * Calculate total inventory value (raw materials only)
 */
export function calculateRawMaterialInventoryValue(): number {
  return mockRawMaterials.reduce((total, rm) => {
    return total + (rm.currentQuantity * rm.costPerUnit)
  }, 0)
}

