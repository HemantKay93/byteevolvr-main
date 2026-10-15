import { useState, useEffect } from 'react';
import { Card, Input, Button, Badge } from '@byteevolvr/ui';
import {
  Search,
  ShoppingCart,
  CreditCard,
  Banknote,
  User,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { AdminService, CMSService } from '@byteevolvr/api-client';
import { printInvoice } from '@byteevolvr/ui';

export function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<any>>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customer, setCustomer] = useState({
    name: 'Walk-in Customer',
    email: 'walkin@customer.com',
    phone: '0000000000',
  });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [tempCustomer, setTempCustomer] = useState(customer);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [lastCartSnapshot, setLastCartSnapshot] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any

  async function fetchProducts() {
    try {
      const data = await AdminService.getPosProducts({ status: 'active' });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.qty + delta);
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const saveCustomer = () => {
    setCustomer(tempCustomer);
    setShowCustomerModal(false);
  };

  const handleCheckout = async (method: 'cash' | 'card') => {
    if (cart.length === 0) return;

    // For Card, redirect to payment page (Mock)
    if (method === 'card') {
      const subtotal = cart.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
      const total = subtotal * 1.18;
      // In a real app, this would redirect to /checkout or Stripe
      alert(`Redirecting to Secure Payment Gateway for ₹${total.toLocaleString()}...`);
      // Simulating a redirect or opening a payment link
      window.open(`https://razorpay.com/demo/?amount=${total}`, '_blank');
      return;
    }

    setIsProcessing(true);
    try {
      const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
      const subtotal = cart.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      const orderData = {
        order_number: orderNumber,
        status: 'processing' as const,
        payment_status: 'captured' as const,
        payment_method: method,
        totalAmount: total,
        shippingAddress: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          line_1: 'POS Counter',
          city: 'In-Store',
          state: 'Local',
          postal_code: '000000',
          country: 'India',
        },
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          sku: item.sku || '',
          quantity: item.qty,
          price: Number(item.price),
        })),
      };

      const response = await AdminService.createOrder(orderData);
      const serverOrder = response?.order || response?.data || response || {};
      const orderRecord = {
        ...orderData,
        ...(typeof serverOrder === 'object' ? serverOrder : {}),
        order_number: serverOrder?.order_number || orderNumber,
        created_at: serverOrder?.created_at || new Date().toISOString(),
        subtotal,
        tax_amount: tax,
        total_amount: total,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        order_items: cart.map((item) => ({
          product_name: item.name,
          sku: item.sku || '',
          quantity: item.qty,
          unit_price: Number(item.price),
          total_price: Number(item.price) * item.qty,
        })),
      };

      setLastCreatedOrder(orderRecord);
      setLastCartSnapshot([...cart]);
      setSuccess(true);
      setCart([]);
      setTimeout(() => setSuccess(false), 8000); // Longer success message if they want to print
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Checkout failed:', err);
      alert(`Checkout failed: ${err.message || 'Something went wrong'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!lastCreatedOrder) return;
    const rawOrder = lastCreatedOrder?.order || lastCreatedOrder?.data || lastCreatedOrder;
    const items =
      rawOrder.order_items && rawOrder.order_items.length > 0
        ? rawOrder.order_items
        : lastCartSnapshot.map((item) => ({
            product_name: item.name,
            sku: item.sku || '',
            quantity: item.qty,
            unit_price: Number(item.price),
            total_price: Number(item.price) * item.qty,
          }));

    const order = {
      ...rawOrder,
      order_number:
        rawOrder.order_number || rawOrder.orderNumber || `POS-${Date.now().toString().slice(-6)}`,
      created_at: rawOrder.created_at || rawOrder.createdAt || new Date().toISOString(),
      total_amount:
        rawOrder.total_amount ??
        rawOrder.totalAmount ??
        items.reduce((s: number, i: any) => s + Number(i.total_price || 0), 0),
      subtotal:
        rawOrder.subtotal ?? items.reduce((s: number, i: any) => s + Number(i.total_price || 0), 0),
      tax_amount: rawOrder.tax_amount ?? rawOrder.tax ?? 0,
      customer_name: rawOrder.customer_name || customer.name,
      customer_email: rawOrder.customer_email || customer.email,
    };

    try {
      const cmsData = await CMSService.getContent('global');
      printInvoice(order, items, cmsData);
    } catch (err) {
      console.error('Failed to get settings for receipt', err);
      printInvoice(order, items);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="h-[calc(100vh-6rem)] flex gap-6">
        {/* Products Grid */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-display-sm font-semibold text-on-background">Point of Sale</h1>
            {success && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 text-success font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Order completed successfully!
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary/5"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-on-surface-variant" />
            <input
              type="text"
              className="w-full h-11 pl-10 pr-4 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-on-surface-variant">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-on-surface-variant">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <Card className="hover:border-primary hover:shadow-md transition-all h-36 flex flex-col justify-between p-4 group bg-surface">
                      <div>
                        <div className="font-semibold text-on-surface line-clamp-2 group-hover:text-primary transition-colors text-sm">
                          {product.name}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                            {product.sku}
                          </span>
                          <Badge
                            variant={product.stock_quantity > 0 ? 'success' : 'error'}
                            className="text-[10px]"
                          >
                            {product.stock_quantity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ₹{Number(product.price).toLocaleString()}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <Card className="w-96 flex flex-col h-full bg-surface-container-low border-l border-outline-variant shadow-none rounded-none -my-6 -mr-6 py-6 px-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg text-on-surface">Current Order</span>
            </div>
            <Badge variant="primary">{cart.reduce((a, b) => a + b.qty, 0)} items</Badge>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-surface p-2 rounded border border-outline-variant">
            <User className="h-4 w-4 text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant truncate max-w-[180px]">
              {customer.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs py-1 h-auto"
              onClick={() => {
                setTempCustomer(customer);
                setShowCustomerModal(true);
              }}
            >
              Edit
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center text-on-surface-variant text-sm py-20 flex flex-col items-center">
                <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                Cart is empty.
                <br />
                Select items to start.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col bg-surface p-3 rounded border border-outline-variant hover:border-outline transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm text-on-surface leading-tight pr-4">
                      {item.name}
                    </div>
                    <div className="font-bold text-sm">
                      ₹{(Number(item.price) * item.qty).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-on-surface-variant font-medium">
                      ₹{Number(item.price).toLocaleString()} × {item.qty}
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-container rounded-lg p-1 border border-outline-variant">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(item.id, -1);
                        }}
                        className="p-1 text-on-surface hover:text-error transition-colors rounded hover:bg-surface"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(item.id, 1);
                        }}
                        className="p-1 text-on-surface hover:text-primary transition-colors rounded hover:bg-surface"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-outline-variant pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>GST (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-on-surface pt-3 border-t border-outline-variant mt-2">
              <span>Total</span>
              <span className="text-primary">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <Button
              variant="secondary"
              className="gap-2 h-14 font-bold"
              disabled={cart.length === 0 || isProcessing}
              onClick={() => handleCheckout('cash')}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Banknote className="h-5 w-5" />
              )}
              Cash
            </Button>
            <Button
              className="gap-2 h-14 font-bold"
              disabled={cart.length === 0 || isProcessing}
              onClick={() => handleCheckout('card')}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              Card
            </Button>
          </div>
        </Card>
      </div>
      {/* Customer Edit Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card
            className="w-full max-w-[480px] min-w-[320px] shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ width: '480px' }}
          >
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-bold text-on-surface">Customer Details</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-on-surface-variant hover:text-on-surface text-xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <Input
                  value={tempCustomer.name}
                  onChange={(e) => setTempCustomer({ ...tempCustomer, name: e.target.value })}
                  className="h-11 w-full"
                  placeholder="Customer Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={tempCustomer.email}
                  onChange={(e) => setTempCustomer({ ...tempCustomer, email: e.target.value })}
                  className="h-11 w-full"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <Input
                  value={tempCustomer.phone}
                  onChange={(e) => setTempCustomer({ ...tempCustomer, phone: e.target.value })}
                  className="h-11 w-full"
                  placeholder="00000 00000"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 rounded-xl font-bold h-12"
                >
                  Cancel
                </Button>
                <Button onClick={saveCustomer} className="flex-1 rounded-xl font-bold h-12">
                  Save Details
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
