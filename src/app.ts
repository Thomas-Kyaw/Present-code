import express, { Express, NextFunction, Request, Response } from "express";
import { CategoryService } from "./services/categoryService";
import { InventoryService } from "./services/inventoryService";
import { ItemService } from "./services/itemService";
import { SupplierService } from "./services/supplierService";
import { AppError, createConflictError } from "./utils/errors";
import { WarehouseService } from "./services/warehouseService";

interface CreateAppDependencies {
  categoryService?: CategoryService;
  supplierService?: SupplierService;
  inventoryService?: InventoryService;
  itemService?: ItemService;
  warehouseService?: WarehouseService;
}

export function createApp(dependencies: CreateAppDependencies = {}): Express {
  const categoryService = dependencies.categoryService ?? new CategoryService();
  const supplierService = dependencies.supplierService ?? new SupplierService();
  const inventoryService =
    dependencies.inventoryService ?? new InventoryService();
  const itemService =
    dependencies.itemService ??
    new ItemService({
      categoryService,
      supplierService,
      inventoryService,
    });
  const warehouseService =
    dependencies.warehouseService ?? new WarehouseService();

  const app = express();

  app.use(express.json());

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/api/categories", (req: Request, res: Response) => {
    res.status(200).json(categoryService.list());
  });

  app.get("/api/categories/:id", (req: Request, res: Response) => {
    const category = categoryService.getById(Number(req.params.id));
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  });

  app.post(
    "/api/categories",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        res.status(201).json(categoryService.create(req.body));
      } catch (error) {
        next(error);
      }
    },
  );

  app.put(
    "/api/categories/:id",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const category = categoryService.update(
          Number(req.params.id),
          req.body,
        );
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json(category);
      } catch (error) {
        return next(error);
      }
    },
  );

  app.delete(
    "/api/categories/:id",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const categoryId = Number(req.params.id);
        const linkedItems = itemService
          .list()
          .some((item) => item.categoryId === categoryId);

        if (linkedItems) {
          throw createConflictError(
            "Category cannot be deleted while items reference it",
          );
        }

        const deleted = categoryService.delete(categoryId);
        if (!deleted) {
          return res.status(404).json({ message: "Category not found" });
        }

        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    },
  );

  app.get("/api/suppliers", (req: Request, res: Response) => {
    res.status(200).json(supplierService.list());
  });

  app.get("/api/suppliers/:id", (req: Request, res: Response) => {
    const supplier = supplierService.getById(Number(req.params.id));
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.status(200).json(supplier);
  });

  app.post(
    "/api/suppliers",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        res.status(201).json(supplierService.create(req.body));
      } catch (error) {
        next(error);
      }
    },
  );

  app.put(
    "/api/suppliers/:id",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const supplier = supplierService.update(
          Number(req.params.id),
          req.body,
        );
        if (!supplier) {
          return res.status(404).json({ message: "Supplier not found" });
        }

        return res.status(200).json(supplier);
      } catch (error) {
        return next(error);
      }
    },
  );

  app.delete(
    "/api/suppliers/:id",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const supplierId = Number(req.params.id);
        const linkedItems = itemService
          .list()
          .some((item) => item.supplierId === supplierId);

        if (linkedItems) {
          throw createConflictError(
            "Supplier cannot be deleted while items reference it",
          );
        }

        const deleted = supplierService.delete(supplierId);
        if (!deleted) {
          return res.status(404).json({ message: "Supplier not found" });
        }

        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    },
  );

  app.get("/api/items", (req: Request, res: Response) => {
    res.status(200).json(itemService.listDetailed());
  });

  app.get("/api/items/:id", (req: Request, res: Response) => {
    const item = itemService.getDetailedById(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  });

  app.post("/api/items", (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(itemService.create(req.body));
    } catch (error) {
      next(error);
    }
  });

  app.put(
    "/api/items/:id",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const item = itemService.update(Number(req.params.id), req.body);
        if (!item) {
          return res.status(404).json({ message: "Item not found" });
        }

        return res.status(200).json(item);
      } catch (error) {
        return next(error);
      }
    },
  );

  app.delete("/api/items/:id", (req: Request, res: Response) => {
    const deleted = itemService.delete(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(204).send();
  });

  app.get("/api/inventories", (req: Request, res: Response) => {
    res.status(200).json(inventoryService.list());
  });

  app.get("/api/inventories/:id", (req: Request, res: Response) => {
    const inventory = inventoryService.getById(Number(req.params.id));
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }

    return res.status(200).json(inventory);
  });

  app.get("/api/items/:id/inventory", (req: Request, res: Response) => {
    const itemId = Number(req.params.id);
    if (!itemService.getById(itemId)) {
      return res.status(404).json({ message: "Item not found" });
    }

    const inventory = inventoryService.getByItemId(itemId);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }

    return res.status(200).json(inventory);
  });

  app.put(
    "/api/items/:id/inventory",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const itemId = Number(req.params.id);
        if (!itemService.getById(itemId)) {
          return res.status(404).json({ message: "Item not found" });
        }

        return res
          .status(200)
          .json(inventoryService.upsertForItem(itemId, req.body));
      } catch (error) {
        return next(error);
      }
    },
  );

  app.get("/api/warehouses", (req, res) => {
    res.status(200).json(warehouseService.list());
  });

  app.get("/api/warehouses/:id", (req, res) => {
    const warehouse = warehouseService.getById(Number(req.params.id));
    if (!warehouse)
      return res.status(404).json({ message: "Warehouse not found" });
    return res.status(200).json(warehouse);
  });

  app.post("/api/warehouses", (req, res, next) => {
    try {
      res.status(201).json(warehouseService.create(req.body));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/warehouses/:id", (req, res, next) => {
    try {
      const warehouse = warehouseService.update(
        Number(req.params.id),
        req.body,
      );
      if (!warehouse)
        return res.status(404).json({ message: "Warehouse not found" });
      return res.status(200).json(warehouse);
    } catch (error) {
      return next(error);
    }
  });

  app.delete("/api/warehouses/:id", (req, res) => {
    const deleted = warehouseService.delete(Number(req.params.id));
    if (!deleted)
      return res.status(404).json({ message: "Warehouse not found" });
    return res.status(204).send();
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(
    (
      error: Error | AppError,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message =
        statusCode === 500 ? "Internal server error" : error.message;

      res.status(statusCode).json({ message });
    },
  );

  return app;
}
