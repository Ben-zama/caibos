import { isApiMode } from '@/config/app.config';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  mockProducts,
  mockPurchaseOrders,
  mockStockMovements,
  mockSuppliers,
} from '@/lib/inventory-mock-data';
import type {
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
  StockMovement,
  StockMovementType,
  Supplier,
} from '@/types';

export const inventoryService = {
  async getProducts(): Promise<Product[]> {
    if (isApiMode()) {
      return apiClient.get<Product[]>(ENDPOINTS.INVENTORY.PRODUCTS);
    }
    return mockProducts;
  },

  async createProduct(product: Omit<Product, 'id' | 'businessId' | 'status'>): Promise<Product> {
    return apiClient.post<Product>(ENDPOINTS.INVENTORY.PRODUCTS, product);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return apiClient.patch<Product>(ENDPOINTS.INVENTORY.PRODUCT_BY_ID(id), updates);
  },

  async deleteProduct(id: string): Promise<void> {
    return apiClient.delete<void>(ENDPOINTS.INVENTORY.PRODUCT_BY_ID(id));
  },

  async getMovements(): Promise<StockMovement[]> {
    if (isApiMode()) {
      return apiClient.get<StockMovement[]>(ENDPOINTS.INVENTORY.MOVEMENTS);
    }
    return mockStockMovements;
  },

  async recordMovement(data: {
    productId: string;
    type: StockMovementType;
    quantity: number;
    reference?: string;
    note?: string;
    unitCost?: number;
  }): Promise<StockMovement> {
    return apiClient.post<StockMovement>(ENDPOINTS.INVENTORY.MOVEMENTS, data);
  },

  async adjustStock(payload: {
    productId: string;
    amount: number;
    mode: 'delta' | 'exact';
    reason: string;
    reference?: string;
  }): Promise<StockMovement> {
    return apiClient.post<StockMovement>(ENDPOINTS.INVENTORY.ADJUSTMENTS, payload);
  },

  async getSuppliers(): Promise<Supplier[]> {
    if (isApiMode()) {
      return apiClient.get<Supplier[]>(ENDPOINTS.INVENTORY.SUPPLIERS);
    }
    return mockSuppliers;
  },

  async createSupplier(supplier: Omit<Supplier, 'id' | 'businessId'>): Promise<Supplier> {
    return apiClient.post<Supplier>(ENDPOINTS.INVENTORY.SUPPLIERS, supplier);
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    return apiClient.patch<Supplier>(ENDPOINTS.INVENTORY.SUPPLIER_BY_ID(id), updates);
  },

  async deleteSupplier(id: string): Promise<void> {
    return apiClient.delete<void>(ENDPOINTS.INVENTORY.SUPPLIER_BY_ID(id));
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    if (isApiMode()) {
      return apiClient.get<PurchaseOrder[]>(ENDPOINTS.INVENTORY.PURCHASE_ORDERS);
    }
    return mockPurchaseOrders;
  },

  async createPurchaseOrder(
    order: Omit<PurchaseOrder, 'id' | 'businessId' | 'poNumber'>
  ): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(ENDPOINTS.INVENTORY.PURCHASE_ORDERS, order);
  },

  async updatePurchaseOrderStatus(
    id: string,
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrder> {
    return apiClient.patch<PurchaseOrder>(ENDPOINTS.INVENTORY.PURCHASE_ORDER_STATUS(id), {
      status,
    });
  },
};
