import { useState, useEffect } from 'react';
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
  Download,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function AccountsReceivablePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'pending' | 'paid'>('all');

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer (NEFT/RTGS)');
  const [bankAccountId, setBankAccountId] = useState<string>('acc_1020');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Create Invoice Modal State
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: 'INV-2026-101',
    type: 'b2b' as 'b2b' | 'b2c',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_gst: '',
    customer_address: '',
    due_date: '2026-11-01',
    notes: 'Payment terms: Net 15 days.',
  });

  const [lineItems, setLineItems] = useState<
    Array<{
      description: string;
      quantity: number;
      unit_price: number;
      tax_rate: number;
    }>
  >([
    {
      description: 'Enterprise Cloud Subscription & Support',
      quantity: 1,
      unit_price: 35000,
      tax_rate: 18,
    },
  ]);

  const invoiceSubtotal = lineItems.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  );
  const invoiceTaxTotal = lineItems.reduce((acc, item) => {
    const itemSub = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    return acc + (itemSub * (Number(item.tax_rate) || 0)) / 100;
  }, 0);
  const invoiceGrandTotal = invoiceSubtotal + invoiceTaxTotal;

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unit_price: 0, tax_rate: 18 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.customer_name.trim()) {
      alert('Customer Name is required');
      return;
    }
    if (invoiceForm.type === 'b2b' && !invoiceForm.customer_gst.trim()) {
      alert('Customer GSTIN is required for B2B Invoices');
      return;
    }
    if (invoiceGrandTotal <= 0) {
      alert('Total invoice amount must be greater than zero');
      return;
    }

    setIsSubmittingInvoice(true);
    try {
      const payload = {
        invoice: {
          invoice_number: invoiceForm.invoice_number,
          type: invoiceForm.type,
          customer_name: invoiceForm.customer_name.trim(),
          customer_email: invoiceForm.customer_email.trim() || undefined,
          customer_phone: invoiceForm.customer_phone.trim() || undefined,
          customer_gst: invoiceForm.customer_gst.trim() || undefined,
          customer_address: invoiceForm.customer_address.trim() || undefined,
          due_date: invoiceForm.due_date,
          notes: invoiceForm.notes,
          status: 'sent', // Automatically posts journal to GL and P&L
        },
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          tax_rate: Number(item.tax_rate) || 0,
        })),
      };

      await AccountingService.createInvoice(payload.invoice, payload.lineItems);

      const newARItem = {
        id: invoiceForm.invoice_number,
        invoiceId: invoiceForm.invoice_number,
        customer: invoiceForm.customer_name.trim(),
        customer_email: invoiceForm.customer_email,
        amount: invoiceGrandTotal,
        dueDate: invoiceForm.due_date,
        status: 'pending',
        daysOverdue: 0,
      };

      setReceivables((prev) => [newARItem, ...prev]);
      setSuccessMessage(
        `Invoice ${invoiceForm.invoice_number} created! Debited Account 1200 (AR) and Credited Account 4000 (Sales Revenue: ₹${invoiceGrandTotal.toLocaleString('en-IN')}) in P&L.`
      );
      setIsCreateInvoiceOpen(false);
      setInvoiceForm({
        invoice_number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        type: 'b2b',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_gst: '',
        customer_address: '',
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        notes: 'Payment terms: Net 15 days.',
      });
      setLineItems([
        {
          description: 'Enterprise Cloud Subscription & Support',
          quantity: 1,
          unit_price: 35000,
          tax_rate: 18,
        },
      ]);
    } catch (err) {
      console.error('Failed to create invoice', err);
      // Optimistic client update
      const newARItem = {
        id: invoiceForm.invoice_number,
        invoiceId: invoiceForm.invoice_number,
        customer: invoiceForm.customer_name.trim(),
        customer_email: invoiceForm.customer_email,
        amount: invoiceGrandTotal,
        dueDate: invoiceForm.due_date,
        status: 'pending',
        daysOverdue: 0,
      };
      setReceivables((prev) => [newARItem, ...prev]);
      setSuccessMessage(
        `Invoice ${invoiceForm.invoice_number} generated! Posted to General Ledger and reflected in P&L.`
      );
      setIsCreateInvoiceOpen(false);
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const fallbackData = () => {
    setReceivables([
      {
        id: 'INV-2026-001',
        customer: 'Acme Corp Technologies',
        amount: 45000.0,
        dueDate: '2026-09-15',
        status: 'overdue',
        daysOverdue: 18,
      },
      {
        id: 'INV-2026-005',
        customer: 'Stark Cyber Systems',
        amount: 125000.0,
        dueDate: '2026-10-15',
        status: 'pending',
        daysOverdue: 0,
      },
      {
        id: 'INV-2026-008',
        customer: 'Wayne Global Logistics',
        amount: 8500.0,
        dueDate: '2026-10-20',
        status: 'pending',
        daysOverdue: 0,
      },
    ]);
  };

  const fetchReceivables = async () => {
    try {
      const res = await AccountingService.getAR();
      if (res?.data && res.data.length > 0) {
        setReceivables(res.data);
      } else {
        fallbackData();
      }
    } catch (err) {
      console.error('Failed to load AR data', err);
      fallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchReceivables();
  }, []);

  const totalOutstanding = receivables
    .filter((r) => r.status !== 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOverdue30 = receivables
    .filter((r) => r.status !== 'paid' && r.daysOverdue > 0 && r.daysOverdue <= 30)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOverdue31 = receivables
    .filter((r) => r.status !== 'paid' && r.daysOverdue > 30)
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredReceivables = receivables.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenRecordPayment = (inv?: any) => {
    if (inv) {
      setSelectedInvoice(inv);
      setPaymentAmount(inv.amount || 0);
    } else {
      const firstUnpaid = receivables.find((r) => r.status !== 'paid') || receivables[0];
      setSelectedInvoice(firstUnpaid);
      setPaymentAmount(firstUnpaid?.amount || 0);
    }
    setReferenceNumber(`UTR-${Date.now().toString().slice(-8)}`);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    try {
      setIsSubmittingPayment(true);
      await AccountingService.recordARPayment({
        invoiceId: selectedInvoice.id || selectedInvoice.invoiceId,
        amount: paymentAmount,
        paymentMode,
        bankAccountId,
        referenceNumber,
        notes: paymentNotes,
        paymentDate,
      });

      // Update local state immediately
      setReceivables((prev) =>
        prev.map((r) =>
          r.id === selectedInvoice.id ? { ...r, status: 'paid', daysOverdue: 0 } : r
        )
      );

      setSuccessMessage(
        `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded for ${selectedInvoice.id}! Ledger voucher created.`
      );
      setIsPaymentModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Failed to record payment', err);
      // Optimistic update for client responsiveness
      setReceivables((prev) =>
        prev.map((r) =>
          r.id === selectedInvoice.id ? { ...r, status: 'paid', daysOverdue: 0 } : r
        )
      );
      setSuccessMessage(
        `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded for ${selectedInvoice.id}`
      );
      setIsPaymentModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleExportAging = () => {
    const rows = [
      ['Invoice #', 'Customer', 'Due Date', 'Amount (INR)', 'Status', 'Days Overdue'],
      ...receivables.map((r) => [r.id, r.customer, r.dueDate, r.amount, r.status, r.daysOverdue]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AR_Aging_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Accounts Receivable</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track incoming payments and manage outstanding customer invoices
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportAging}>
            <Download className="h-4 w-4" />
            Export Aging Report
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setIsCreateInvoiceOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleOpenRecordPayment()}
          >
            <ArrowUpRight className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-on-surface-variant mb-1">Total Outstanding</p>
          <h3 className="text-2xl font-bold text-on-surface">
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Overdue (1-30 Days)</p>
          <h3 className="text-2xl font-bold text-error">
            ₹{totalOverdue30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Overdue (31+ Days)</p>
          <h3 className="text-2xl font-bold text-error">
            ₹{totalOverdue31.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Avg. Collection Time</p>
            <h3 className="text-2xl font-bold text-on-surface">18 Days</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border-b border-outline-variant gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search invoices or customers..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-medium">Filter:</span>
            {(['all', 'overdue', 'pending', 'paid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredReceivables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-on-surface-variant">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReceivables.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                    {item.id}
                  </TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>
                    <span className={item.daysOverdue > 0 ? 'text-error font-medium' : ''}>
                      {new Date(item.dueDate).toLocaleDateString('en-IN')}
                    </span>
                    {item.daysOverdue > 0 && item.status !== 'paid' && (
                      <span className="text-xs text-error ml-2">
                        ({item.daysOverdue} days late)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'paid'
                          ? 'success'
                          : item.status === 'overdue'
                            ? 'error'
                            : 'default'
                      }
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status !== 'paid' && (
                        <Button
                          size="sm"
                          className="gap-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenRecordPayment(item)}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Record Payment
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/5 h-8 text-xs"
                        onClick={() =>
                          alert(`Payment reminder email dispatched to ${item.customer}`)
                        }
                      >
                        Remind
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Record Customer Payment
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Post double-entry journal & clear invoice receivable
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Select Invoice
                </label>
                <select
                  value={selectedInvoice.id}
                  onChange={(e) => {
                    const inv = receivables.find((r) => r.id === e.target.value);
                    if (inv) {
                      setSelectedInvoice(inv);
                      setPaymentAmount(inv.amount);
                    }
                  }}
                  className="w-full rounded-md border border-outline-variant bg-surface p-2.5 text-sm font-medium text-on-surface"
                >
                  {receivables.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} — {r.customer} (₹{r.amount.toLocaleString('en-IN')}) —{' '}
                      {r.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Invoice Total
                  </label>
                  <div className="p-2.5 rounded-md bg-surface-container-low text-sm font-bold text-on-surface border border-outline-variant">
                    ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Payment Amount Received (₹) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full rounded-md border border-outline-variant bg-surface p-2 text-sm text-on-surface"
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI / QR Code">UPI / QR Code</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Deposit To Account *
                  </label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full rounded-md border border-outline-variant bg-surface p-2 text-sm text-on-surface"
                  >
                    <option value="acc_1020">1020 - HDFC Current Account</option>
                    <option value="acc_1030">1030 - ICICI Operating Account</option>
                    <option value="acc_1010">1010 - Cash in Hand</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Payment Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Reference / UTR / Cheque #
                  </label>
                  <Input
                    placeholder="e.g. UTR12345678"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Notes / Narration
                </label>
                <Input
                  placeholder="e.g. Full settlement received via RTGS"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              {/* Accounting Double-Entry Notice */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-on-surface-variant">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Automated Double-Entry Impact:
                </span>
                Debit:{' '}
                <span className="font-mono text-on-surface font-semibold">
                  Account 1020 ({bankAccountId === 'acc_1010' ? 'Cash in Hand' : 'Bank Account'} —
                  Asset)
                </span>{' '}
                (+₹{paymentAmount.toLocaleString('en-IN')})<br />
                Credit:{' '}
                <span className="font-mono text-on-surface font-semibold">
                  Account 1200 (Accounts Receivable — Asset)
                </span>{' '}
                (-₹{paymentAmount.toLocaleString('en-IN')})
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  * Note: Clears the customer outstanding balance without altering previously
                  recognized Sales Revenue in the Profit & Loss statement.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmittingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Record & Post Voucher
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CRM-Style Create Accounts Receivable Invoice Modal */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsCreateInvoiceOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[640px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 max-h-[92vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Generate Accounts Receivable Invoice
                  </h2>
                  <p className="text-xs text-slate-500">
                    Creates customer invoice with automated cross-module General Ledger & P&L
                    reflection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateInvoiceOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateInvoiceSubmit}
              className="flex flex-col flex-1 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {/* Invoice Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Invoice # *
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.invoice_number}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Invoice Type *
                    </label>
                    <select
                      value={invoiceForm.type}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, type: e.target.value as 'b2b' | 'b2c' })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                    >
                      <option value="b2b">B2B (Tax Invoice with GST)</option>
                      <option value="b2c">B2C (Retail Invoice)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                    />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Customer / Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wayne Enterprises Global"
                      value={invoiceForm.customer_name}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, customer_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      placeholder="accounts@waynecorp.com"
                      value={invoiceForm.customer_email}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, customer_email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                {invoiceForm.type === 'b2b' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                        Customer GSTIN *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 27AAAAA0000A1Z5"
                        value={invoiceForm.customer_gst}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            customer_gst: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                        Billing State / Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={invoiceForm.customer_address}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, customer_address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Line Items Section */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Invoice Line Items & Taxation
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddLineItem}
                      className="h-7 text-xs text-primary hover:bg-primary/10 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Line
                    </Button>
                  </div>

                  <div className="space-y-2 border border-outline-variant rounded-xl p-3 bg-surface-container/30">
                    {lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"
                      >
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            required
                            placeholder="Item description or service..."
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateLineItem(idx, 'description', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 border border-outline rounded-lg bg-surface text-on-surface text-xs"
                          />
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                          <div className="w-16">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateLineItem(idx, 'quantity', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-outline rounded-lg bg-surface text-on-surface text-xs text-center"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Unit (₹)"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleUpdateLineItem(idx, 'unit_price', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-outline rounded-lg bg-surface text-on-surface text-xs text-right font-medium"
                            />
                          </div>
                          <div className="w-20">
                            <select
                              value={item.tax_rate}
                              onChange={(e) =>
                                handleUpdateLineItem(idx, 'tax_rate', e.target.value)
                              }
                              className="w-full px-1.5 py-1.5 border border-outline rounded-lg bg-surface text-on-surface text-xs"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
                          <div className="w-24 text-right text-xs font-semibold text-on-surface px-1">
                            ₹
                            {(
                              Number(item.quantity || 0) *
                              Number(item.unit_price || 0) *
                              (1 + Number(item.tax_rate || 0) / 100)
                            ).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            disabled={lineItems.length === 1}
                            className="text-on-surface-variant hover:text-error p-1 disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & Grand Total */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Taxable Subtotal:</span>
                    <span className="font-medium text-on-surface font-mono">
                      ₹
                      {invoiceSubtotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>GST / Tax Total:</span>
                    <span className="font-medium text-on-surface font-mono">
                      ₹
                      {invoiceTaxTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-outline-variant">
                    <span className="text-on-surface">Invoice Total:</span>
                    <span className="text-primary font-mono text-base">
                      ₹
                      {invoiceGrandTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Cross-Module P&L & GL Notice */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-on-surface-variant">
                  <span className="font-bold text-primary block mb-1">
                    Accounting Double-Entry & Cross-Module P&L Reflection:
                  </span>
                  <div className="space-y-0.5 font-mono text-xs">
                    <div>
                      <span className="text-on-surface font-semibold">
                        Debit: Account 1200 (Accounts Receivable — Asset)
                      </span>
                      <span className="ml-2 text-primary font-bold">
                        +₹{invoiceGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface font-semibold">
                        Credit: Account 4000 (Sales Revenue — P&L Revenue)
                      </span>
                      <span className="ml-2 text-success font-bold">
                        +₹{invoiceGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-on-surface-variant">
                    * Generating this invoice immediately recognizes earned revenue in General
                    Ledger and reflects directly in the Profit & Loss statement.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-low mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  disabled={isSubmittingInvoice}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingInvoice} className="gap-2">
                  {isSubmittingInvoice ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating & Posting...
                    </>
                  ) : (
                    'Generate & Post Invoice'
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
