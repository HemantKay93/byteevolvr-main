import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  ArrowRightLeft,
  Loader2,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';
import { AdminService, ProductService } from '@byteevolvr/api-client';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

export function InventoryDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    pendingTransfers: 0,
    recentMovements: [] as any[],
    criticalLowStock: [] as any[],
    stockByCategory: [] as any[],
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    brand: '',
    stock_quantity: 10,
    cost_price: 0,
    price: 0,
    min_level: 5,
    location: 'Main Warehouse - Shelf A1',
  });

  const generateSku = () => {
    const prefix = (formData.category || 'SKU').substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${random}` }));
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedSku = formData.sku.trim() || `PRD-${Date.now().toString().slice(-6)}`;
      const qty = Number(formData.stock_quantity) || 0;
      const cost = Number(formData.cost_price) || 0;
      const price = Number(formData.price) || cost * 1.3;

      await ProductService.createProduct({
        name: formData.name.trim(),
        description: `Registered at ${formData.location}`,
        price: price,
        original_price: cost,
        category: formData.category,
        brand: formData.brand.trim() || undefined,
        sku: generatedSku,
        stock_quantity: qty,
        status: qty > 0 ? 'active' : 'out_of_stock',
      });

      // Update real-time metrics
      setMetrics((prev) => ({
        ...prev,
        totalItems: prev.totalItems + qty,
        totalValue: prev.totalValue + qty * cost,
        recentMovements: [
          {
            product_name: formData.name.trim(),
            type: 'IN',
            quantity: qty,
            created_at: new Date().toISOString(),
          },
          ...prev.recentMovements,
        ],
      }));

      toast.success(`"${formData.name}" added to stock successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        sku: '',
        category: 'General',
        brand: '',
        stock_quantity: 10,
        cost_price: 0,
        price: 0,
        min_level: 5,
        location: 'Main Warehouse - Shelf A1',
      });
    } catch (err: any) {
      console.error('Failed to add product to inventory', err);
      toast.error(err?.message || 'Failed to add item to inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await AdminService.getInventoryDashboardMetrics();
      if (res?.data) {
        setMetrics({
          totalItems: res.data.total_items || 0,
          totalValue: res.data.total_value || 0,
          lowStockCount: res.data.low_stock_count || 0,
          pendingTransfers: res.data.pending_transfers || 0,
          recentMovements: res.data.recent_movements || [],
          criticalLowStock: res.data.critical_low_stock || [],
          stockByCategory: res.data.stock_by_category || [
            { name: 'Electronics', value: 4000 },
            { name: 'Apparel', value: 3000 },
            { name: 'Home & Kitchen', value: 2000 },
            { name: 'Sports', value: 1000 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load inventory metrics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Inventory Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Overview of stock levels, movements, and alerts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
          <Link to="/operations/stock-transfers">
            <Button className="gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Transfer Stock
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Package className="h-5 w-5" />
            <span className="font-medium">Total Items in Stock</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">
            {metrics.totalItems.toLocaleString()}
          </h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <TrendingDown className="h-5 w-5" />
            <span className="font-medium">Total Value (Cost)</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">
            ₹{metrics.totalValue.toLocaleString()}
          </h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-warning">
          <div className="flex items-center gap-3 mb-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Low Stock Alerts</span>
          </div>
          <h3 className="text-2xl font-bold text-warning">{metrics.lowStockCount} Items</h3>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-warning hover:bg-warning/10 p-0 h-auto"
          >
            View details →
          </Button>
        </Card>
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <ArrowRightLeft className="h-5 w-5" />
            <span className="font-medium">Pending Transfers</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">{metrics.pendingTransfers}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-0 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Stock Value by Category
          </div>
          <div className="p-6 flex-1 flex items-center justify-center">
            {metrics.stockByCategory.length === 0 ? (
              <div className="text-on-surface-variant text-sm">No category data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.stockByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.stockByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            'var(--color-primary)',
                            'var(--color-success)',
                            'var(--color-warning)',
                            'var(--color-error)',
                          ][index % 4]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden lg:col-span-2 flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Recent Stock Movements
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.recentMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-on-surface-variant">
                    No recent movements
                  </TableCell>
                </TableRow>
              ) : (
                metrics.recentMovements.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${item.type === 'IN' ? 'text-success bg-success/10' : item.type === 'OUT' ? 'text-error bg-error/10' : 'text-primary bg-primary/10'}`}
                      >
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.type === 'OUT' ? '-' : '+'}
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-on-surface-variant text-sm">
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-error">
            Critical Low Stock
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Min Level</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.criticalLowStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-on-surface-variant">
                    No critical low stock
                  </TableCell>
                </TableRow>
              ) : (
                metrics.criticalLowStock.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-right text-error font-bold">
                      {item.current_stock}
                    </TableCell>
                    <TableCell className="text-right text-on-surface-variant">
                      {item.min_level}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[560px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Stock Item</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                    Product / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ergonomic Office Chair"
                    className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      SKU Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="AUTO-GEN"
                        className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={generateSku}
                        title="Generate SKU"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Electronics, Apparel..."
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Acme Inc"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Warehouse Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Bay 4, Rack 2"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Initial Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Cost (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Selling (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-low mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    'Add Stock Item'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
