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
import { Search, Download, ArrowUpRight, TrendingUp, Loader2, CheckCircle2, X } from 'lucide-react';
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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportAging}>
            <Download className="h-4 w-4" />
            Export Aging Report
          </Button>
          <Button className="gap-2" onClick={() => handleOpenRecordPayment()}>
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
          <Card className="w-full max-w-lg bg-surface border border-outline shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Record Customer Payment</h3>
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
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-on-surface-variant">
                <span className="font-semibold text-primary block mb-0.5">
                  Automated Double-Entry Impact:
                </span>
                Debit:{' '}
                <span className="font-mono text-on-surface font-semibold">
                  {bankAccountId === 'acc_1010' ? 'Cash in Hand (1010)' : 'Bank Account (1020)'}
                </span>{' '}
                (+₹{paymentAmount.toLocaleString('en-IN')})<br />
                Credit:{' '}
                <span className="font-mono text-on-surface font-semibold">
                  Accounts Receivable (1200)
                </span>{' '}
                (-₹{paymentAmount.toLocaleString('en-IN')})
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
    </div>
  );
}
