import { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import {
  ArrowRight,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Info,
  Truck,
  Clock,
  Boxes,
  Send,
  Calendar,
  Building2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

export interface TransferItem {
  id: string;
  from: string;
  to: string;
  items: number;
  productName?: string;
  status: 'pending' | 'in-transit' | 'completed' | 'cancelled';
  date: string;
  notes?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
}

export function StockTransfersPage() {
  const [transfers, setTransfers] = useState<TransferItem[]>([
    {
      id: 'TRF-001',
      from: 'Main Warehouse (Mumbai)',
      to: 'Retail Store (Bengaluru)',
      items: 4,
      productName: 'Premium Wireless Headset',
      status: 'in-transit',
      date: '2026-03-24',
      priority: 'High',
      notes: 'Replenishing tech showroom inventory ahead of weekend rush',
    },
    {
      id: 'TRF-002',
      from: 'Supplier Depot (Delhi)',
      to: 'Main Warehouse (Mumbai)',
      items: 12,
      productName: 'Mechanical Keyboards',
      status: 'completed',
      date: '2026-03-20',
      priority: 'Normal',
      notes: 'Vendor consignment intake restock',
    },
    {
      id: 'TRF-003',
      from: 'Retail Store (Bengaluru)',
      to: 'Returns Center (Pune)',
      items: 1,
      productName: 'USB-C Docking Station',
      status: 'pending',
      date: '2026-03-25',
      priority: 'Normal',
      notes: 'Defective customer return return for warranty evaluation',
    },
    {
      id: 'TRF-004',
      from: 'Main Warehouse (Mumbai)',
      to: 'Fulfillment Hub (Hyderabad)',
      items: 8,
      productName: 'Ultra-Wide Curved Monitor 34"',
      status: 'pending',
      date: '2026-03-26',
      priority: 'Urgent',
      notes: 'Urgent B2B corporate order fulfillment demand',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState<TransferItem | null>(null);

  const [formData, setFormData] = useState({
    from: 'Main Warehouse (Mumbai)',
    to: 'Retail Store (Bengaluru)',
    productName: '',
    items: 1,
    priority: 'Normal' as 'Low' | 'Normal' | 'High' | 'Urgent',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      toast.error('Please enter the item or SKU being transferred');
      return;
    }
    if (formData.from === formData.to) {
      toast.error('Source and destination facilities cannot be the same');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRef = `TRF-${Math.floor(100 + Math.random() * 900)}`;
      const newTransfer: TransferItem = {
        id: newRef,
        from: formData.from,
        to: formData.to,
        items: Number(formData.items) || 1,
        productName: formData.productName.trim(),
        status: 'pending',
        date: formData.date,
        priority: formData.priority,
        notes: formData.notes.trim() || undefined,
      };

      setTransfers([newTransfer, ...transfers]);
      toast.success(`Transfer ${newRef} initiated in Pending state!`);
      setIsModalOpen(false);
      setFormData({
        from: 'Main Warehouse (Mumbai)',
        to: 'Retail Store (Bengaluru)',
        productName: '',
        items: 1,
        priority: 'Normal',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsSubmitting(false);
    }, 350);
  };

  const handleDispatch = (id: string) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'in-transit' } : t)));
    if (viewingTransfer?.id === id) {
      setViewingTransfer((prev) => (prev ? { ...prev, status: 'in-transit' } : null));
    }
    toast.success(`Transfer ${id} dispatched! Status updated to In-Transit.`);
  };

  const handleReceive = (id: string) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
    if (viewingTransfer?.id === id) {
      setViewingTransfer((prev) => (prev ? { ...prev, status: 'completed' } : null));
    }
    toast.success(`Stock transfer ${id} received! Destination inventory updated.`);
  };

  const handleCancel = (id: string) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t)));
    if (viewingTransfer?.id === id) {
      setViewingTransfer((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    }
    toast.error(`Transfer ${id} has been cancelled.`);
  };

  const filteredTransfers = transfers.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const totalTransfers = transfers.length;
  const inTransitCount = transfers.filter((t) => t.status === 'in-transit').length;
  const pendingCount = transfers.filter((t) => t.status === 'pending').length;
  const completedCount = transfers.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-semibold text-slate-900 dark:text-slate-100">
            Stock Transfers
          </h1>
          <p className="text-body-sm text-slate-600 dark:text-slate-400 mt-1">
            Track and orchestrate stock rebalancing across warehouses and retail centers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="gap-2 shadow-md hover:shadow-lg transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Workflow State KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Transfers
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalTransfers}
            </span>
            <span className="text-xs text-slate-500">Scheduled/Logged</span>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Dispatch
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-500">Awaiting Handover</span>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              In Transit
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {inTransitCount}
            </span>
            <span className="text-xs text-slate-500">On The Move</span>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount}
            </span>
            <span className="text-xs text-slate-500">Restocked & Closed</span>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { key: 'all', label: 'All Transfers', count: totalTransfers },
          { key: 'in-transit', label: 'In Transit', count: inTransitCount },
          { key: 'pending', label: 'Pending Dispatch', count: pendingCount },
          { key: 'completed', label: 'Completed', count: completedCount },
          {
            key: 'cancelled',
            label: 'Cancelled',
            count: transfers.filter((t) => t.status === 'cancelled').length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transfers Table */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer Ref</TableHead>
              <TableHead>Item / Product</TableHead>
              <TableHead>Route / Facility</TableHead>
              <TableHead className="text-center">Units</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Workflow State</TableHead>
              <TableHead className="w-44 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  No stock transfers found in this view.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransfers.map((trf) => (
                <TableRow key={trf.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                  <TableCell
                    className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
                    onClick={() => setViewingTransfer(trf)}
                  >
                    {trf.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {trf.productName || 'Assorted Items'}
                    </div>
                    {trf.notes && (
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{trf.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {trf.from}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {trf.to}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-900 dark:text-white">
                    {trf.items}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        trf.priority === 'Urgent'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : trf.priority === 'High'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {trf.priority || 'Normal'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(trf.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trf.status === 'completed'
                          ? 'success'
                          : trf.status === 'in-transit'
                            ? 'primary'
                            : trf.status === 'cancelled'
                              ? 'error'
                              : 'default'
                      }
                      className="capitalize text-xs font-semibold"
                    >
                      {trf.status === 'in-transit'
                        ? 'In Transit'
                        : trf.status === 'pending'
                          ? 'Pending'
                          : trf.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      {trf.status === 'pending' && (
                        <button
                          title="Dispatch Transfer"
                          onClick={() => handleDispatch(trf.id)}
                          className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                        >
                          <Send className="h-3 w-3" /> Dispatch
                        </button>
                      )}
                      {(trf.status === 'pending' || trf.status === 'in-transit') && (
                        <button
                          title="Receive & Restock"
                          onClick={() => handleReceive(trf.id)}
                          className="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Receive
                        </button>
                      )}
                      {(trf.status === 'pending' || trf.status === 'in-transit') && (
                        <button
                          title="Cancel Transfer"
                          onClick={() => handleCancel(trf.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingTransfer(trf)}
                        className="text-xs h-7 px-2"
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* CRM-Style Create New Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[560px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Initiate Stock Transfer
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Schedule internal inventory transit between facilities
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Origin Warehouse *
                    </label>
                    <select
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      <option value="Main Warehouse (Mumbai)">Main Warehouse (Mumbai)</option>
                      <option value="Supplier Depot (Delhi)">Supplier Depot (Delhi)</option>
                      <option value="Retail Store (Bengaluru)">Retail Store (Bengaluru)</option>
                      <option value="Fulfillment Hub (Hyderabad)">
                        Fulfillment Hub (Hyderabad)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Destination Facility *
                    </label>
                    <select
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      <option value="Retail Store (Bengaluru)">Retail Store (Bengaluru)</option>
                      <option value="Main Warehouse (Mumbai)">Main Warehouse (Mumbai)</option>
                      <option value="Returns Center (Pune)">Returns Center (Pune)</option>
                      <option value="Retail Outlet (Connaught Place)">
                        Retail Outlet (Connaught Place)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Item / Product Name or SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Ergonomic Office Desk or SKU-1049"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Transfer Units *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.items}
                      onChange={(e) =>
                        setFormData({ ...formData, items: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as 'Low' | 'Normal' | 'High' | 'Urgent',
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Dispatch Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Internal Transfer Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Stock rebalancing for peak weekend sales demand"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-850 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    'Initiate Transfer'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Transfer Details & Interactive Workflow Stepper Modal */}
      {viewingTransfer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewingTransfer(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[540px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Transfer {viewingTransfer.id}
                  </h2>
                  <p className="text-xs text-slate-500">Live Workflow State & Progress Tracking</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTransfer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Interactive Workflow Progress Stepper */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Workflow Lifecycle
                </h4>
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 dark:bg-slate-700 -z-0" />

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      ✓
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5">
                      1. Initiated
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        viewingTransfer.status === 'in-transit'
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                          : viewingTransfer.status === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {viewingTransfer.status === 'completed' ? '✓' : '2'}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5">
                      2. In-Transit
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        viewingTransfer.status === 'completed'
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/50'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {viewingTransfer.status === 'completed' ? '✓' : '3'}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5">
                      3. Received
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer Details Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> Item / Product:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewingTransfer.productName || 'Assorted Items'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Boxes className="h-4 w-4" /> Transfer Units:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewingTransfer.items} units
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> Origin Facility:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewingTransfer.from}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> Destination Facility:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewingTransfer.to}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Dispatch Date:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewingTransfer.date}
                  </span>
                </div>
                {viewingTransfer.notes && (
                  <div className="pt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Notes:{' '}
                    </span>
                    {viewingTransfer.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex gap-2">
                {viewingTransfer.status === 'pending' && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleDispatch(viewingTransfer.id)}
                  >
                    <Send className="h-3.5 w-3.5" /> Dispatch Shipment
                  </Button>
                )}
                {(viewingTransfer.status === 'pending' ||
                  viewingTransfer.status === 'in-transit') && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleReceive(viewingTransfer.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Receipt
                  </Button>
                )}
                {(viewingTransfer.status === 'pending' ||
                  viewingTransfer.status === 'in-transit') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50"
                    onClick={() => handleCancel(viewingTransfer.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setViewingTransfer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
