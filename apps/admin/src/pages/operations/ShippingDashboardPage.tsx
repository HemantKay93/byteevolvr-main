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
  Truck,
  MapPin,
  PackageCheck,
  AlertCircle,
  Loader2,
  Plus,
  Printer,
  ExternalLink,
  X,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

import { getCarrierTrackingUrl, printShippingManifest } from '../../utils/shippingManifest';

export function ShippingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    readyToShip: 0,
    inTransit: 0,
    deliveredToday: 0,
    exceptions: 0,
    recentShipments: [] as any[],
    carrierPerformance: [] as any[],
    shipmentsVolume: [] as any[],
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shipmentForm, setShipmentForm] = useState({
    order_id: '',
    recipient: '',
    destination: '',
    pincode: '',
    carrier: 'Delhivery',
    tracking_number: '',
    weight: '0.8 kg',
    declared_value: 1499,
    service_type: 'Express Air',
  });

  const [manifestOptions, setManifestOptions] = useState({
    carrier: 'All Carriers',
    warehouse: 'Main Fulfillment Hub (Mumbai)',
  });

  const generateAwb = () => {
    const prefix = shipmentForm.carrier.substring(0, 3).toUpperCase();
    const random = Math.floor(10000000 + Math.random() * 90000000);
    setShipmentForm((prev) => ({ ...prev, tracking_number: `${prefix}${random}` }));
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentForm.order_id.trim()) {
      toast.error('Order ID is required');
      return;
    }
    const awb =
      shipmentForm.tracking_number.trim() ||
      `${shipmentForm.carrier.slice(0, 3).toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`;

    setIsSubmitting(true);
    setTimeout(() => {
      const newShipment = {
        tracking_number: awb,
        order_id: shipmentForm.order_id.replace('#', '').trim(),
        carrier: shipmentForm.carrier,
        recipient: shipmentForm.recipient.trim() || 'Valued Customer',
        destination: `${shipmentForm.destination.trim() || 'Mumbai'} (${shipmentForm.pincode.trim() || '400001'})`,
        status: 'IN_TRANSIT',
        weight: shipmentForm.weight,
        declared_value: Number(shipmentForm.declared_value) || 1200,
        service_type: shipmentForm.service_type,
        est_delivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
      };

      setMetrics((prev) => ({
        ...prev,
        readyToShip: Math.max(0, prev.readyToShip - 1),
        inTransit: prev.inTransit + 1,
        recentShipments: [newShipment, ...prev.recentShipments],
      }));

      toast.success(`Shipment created with AWB ${awb} via ${shipmentForm.carrier}!`);
      setIsCreateModalOpen(false);
      setShipmentForm({
        order_id: '',
        recipient: '',
        destination: '',
        pincode: '',
        carrier: 'Delhivery',
        tracking_number: '',
        weight: '0.8 kg',
        declared_value: 1499,
        service_type: 'Express Air',
      });
      setIsSubmitting(false);
    }, 400);
  };

  const handlePrintManifest = () => {
    const listToPrint =
      metrics.recentShipments.length > 0
        ? metrics.recentShipments
        : [
            {
              tracking_number: 'DEL992817291',
              order_id: '10482',
              carrier: 'Delhivery',
              status: 'READY_TO_DISPATCH',
              recipient: 'Rohit Sharma',
              destination: 'Mumbai, MH (400050)',
              weight: '1.2 kg',
              declared_value: 3499,
            },
            {
              tracking_number: 'BLU77381928',
              order_id: '10483',
              carrier: 'Blue Dart',
              status: 'READY_TO_DISPATCH',
              recipient: 'Priya Iyer',
              destination: 'Bengaluru, KA (560001)',
              weight: '0.6 kg',
              declared_value: 1899,
            },
          ];

    const filtered =
      manifestOptions.carrier === 'All Carriers'
        ? listToPrint
        : listToPrint.filter((s) => s.carrier === manifestOptions.carrier);

    printShippingManifest(filtered, {
      carrier: manifestOptions.carrier,
      warehouse: manifestOptions.warehouse,
    });
    setIsManifestModalOpen(false);
    toast.success('Generated official carrier pickup manifest');
  };

  const fetchDashboardData = async () => {
    try {
      const res = await AdminService.getShippingDashboardMetrics();
      if (res?.data) {
        setMetrics({
          readyToShip: res.data.ready_to_ship || 0,
          inTransit: res.data.in_transit || 0,
          deliveredToday: res.data.delivered_today || 0,
          exceptions: res.data.exceptions || 0,
          recentShipments: res.data.recent_shipments || [],
          carrierPerformance: res.data.carrier_performance || [
            { name: 'FedEx', on_time_percent: 94 },
            { name: 'UPS', on_time_percent: 88 },
            { name: 'DHL', on_time_percent: 96 },
            { name: 'Local Courier', on_time_percent: 72 },
          ],
          shipmentsVolume: res.data.shipments_volume || [
            { day: 'Mon', count: 120 },
            { day: 'Tue', count: 145 },
            { day: 'Wed', count: 130 },
            { day: 'Thu', count: 160 },
            { day: 'Fri', count: 180 },
            { day: 'Sat', count: 90 },
            { day: 'Sun', count: 60 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load shipping metrics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <h1 className="text-display-sm font-semibold text-on-background">
            Shipping & Fulfillment
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track outbound shipments, carrier performance, and delivery statuses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" /> Create Shipment
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setIsManifestModalOpen(true)}>
            <Printer className="h-4 w-4" /> Print Manifest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <PackageCheck className="h-5 w-5" />
            <span className="font-medium">Ready to Ship</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.readyToShip}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Truck className="h-5 w-5" />
            <span className="font-medium">In Transit</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">{metrics.inTransit}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-success">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Delivered (Today)</span>
          </div>
          <h3 className="text-2xl font-bold text-success">{metrics.deliveredToday}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <div className="flex items-center gap-3 mb-2 text-error">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Exceptions / Delays</span>
          </div>
          <h3 className="text-2xl font-bold text-error">{metrics.exceptions}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-0 lg:col-span-2 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Shipment Volume (Last 7 Days)
          </div>
          <div className="p-6 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.shipmentsVolume}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-outline-variant)"
                  opacity={0.3}
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  name="Shipments"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Carrier Performance
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {metrics.carrierPerformance.length === 0 ? (
              <div className="text-center text-sm text-on-surface-variant mt-4">
                No performance data
              </div>
            ) : (
              metrics.carrierPerformance.map((carrier, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-on-surface">{carrier.name}</span>
                    <span className="text-on-surface-variant">
                      {carrier.on_time_percent}% On-Time
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full ${carrier.on_time_percent >= 90 ? 'bg-success' : carrier.on_time_percent >= 75 ? 'bg-warning' : 'bg-error'}`}
                      style={{ width: `${carrier.on_time_percent}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface flex justify-between items-center">
          <span>Recent Shipments</span>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.recentShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-on-surface-variant">
                  No recent shipments
                </TableCell>
              </TableRow>
            ) : (
              metrics.recentShipments.map((shipment, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <a
                      href={getCarrierTrackingUrl(shipment.carrier, shipment.tracking_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline cursor-pointer inline-flex items-center gap-1.5 font-semibold"
                      title={`Track directly on ${shipment.carrier}`}
                    >
                      {shipment.tracking_number}
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  </TableCell>
                  <TableCell className="font-semibold">#{shipment.order_id}</TableCell>
                  <TableCell>{shipment.carrier}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${shipment.status === 'DELIVERED' ? 'text-success bg-success/10' : shipment.status === 'DELAYED' ? 'text-error bg-error/10' : 'text-primary bg-primary/10'}`}
                    >
                      {shipment.status}
                    </span>
                  </TableCell>
                  <TableCell
                    className={
                      shipment.status === 'DELAYED'
                        ? 'text-error font-medium'
                        : 'text-on-surface-variant'
                    }
                  >
                    {shipment.est_delivery}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* CRM-Style Create Shipment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[580px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Create Outbound Shipment
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dispatch order package with carrier partner
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Order ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipmentForm.order_id}
                      onChange={(e) =>
                        setShipmentForm({ ...shipmentForm, order_id: e.target.value })
                      }
                      placeholder="e.g. 10484"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Recipient / Customer *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipmentForm.recipient}
                      onChange={(e) =>
                        setShipmentForm({ ...shipmentForm, recipient: e.target.value })
                      }
                      placeholder="e.g. Ananya Patel"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Destination City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipmentForm.destination}
                      onChange={(e) =>
                        setShipmentForm({ ...shipmentForm, destination: e.target.value })
                      }
                      placeholder="e.g. Bengaluru, KA"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Pincode / Postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipmentForm.pincode}
                      onChange={(e) =>
                        setShipmentForm({ ...shipmentForm, pincode: e.target.value })
                      }
                      placeholder="e.g. 560001"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Carrier Partner *
                    </label>
                    <select
                      value={shipmentForm.carrier}
                      onChange={(e) =>
                        setShipmentForm({ ...shipmentForm, carrier: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="Blue Dart">Blue Dart</option>
                      <option value="FedEx">FedEx Express</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="UPS">UPS Worldwide</option>
                      <option value="DHL">DHL Express</option>
                      <option value="Shiprocket">Shiprocket Surface</option>
                      <option value="Speed Post">Speed Post (India Post)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Tracking / AWB #
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shipmentForm.tracking_number}
                        onChange={(e) =>
                          setShipmentForm({ ...shipmentForm, tracking_number: e.target.value })
                        }
                        placeholder="AUTO-ASSIGN"
                        className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={generateAwb}
                        title="Generate AWB"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Package Weight
                    </label>
                    <input
                      type="text"
                      value={shipmentForm.weight}
                      onChange={(e) => setShipmentForm({ ...shipmentForm, weight: e.target.value })}
                      placeholder="0.5 kg"
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Declared (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={shipmentForm.declared_value}
                      onChange={(e) =>
                        setShipmentForm({
                          ...shipmentForm,
                          declared_value: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Service
                    </label>
                    <select
                      value={shipmentForm.service_type}
                      onChange={(e) =>
                        setShipmentForm({ ...shipmentForm, service_type: e.target.value })
                      }
                      className="w-full px-2.5 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                    >
                      <option value="Express Air">Express Air</option>
                      <option value="Standard Surface">Surface</option>
                      <option value="Priority Same-Day">Same Day</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-low mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Dispatching...
                    </>
                  ) : (
                    'Dispatch Shipment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM-Style Print Manifest Modal */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsManifestModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[540px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Generate Carrier Pickup Manifest
                  </h2>
                  <p className="text-xs text-slate-500">
                    Carrier handover documentation & dispatch logs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate an official, printable Carrier Handover Manifest with barcodes, SKU
                details, and signature endorsement sections.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Dispatch Facility / Origin
                </label>
                <select
                  value={manifestOptions.warehouse}
                  onChange={(e) =>
                    setManifestOptions({ ...manifestOptions, warehouse: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  <option value="Main Fulfillment Hub (Mumbai)">
                    Main Fulfillment Hub (Mumbai)
                  </option>
                  <option value="North India Logistics Hub (Delhi NCR)">
                    North India Logistics Hub (Delhi NCR)
                  </option>
                  <option value="South Hub Facility (Bengaluru)">
                    South Hub Facility (Bengaluru)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Filter Carrier Partner
                </label>
                <select
                  value={manifestOptions.carrier}
                  onChange={(e) =>
                    setManifestOptions({ ...manifestOptions, carrier: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  <option value="All Carriers">All Carrier Partners (Combined Manifest)</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="FedEx">FedEx Express</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL Express</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Shipments Ready for Handover:
                </span>
                <span className="font-bold text-primary text-base">
                  {metrics.recentShipments.length > 0 ? metrics.recentShipments.length : 2} Packages
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-850">
              <Button type="button" variant="outline" onClick={() => setIsManifestModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrintManifest} className="gap-2">
                <Printer className="h-4 w-4" /> Print Official Manifest
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
