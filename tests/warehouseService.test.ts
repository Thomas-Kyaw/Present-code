import { createTestServices } from "./helpers/createTestServices";
import { WarehouseService } from "../src/services/warehouseService";
import os from "os";
import path from "path";
import fs from "fs";

function createWarehouseService(prefix: string) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  return new WarehouseService({
    filePath: path.join(rootDir, "warehouses.json"),
  });
}

describe("WarehouseService", () => {
  test("creates a warehouse", () => {
    const service = createWarehouseService("wh-create");
    const warehouse = service.create({
      name: "Main Store",
      location: "Block A",
    });
    expect(warehouse).toMatchObject({
      id: 1,
      name: "Main Store",
      location: "Block A",
    })
  });

  test("returns null when warehouse not found", () => {
    const service = createWarehouseService("wh-notfound");
    expect(service.getById(99)).toBeNull();
  });

  test("throws when name is missing", () => {
    const service = createWarehouseService("wh-validation");

    expect(() => {
      service.create({ location: "Block B"})
    }).toThrow("warehouse name is required");
  });

  test("delete a warehouse", () => {
    const service = createWarehouseService("wh-delete");
    const warehouse = service.create({ name: "Old Store", location: "Block C" });

    expect(service.delete(warehouse.id)).toBe(true);
    expect(service.getById(warehouse.id)).toBeNull();
  })
});
