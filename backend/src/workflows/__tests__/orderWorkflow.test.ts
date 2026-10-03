import { describe, it, expect, vi, beforeEach } from 'vitest';

import { OrderWorkflow } from '../orderWorkflow.service.js';
import { InventoryService } from '../../modules/inventory/inventory.service.js';
import { OrderService } from '../../modules/order/order.service.js';
import { JobService } from '../../services/jobService.js';
import { getAdminClient } from '../../config/supabase.js';

// Mock dependencies
vi.mock('../../modules/inventory/inventory.service.js', () => ({
  InventoryService: {
    reserveStock: vi.fn(),
    adjustStock: vi.fn(),
    releaseReservation: vi.fn(),
  },
}));

vi.mock('../../modules/order/order.service.js', () => {
  const createOrderMock = vi.fn();
  class MockOrderService {
    createOrder = createOrderMock;
  }
  return {
    OrderService: MockOrderService,
    // Export it so we can assert on it in the test
    __createOrderMock: createOrderMock,
  };
});

// Since the module is imported, we can access the exported mock
import * as OrderServiceModule from '../../modules/order/order.service.js';
// eslint-disable-line @typescript-eslint/no-explicit-any
const mockCreateOrder = (OrderServiceModule as any).__createOrderMock;
// eslint-disable-line @typescript-eslint/no-explicit-any

vi.mock('../../services/jobService.js', () => ({
  JobService: {
    dispatchAnalyticsEvent: vi.fn(),
  },
}));

vi.mock('../../config/supabase.js', () => ({
  getAdminClient: vi.fn(),
}));

describe('OrderWorkflow', () => {
  beforeEach(() => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    vi.clearAllMocks();
    (getAdminClient as any).mockResolvedValue({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'wh_1' } }),
    });
  });

  it('should successfully process a checkout and dispatch analytics', async () => {
    const mockItems = [{ productId: 'p1', quantity: 2, price: 100 }];
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const mockOrder = { id: 'order_123', total_amount: 200, status: 'pending' };

    // eslint-disable-line @typescript-eslint/no-explicit-any
    (InventoryService.reserveStock as any).mockResolvedValue({ reservationId: 'res_1' });
    // eslint-disable-line @typescript-eslint/no-explicit-any
    mockCreateOrder.mockResolvedValue(mockOrder);
    (JobService.dispatchAnalyticsEvent as any).mockResolvedValue(true);
    // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await OrderWorkflow.processCheckout('user_1', {
      items: mockItems,
      warehouseId: 'wh_1',
      paymentMethod: 'cash',
    });

    expect(result).toEqual(mockOrder);
    expect(InventoryService.reserveStock).toHaveBeenCalledWith({
      productId: 'p1',
      warehouseId: 'wh_1',
      quantity: 2,
      userId: 'user_1',
    });
    expect(mockCreateOrder).toHaveBeenCalledWith(
      'user_1',
      { items: mockItems, warehouseId: 'wh_1', paymentMethod: 'cash' },
      undefined
    );
    expect(JobService.dispatchAnalyticsEvent).toHaveBeenCalledWith('order_created', {
      orderId: 'order_123',
      userId: 'user_1',
      totalAmount: 200,
    });
  });

  // eslint-disable-line @typescript-eslint/no-explicit-any
  it('should rollback inventory reservations if order creation fails', async () => {
    const mockItems = [{ productId: 'p1', quantity: 2, price: 100 }];
    // eslint-disable-line @typescript-eslint/no-explicit-any

    // Setup mocks
    (InventoryService.reserveStock as any).mockResolvedValue({ reservationId: 'res_1' });
    // eslint-disable-line @typescript-eslint/no-explicit-any
    mockCreateOrder.mockRejectedValue(new Error('Database error'));
    (InventoryService.releaseReservation as any).mockResolvedValue(true);
    // eslint-disable-line @typescript-eslint/no-explicit-any

    await expect(
      OrderWorkflow.processCheckout('user_1', {
        items: mockItems,
        warehouseId: 'wh_1',
        paymentMethod: 'cash',
      })
    ).rejects.toThrow('Order processing failed: Database error');

    expect(InventoryService.reserveStock).toHaveBeenCalledTimes(1);
    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    // Adjust stock is called to rollback
    expect(InventoryService.releaseReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'p1',
        warehouseId: 'wh_1',
        quantity: 2,
        reservationId: 'res_1',
      })
    );
    // Analytics should NOT be dispatched
    expect(JobService.dispatchAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('should rollback partial reservations if reserving a subsequent item fails', async () => {
    const mockItems = [
      { productId: 'p1', quantity: 2, price: 100 },
      { productId: 'p2', quantity: 1, price: 200 },
    ];

    // First item succeeds, second item fails
    (InventoryService.reserveStock as any)
      .mockResolvedValueOnce({ reservationId: 'res_1' })
      .mockRejectedValueOnce(new Error('Insufficient stock for p2'));
    (InventoryService.releaseReservation as any).mockResolvedValue(true);

    await expect(
      OrderWorkflow.processCheckout('user_1', {
        items: mockItems,
        warehouseId: 'wh_1',
        paymentMethod: 'cash',
      })
    ).rejects.toThrow('Order failed during inventory reservation: Insufficient stock for p2');

    expect(InventoryService.reserveStock).toHaveBeenCalledTimes(2);
    // res_1 should be rolled back immediately
    expect(InventoryService.releaseReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'p1',
        warehouseId: 'wh_1',
        quantity: 2,
        reservationId: 'res_1',
      })
    );
    // Order creation and analytics should not have been reached
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(JobService.dispatchAnalyticsEvent).not.toHaveBeenCalled();
  });
});
