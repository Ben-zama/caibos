'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [movements, setMovements] = useState<StockMovement[]>(mockStockMovements);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.products);
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedMovements = localStorage.getItem(STORAGE_KEYS.movements);
      if (savedMovements) setMovements(JSON.parse(savedMovements));

      const savedSuppliers = localStorage.getItem(STORAGE_KEYS.suppliers);
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));

      const savedPOs = localStorage.getItem(STORAGE_KEYS.purchaseOrders);
      if (savedPOs) setPurchaseOrders(JSON.parse(savedPOs));
    } catch {
      // fallback to mock data
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.movements, JSON.stringify(movements));
      localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
      localStorage.setItem(STORAGE_KEYS.purchaseOrders, JSON.stringify(purchaseOrders));
    } catch {
      // ignore quota errors
    }
  }, [products, movements, suppliers, purchaseOrders, isLoaded]);

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
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'businessId'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      businessId: 'biz-1',
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
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
