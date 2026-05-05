export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactEmail: string;
  phone: string;
}

export interface InventoryRecord {
  id: number;
  itemId: number;
  quantity: number;
  warehouseLocation: string;
  reorderLevel: number;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
  supplierId: number | null;
}

export interface ItemDetails extends Item {
  category: Category | null;
  supplier: Supplier | null;
  inventory: InventoryRecord | null;
}

export interface CategoryPayload {
  name?: unknown;
  description?: unknown;
}

export interface SupplierPayload {
  name?: unknown;
  contactEmail?: unknown;
  phone?: unknown;
}

export interface InventoryPayload {
  quantity?: unknown;
  warehouseLocation?: unknown;
  reorderLevel?: unknown;
}

export interface ItemPayload {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  categoryId?: unknown;
  supplierId?: unknown;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export interface WarehousePayload {
  name?: unknown;
  location?: unknown;
}
