import path from "path";
import { Warehouse, WarehousePayload } from "../types/models";
import { createValidationError } from "../utils/errors";
import { JsonFileStore } from "../utils/jsonFileStore";

interface WarehouseServiceOptions {
  filePath?: string;
}

export class WarehouseService {
  private readonly store: JsonFileStore<Warehouse>;

  constructor({ filePath }: WarehouseServiceOptions = {}) {
    this.store = new JsonFileStore<Warehouse>(
      filePath || path.join(__dirname, "..", "..", "data", "warehouses.json")
    );
  }

  list(): Warehouse[] {
    return this.store.readAll();
  }

  getById(id: number): Warehouse | null {
    return this.list().find((w) => w.id === id) || null;
  }

  create(payload: WarehousePayload): Warehouse {
    const data = normalizeWarehousePayload(payload);
    const warehouses = this.list();
    const warehouse: Warehouse = {
      id: this.store.nextId(warehouses),
      name: data.name,
      location: data.location,
    };

    warehouses.push(warehouse);
    this.store.writeAll(warehouses);
    return warehouse;
  }

  update(id: number, payload: WarehousePayload): Warehouse | null {
    const warehouses = this.list();
    const warehouse = warehouses.find((w) => w.id === id);
    if (!warehouse) return null;

    const data = normalizeWarehousePayload(payload);
    warehouse.name = data.name;
    warehouse.location = data.location;

    this.store.writeAll(warehouses);
    return warehouse;
  }

  delete(id: number): boolean {
    const warehouses = this.list();
    const next = warehouses.filter((w) => w.id !== id);
    if (next.length === warehouses.length) return false;

    this.store.writeAll(next);
    return true;
  }
}

function normalizeWarehousePayload(payload: WarehousePayload): Omit<Warehouse, "id"> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createValidationError("payload must be a JSON object");
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const location = typeof payload.location === "string" ? payload.location.trim() : "";

  if (!name) throw createValidationError("warehouse name is required");
  if (!location) throw createValidationError("warehouse location is required");

  return { name, location };
}
