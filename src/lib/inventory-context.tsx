'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import type {
  Product,
  StockMovement,
  Supplier,
  PurchaseOrder,
  StockMovementType,
  PurchaseOrderStatus,
  StockStatus,
} from '@/types';
import {
  mockProducts,
  mockStockMovements,
  mockSuppliers,
  mockPurchaseOrders,
} from '@/lib/inventory-mock-data';
import { isApiMode } from '@/config/app.config';
import { inventoryService } from '@/lib/api';

interface InventoryContextType {
  products: Product[];
  movements: StockMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  addProduct: (product: Omit<Product, 'id' | 'businessId' | 'status'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordMovement: (data: {
    productId: string;
    type: StockMovementType;
    quantity: number;
    reference?: string;
    note?: string;
    unitCost?: number;
  }) => StockMovement | null;
  adjustStock: (
    productId: string,
    amount: number,
    mode: 'delta' | 'exact',
    reason: string,
    reference?: string
  ) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'businessId'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  createPurchaseOrder: (
    order: Omit<PurchaseOrder, 'id' | 'businessId' | 'poNumber'>
  ) => PurchaseOrder;
  updatePOStatus: (id: string, status: PurchaseOrderStatus) => void;
  quickReorder: (productId: string, quantity: number, supplierId?: string) => PurchaseOrder | null;
  resetInventory: () => void;
  totalInventoryCost: number;
  totalRetailValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

function computeStatus(stock: number, reorderLevel: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

const STORAGE_KEYS = {
  products: 'caibos_inventory_products',
  movements: 'caibos_inventory_movements',
  suppliers: 'caibos_inventory_suppliers',
  purchaseOrders: 'caibos_inventory_purchase_orders',
};

interface InventoryStoreState {
  products: Product[];
  movements: StockMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
}

const INITIAL_STATE: InventoryStoreState = {
  products: mockProducts,
  movements: mockStockMovements,
  suppliers: mockSuppliers,
  purchaseOrders: mockPurchaseOrders,
};

let clientState: InventoryStoreState | null = null;
const inventoryListeners = new Set<() => void>();

function notifyInventoryListeners() {
  inventoryListeners.forEach(listener => listener());
}

function loadClientState(): InventoryStoreState {
  if (clientState) return clientState;
  try {
    const savedProducts = localStorage.getItem(STORAGE_KEYS.products);
    const savedMovements = localStorage.getItem(STORAGE_KEYS.movements);
    const savedSuppliers = localStorage.getItem(STORAGE_KEYS.suppliers);
    const savedPOs = localStorage.getItem(STORAGE_KEYS.purchaseOrders);

    clientState = {
      products: savedProducts ? JSON.parse(savedProducts) : mockProducts,
      movements: savedMovements ? JSON.parse(savedMovements) : mockStockMovements,
      suppliers: savedSuppliers ? JSON.parse(savedSuppliers) : mockSuppliers,
      purchaseOrders: savedPOs ? JSON.parse(savedPOs) : mockPurchaseOrders,
    };
  } catch {
    clientState = { ...INITIAL_STATE };
  }
  return clientState;
}

function updateClientState(updater: (prev: InventoryStoreState) => InventoryStoreState) {
  const prev = loadClientState();
  const next = updater(prev);
  clientState = next;
  try {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(next.products));
    localStorage.setItem(STORAGE_KEYS.movements, JSON.stringify(next.movements));
    localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(next.suppliers));
    localStorage.setItem(STORAGE_KEYS.purchaseOrders, JSON.stringify(next.purchaseOrders));
  } catch {
    // ignore quota errors
  }
  notifyInventoryListeners();
}

function subscribeInventory(listener: () => void) {
  inventoryListeners.add(listener);
  return () => {
    inventoryListeners.delete(listener);
  };
}

function getInventoryServerSnapshot(): InventoryStoreState {
  return INITIAL_STATE;
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { products, movements, suppliers, purchaseOrders } = useSyncExternalStore(
    subscribeInventory,
    loadClientState,
    getInventoryServerSnapshot
  );

  // When running against a live backend (NEXT_PUBLIC_API_MODE=api), hydrate from inventoryService
  useEffect(() => {
    if (!isApiMode()) return;
    let active = true;
    const hydrate = async () => {
      try {
        const [apiProducts, apiMovements, apiSuppliers, apiOrders] = await Promise.all([
          inventoryService.getProducts(),
          inventoryService.getMovements(),
          inventoryService.getSuppliers(),
          inventoryService.getPurchaseOrders(),
        ]);
        if (active) {
          updateClientState(() => ({
            products: apiProducts,
            movements: apiMovements,
            suppliers: apiSuppliers,
            purchaseOrders: apiOrders,
          }));
        }
      } catch {
        // Keep current cached/fallback state if backend is unreachable
      }
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const setProducts = (updater: Product[] | ((prev: Product[]) => Product[])) => {
    updateClientState(prev => ({
      ...prev,
      products: typeof updater === 'function' ? updater(prev.products) : updater,
    }));
  };

  const setMovements = (updater: StockMovement[] | ((prev: StockMovement[]) => StockMovement[])) => {
    updateClientState(prev => ({
      ...prev,
      movements: typeof updater === 'function' ? updater(prev.movements) : updater,
    }));
  };

  const setSuppliers = (updater: Supplier[] | ((prev: Supplier[]) => Supplier[])) => {
    updateClientState(prev => ({
      ...prev,
      suppliers: typeof updater === 'function' ? updater(prev.suppliers) : updater,
    }));
  };

  const setPurchaseOrders = (
    updater: PurchaseOrder[] | ((prev: PurchaseOrder[]) => PurchaseOrder[])
  ) => {
    updateClientState(prev => ({
      ...prev,
      purchaseOrders: typeof updater === 'function' ? updater(prev.purchaseOrders) : updater,
    }));
  };

  const addProduct = (input: Omit<Product, 'id' | 'businessId' | 'status'>): Product => {
    const status = computeStatus(input.stock, input.reorderLevel);
    const newProduct: Product = {
      ...input,
      id: `prod-${Date.now()}`,
      businessId: 'biz-1',
      status,
    };

    setProducts(prev => [newProduct, ...prev]);

    // Initial stock movement if stock > 0
    if (newProduct.stock > 0) {
      const initialMov: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        quantity: newProduct.stock,
        date: new Date().toISOString().split('T')[0],
        reference: 'INIT-STOCK',
        note: 'Initial inventory record',
        unitCost: newProduct.costPrice,
        balanceAfter: newProduct.stock,
        businessId: 'biz-1',
      };
      setMovements(prev => [initialMov, ...prev]);
    }

    if (isApiMode()) {
      void inventoryService.createProduct(input).catch(() => undefined);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        updated.status = computeStatus(updated.stock, updated.reorderLevel);
        return updated;
      })
    );
    if (isApiMode()) {
      void inventoryService.updateProduct(id, updates).catch(() => undefined);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (isApiMode()) {
      void inventoryService.deleteProduct(id).catch(() => undefined);
    }
  };

  const recordMovement = (data: {
    productId: string;
    type: StockMovementType;
    quantity: number;
    reference?: string;
    note?: string;
    unitCost?: number;
  }): StockMovement | null => {
    const product = products.find(p => p.id === data.productId);
    if (!product) return null;

    let delta = data.quantity;
    if (data.type === 'out') {
      delta = -Math.abs(data.quantity);
    } else if (data.type === 'in') {
      delta = Math.abs(data.quantity);
    }

    const newStock = Math.max(0, product.stock + delta);
    const updatedStatus = computeStatus(newStock, product.reorderLevel);

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      productName: product.name,
      type: data.type,
      quantity: delta,
      date: new Date().toISOString().split('T')[0],
      reference: data.reference || `REF-${Date.now().toString().slice(-6)}`,
      note: data.note || (data.type === 'in' ? 'Stock received' : data.type === 'out' ? 'Stock dispatched' : 'Stock adjustment'),
      unitCost: data.unitCost ?? product.costPrice,
      balanceAfter: newStock,
      businessId: 'biz-1',
    };

    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, stock: newStock, status: updatedStatus } : p))
    );
    setMovements(prev => [newMovement, ...prev]);
    if (isApiMode()) {
      void inventoryService.recordMovement(data).catch(() => undefined);
    }

    return newMovement;
  };

  const adjustStock = (
    productId: string,
    amount: number,
    mode: 'delta' | 'exact',
    reason: string,
    reference?: string
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let delta: number;
    let newStock: number;

    if (mode === 'exact') {
      newStock = Math.max(0, amount);
      delta = newStock - product.stock;
    } else {
      delta = amount;
      newStock = Math.max(0, product.stock + delta);
    }

    const updatedStatus = computeStatus(newStock, product.reorderLevel);
    const refCode = reference || `ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: 'adjustment',
      quantity: delta,
      date: new Date().toISOString().split('T')[0],
      reference: refCode,
      note: reason,
      unitCost: product.costPrice,
      balanceAfter: newStock,
      businessId: 'biz-1',
    };

    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, stock: newStock, status: updatedStatus } : p))
    );
    setMovements(prev => [newMovement, ...prev]);
    if (isApiMode()) {
      void inventoryService
        .adjustStock({ productId, amount, mode, reason, reference: refCode })
        .catch(() => undefined);
    }
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'businessId'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      businessId: 'biz-1',
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    if (isApiMode()) {
      void inventoryService.createSupplier(supplier).catch(() => undefined);
    }
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    if (isApiMode()) {
      void inventoryService.updateSupplier(id, updates).catch(() => undefined);
    }
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    if (isApiMode()) {
      void inventoryService.deleteSupplier(id).catch(() => undefined);
    }
  };

  const createPurchaseOrder = (
    order: Omit<PurchaseOrder, 'id' | 'businessId' | 'poNumber'>
  ): PurchaseOrder => {
    const count = purchaseOrders.length + 1;
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 60).padStart(4, '0')}`;
    const newPO: PurchaseOrder = {
      ...order,
      id: `po-${Date.now()}`,
      poNumber,
      businessId: 'biz-1',
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    if (isApiMode()) {
      void inventoryService.createPurchaseOrder(order).catch(() => undefined);
    }
    return newPO;
  };

  const updatePOStatus = (id: string, status: PurchaseOrderStatus) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;

    // If changing to 'received' and wasn't already received, automatically receive items into stock!
    if (status === 'received' && po.status !== 'received') {
      const dateStr = new Date().toISOString().split('T')[0];
      const newMovements: StockMovement[] = [];

      setProducts(prevProducts => {
        let updated = [...prevProducts];
        po.items.forEach(item => {
          const product = updated.find(p => p.id === item.productId);
          if (product) {
            const nextStock = product.stock + item.quantity;
            updated = updated.map(p =>
              p.id === product.id
                ? {
                    ...p,
                    stock: nextStock,
                    status: computeStatus(nextStock, p.reorderLevel),
                  }
                : p
            );
            newMovements.push({
              id: `mov-${Date.now()}-${item.productId}`,
              productId: item.productId,
              productName: item.productName,
              type: 'in',
              quantity: item.quantity,
              date: dateStr,
              reference: po.poNumber,
              note: `Received PO: ${po.poNumber} (${po.supplierName})`,
              unitCost: item.unitCost,
              balanceAfter: nextStock,
              businessId: 'biz-1',
            });
          }
        });
        return updated;
      });

      if (newMovements.length > 0) {
        setMovements(prev => [...newMovements, ...prev]);
      }
    }

    setPurchaseOrders(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
    if (isApiMode()) {
      void inventoryService.updatePurchaseOrderStatus(id, status).catch(() => undefined);
    }
  };

  const quickReorder = (
    productId: string,
    quantity: number,
    supplierId?: string
  ): PurchaseOrder | null => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const supplier = suppliers.find(s => s.id === (supplierId || product.supplierId)) || suppliers[0];
    const unitCost = product.costPrice;
    const totalAmount = unitCost * quantity;

    const count = purchaseOrders.length + 1;
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 60).padStart(4, '0')}`;

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + (supplier?.leadTimeDays ?? 3));

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: supplier?.id ?? 'sup-1',
      supplierName: supplier?.name ?? 'Default Supplier',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate.toISOString().split('T')[0],
      status: 'ordered',
      items: [
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitCost,
          total: totalAmount,
        },
      ],
      totalAmount,
      notes: `Auto-generated reorder for low-stock product: ${product.name}`,
      businessId: 'biz-1',
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  };

  const resetInventory = () => {
    setProducts(mockProducts);
    setMovements(mockStockMovements);
    setSuppliers(mockSuppliers);
    setPurchaseOrders(mockPurchaseOrders);
    try {
      localStorage.removeItem(STORAGE_KEYS.products);
      localStorage.removeItem(STORAGE_KEYS.movements);
      localStorage.removeItem(STORAGE_KEYS.suppliers);
      localStorage.removeItem(STORAGE_KEYS.purchaseOrders);
    } catch {
      // ignore
    }
  };

  const totalInventoryCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  const potentialProfit = Math.max(0, totalRetailValue - totalInventoryCost);

  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const inStockCount = products.filter(p => p.status === 'in_stock').length;

  return (
    <InventoryContext.Provider
      value={{
        products,
        movements,
        suppliers,
        purchaseOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        recordMovement,
        adjustStock,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        updatePOStatus,
        quickReorder,
        resetInventory,
        totalInventoryCost,
        totalRetailValue,
        potentialProfit,
        lowStockCount,
        outOfStockCount,
        inStockCount,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
