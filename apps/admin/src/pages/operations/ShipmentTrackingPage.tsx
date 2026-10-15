import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import {
  Search,
  MapPin,
  ExternalLink,
  X,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { getCarrierTrackingUrl } from '../../utils/shippingManifest';

interface TrackingItem {
  trackingNumber: string;
  orderId: string;
  carrier: string;
  status: 'in-transit' | 'delivered' | 'exception' | 'label-created';
  location: string;
  lastUpdated: string;
  milestones: Array<{
    title: string;
    location: string;
    time: string;
    done: boolean;
  }>;
}

export function ShipmentTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<TrackingItem | null>(null);

  const [shipments] = useState<TrackingItem[]>([
    {
      trackingNumber: 'DEL992817291',
      orderId: 'ORD-2094',
      carrier: 'Delhivery',
      status: 'in-transit',
      location: 'Bhiwandi Hub, Maharashtra',
      lastUpdated: '25 mins ago',
      milestones: [
        {
          title: 'Electronic Shipment Info Received',
          location: 'Merchant Warehouse',
          time: 'Yesterday 04:30 PM',
          done: true,
        },
        {
          title: 'Package Picked Up & Scanned',
          location: 'Mumbai Fulfillment Center',
          time: 'Yesterday 08:15 PM',
          done: true,
        },
        {
          title: 'Arrived at Sort Facility',
          location: 'Bhiwandi Main Hub',
          time: 'Today 06:10 AM',
          done: true,
        },
        {
          title: 'Out for Local Delivery',
          location: 'Bengaluru Delivery Station',
          time: 'Estimated Tomorrow',
          done: false,
        },
        { title: 'Delivered', location: 'Customer Address', time: 'Pending', done: false },
      ],
    },
    {
      trackingNumber: 'BLU77381928',
      orderId: 'ORD-2093',
      carrier: 'Blue Dart',
      status: 'delivered',
      location: 'Bengaluru, KA',
      lastUpdated: '3 hours ago',
      milestones: [
        { title: 'Pickup Completed', location: 'Delhi Depot', time: '23 Mar 10:00 AM', done: true },
        {
          title: 'Air Transit Inbound',
          location: 'DEL to BLR Cargo Flight',
          time: '23 Mar 06:00 PM',
          done: true,
        },
        {
          title: 'Out for Delivery',
          location: 'Indiranagar Hub, BLR',
          time: '24 Mar 09:30 AM',
          done: true,
        },
        {
          title: 'Delivered - Signed by Recipient',
          location: 'Bengaluru, KA',
          time: '24 Mar 01:15 PM',
          done: true,
        },
      ],
    },
    {
      trackingNumber: '77123456789',
      orderId: 'ORD-2090',
      carrier: 'FedEx',
      status: 'delivered',
      location: 'New York, NY',
      lastUpdated: '1 day ago',
      milestones: [
        {
          title: 'Shipment label created',
          location: 'Memphis, TN',
          time: '21 Mar 09:00 AM',
          done: true,
        },
        {
          title: 'Departed FedEx Hub',
          location: 'Newark, NJ',
          time: '22 Mar 02:00 PM',
          done: true,
        },
        { title: 'Delivered', location: 'New York, NY', time: '23 Mar 11:30 AM', done: true },
      ],
    },
    {
      trackingNumber: 'ECM8829104',
      orderId: 'ORD-2089',
      carrier: 'Ecom Express',
      status: 'exception',
      location: 'Pune Regional Hub, MH',
      lastUpdated: '5 hours ago',
      milestones: [
        {
          title: 'Package Received',
          location: 'Mumbai Central',
          time: '22 Mar 11:00 AM',
          done: true,
        },
        {
          title: 'In Transit',
          location: 'Pune Logistics Center',
          time: '23 Mar 03:00 AM',
          done: true,
        },
        {
          title: 'Delivery Attempted - Customer Rescheduled',
          location: 'Pune West Station',
          time: 'Today 10:45 AM',
          done: true,
        },
      ],
    },
    {
      trackingNumber: '1Z888888888',
      orderId: 'ORD-2092',
      carrier: 'UPS',
      status: 'label-created',
      location: 'Main Fulfillment Hub',
      lastUpdated: '10 mins ago',
      milestones: [
        {
          title: 'Order Dispatched from Seller',
          location: 'Warehouse Bay 4',
          time: 'Just now',
          done: true,
        },
        {
          title: 'Awaiting Carrier Scan',
          location: 'Dispatch Dock',
          time: 'Pending Pickup',
          done: false,
        },
      ],
    },
  ]);

  const filteredShipments = shipments.filter(
    (s) =>
      s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-transit':
        return <Badge variant="primary">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'exception':
        return <Badge variant="error">Exception / Delayed</Badge>;
      case 'label-created':
        return <Badge variant="default">Label Created</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Shipment Tracking</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Monitor real-time status and live carrier milestones for all outbound shipments
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Track by tracking number, Order ID, or carrier..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => toast.success('All carrier tracking statuses synchronized!')}
          >
            Sync Statuses
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-28 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-on-surface-variant">
                  No shipments matching &ldquo;{searchTerm}&rdquo;
                </TableCell>
              </TableRow>
            ) : (
              filteredShipments.map((item) => (
                <TableRow key={item.trackingNumber}>
                  <TableCell>
                    <a
                      href={getCarrierTrackingUrl(item.carrier, item.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline cursor-pointer inline-flex items-center gap-1.5 font-semibold"
                      title={`Open official ${item.carrier} tracking page`}
                    >
                      {item.trackingNumber}
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  </TableCell>
                  <TableCell className="font-medium">{item.orderId}</TableCell>
                  <TableCell>{item.carrier}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm text-on-surface font-medium">{item.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant">
                    {item.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => setSelectedShipment(item)}
                    >
                      Milestones
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* CRM-Style Tracking Milestone Journey Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedShipment(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[560px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Tracking: {selectedShipment.trackingNumber}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedShipment.carrier} • Order {selectedShipment.orderId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                <div>
                  <div className="text-xs uppercase font-semibold text-on-surface-variant">
                    Current Status
                  </div>
                  <div className="mt-1">{getStatusBadge(selectedShipment.status)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase font-semibold text-on-surface-variant">
                    Last Scan Location
                  </div>
                  <div className="text-sm font-semibold text-on-surface mt-1">
                    {selectedShipment.location}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                  Journey Timeline & Milestones
                </h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-outline-variant">
                  {selectedShipment.milestones.map((ms, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 pl-1">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          ms.done
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-on-surface-variant border border-outline'
                        }`}
                      >
                        {ms.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <div
                          className={`font-semibold ${ms.done ? 'text-on-surface' : 'text-on-surface-variant'}`}
                        >
                          {ms.title}
                        </div>
                        <div className="text-xs text-on-surface-variant flex justify-between mt-0.5">
                          <span>{ms.location}</span>
                          <span className="font-medium">{ms.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
              <a
                href={getCarrierTrackingUrl(
                  selectedShipment.carrier,
                  selectedShipment.trackingNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Track on {selectedShipment.carrier} Portal <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Button onClick={() => setSelectedShipment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
