import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { ArrowLeft, Edit, Mail, MapPin, ShoppingBag, Star, Loader2, Calendar } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [address, setAddress] = useState<any>(null);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    orderCount: 0,
    avgOrderValue: 0,
    reviewsCount: 0,
  });

  async function fetchCustomerData() {
    if (!id) return;
    try {
      const data = await AdminService.getCustomerDetail(id);
      const { profile, orders: customerOrders, addresses, reviewsCount } = data;

      setCustomer(profile);
      setOrders(customerOrders || []);

      const primaryAddress = addresses.find((a: any) => a.is_default) || addresses[0];
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setAddress(primaryAddress || null);

      const totalSpent = (customerOrders || []).reduce(
        (acc: number, o: any) => acc + Number(o.total_amount),
        // eslint-disable-line @typescript-eslint/no-explicit-any
        0
      );
      const orderCount = (customerOrders || []).length;

      setStats({
        totalSpent,
        orderCount,
        avgOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        reviewsCount: reviewsCount || 0,
      });
    } catch (err) {
      console.error('Error fetching customer detail:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchCustomerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'primary' | 'warning' | 'error' | 'secondary'> = {
      delivered: 'success',
      shipped: 'primary',
      processing: 'primary',
      pending: 'warning',
      cancelled: 'error',
      refunded: 'error',
      paid: 'success',
      confirmed: 'primary',
    };
    return <Badge variant={variants[status.toLowerCase()] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-on-surface">Customer not found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-display-sm font-semibold text-on-background">{customer.full_name}</h1>
          {stats.totalSpent > 50000 && <Badge variant="success">VIP Customer</Badge>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </Button>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20">
            <div className="text-indigo-700 dark:text-indigo-300 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
              Lifetime Value (LTV)
            </div>
            <div className="text-3xl font-black text-indigo-700 dark:text-indigo-400">
              ₹{stats.totalSpent.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-on-surface">{stats.orderCount}</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Avg Order Value</div>
            <div className="text-3xl font-bold text-on-surface">
              ₹{Math.round(stats.avgOrderValue).toLocaleString()}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Reviews Left</div>
            <div className="text-3xl font-bold text-on-surface flex items-center gap-2">
              {stats.reviewsCount} <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Customer Info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-on-surface">Email Address</div>
                  <div className="text-sm text-primary hover:underline cursor-pointer">
                    {customer.email}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-on-surface">Primary Address</div>
                  {address ? (
                    <div className="text-sm text-on-surface-variant mt-1">
                      {address.full_name}
                      <br />
                      {address.line_1}
                      {address.line_2 ? `, ${address.line_2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postal_code}
                      <br />
                      {address.country}
                    </div>
                  ) : (
                    <div className="text-sm text-on-surface-variant mt-1 italic">
                      No address saved
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-on-surface">Joined On</div>
                  <div className="text-sm text-on-surface-variant mt-1">
                    {new Date(customer.created_at).toLocaleDateString(undefined, {
                      dateStyle: 'long',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Internal Notes</h2>
            </div>
            <div className="p-4">
              <textarea
                className="w-full bg-surface-container-lowest border border-outline rounded p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                rows={4}
                placeholder="Add private notes about this customer..."
              />
              <Button size="sm" className="mt-3 w-full">
                Save Note
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Recent Orders
              </h2>
              <Link to="/orders">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </div>
            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-on-surface-variant">
                        No orders found for this customer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                          <Link to={`/orders/${order.id}`}>#{order.order_number}</Link>
                        </TableCell>
                        <TableCell className="text-on-surface-variant">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Customer Timeline */}
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Customer Timeline
              </h2>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <p className="text-center text-on-surface-variant py-4 italic">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-outline-variant">
                  {/* Account Creation Event */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute left-0 h-10 w-10 rounded-full border bg-primary/10 border-primary/20 flex items-center justify-center z-10 text-primary">
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="ml-12 pt-2">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-on-surface">Account Created</span>
                        <time className="text-xs text-on-surface-variant ml-4">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">
                        Customer joined ByteEvolvr.
                      </p>
                    </div>
                  </div>

                  {/* Order Events mapped to timeline */}
                  {orders
                    .sort(
                      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                    .map((order) => (
                      <div key={order.id} className="relative flex items-start gap-4">
                        <div
                          className={`absolute left-0 h-10 w-10 rounded-full border flex items-center justify-center z-10 
                        ${
                          order.status === 'refunded'
                            ? 'bg-error/10 border-error/20 text-error'
                            : order.status === 'returned'
                              ? 'bg-warning/10 border-warning/20 text-warning'
                              : 'bg-surface-container border-outline-variant text-on-surface-variant'
                        }`}
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="ml-12 pt-2 w-full">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-on-surface">
                              {order.status === 'refunded'
                                ? 'Order Refunded'
                                : order.status === 'returned'
                                  ? 'Order Returned'
                                  : 'Placed Order'}{' '}
                              <Link
                                to={`/orders/${order.id}`}
                                className="text-primary hover:underline"
                              >
                                #{order.order_number}
                              </Link>
                            </span>
                            <time className="text-xs text-on-surface-variant ml-4">
                              {new Date(order.created_at).toLocaleDateString()}
                            </time>
                          </div>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {order.status === 'refunded'
                              ? `Refunded ₹${Number(order.total_amount).toLocaleString()}`
                              : `Spent ₹${Number(order.total_amount).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
