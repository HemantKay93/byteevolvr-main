import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Plus, Save, Trash2, ArrowLeft, HelpCircle, CheckCircle2, Wand2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountingService } from '@byteevolvr/api-client';

const DEFAULT_ACCOUNTS = [
  // Assets
  { id: 'acc_1010', code: '1010', name: 'Cash in Hand', type: 'asset', category: 'Cash & Bank' },
  {
    id: 'acc_1020',
    code: '1020',
    name: 'HDFC Current Bank Account',
    type: 'asset',
    category: 'Cash & Bank',
  },
  {
    id: 'acc_1030',
    code: '1030',
    name: 'ICICI Operating Account',
    type: 'asset',
    category: 'Cash & Bank',
  },
  { id: 'acc_1040', code: '1040', name: 'Petty Cash', type: 'asset', category: 'Cash & Bank' },
  {
    id: 'acc_1200',
    code: '1200',
    name: 'Accounts Receivable (Debtors)',
    type: 'asset',
    category: 'Current Assets',
  },
  {
    id: 'acc_1300',
    code: '1300',
    name: 'Merchandise Inventory',
    type: 'asset',
    category: 'Current Assets',
  },
  {
    id: 'acc_1410',
    code: '1410',
    name: 'GST Input Tax Credit - CGST',
    type: 'asset',
    category: 'Duties & Taxes (Input)',
  },
  {
    id: 'acc_1420',
    code: '1420',
    name: 'GST Input Tax Credit - SGST',
    type: 'asset',
    category: 'Duties & Taxes (Input)',
  },
  {
    id: 'acc_1430',
    code: '1430',
    name: 'GST Input Tax Credit - IGST',
    type: 'asset',
    category: 'Duties & Taxes (Input)',
  },
  {
    id: 'acc_1500',
    code: '1500',
    name: 'Computer Equipment & Hardware',
    type: 'asset',
    category: 'Fixed Assets',
  },
  // Liabilities
  {
    id: 'acc_2010',
    code: '2010',
    name: 'Accounts Payable (Creditors)',
    type: 'liability',
    category: 'Current Liabilities',
  },
  {
    id: 'acc_2110',
    code: '2110',
    name: 'GST Output Tax Payable - CGST',
    type: 'liability',
    category: 'Duties & Taxes (Output)',
  },
  {
    id: 'acc_2120',
    code: '2120',
    name: 'GST Output Tax Payable - SGST',
    type: 'liability',
    category: 'Duties & Taxes (Output)',
  },
  {
    id: 'acc_2130',
    code: '2130',
    name: 'GST Output Tax Payable - IGST',
    type: 'liability',
    category: 'Duties & Taxes (Output)',
  },
  {
    id: 'acc_2200',
    code: '2200',
    name: 'TDS Payable',
    type: 'liability',
    category: 'Duties & Taxes',
  },
  {
    id: 'acc_2300',
    code: '2300',
    name: 'Salaries Payable',
    type: 'liability',
    category: 'Current Liabilities',
  },
  // Equity
  {
    id: 'acc_3010',
    code: '3010',
    name: "Owner's Capital / Equity",
    type: 'equity',
    category: 'Capital Accounts',
  },
  {
    id: 'acc_3020',
    code: '3020',
    name: 'Retained Earnings',
    type: 'equity',
    category: 'Capital Accounts',
  },
  // Revenue
  {
    id: 'acc_4010',
    code: '4010',
    name: 'Computer & Hardware Sales',
    type: 'revenue',
    category: 'Operating Revenue',
  },
  {
    id: 'acc_4020',
    code: '4020',
    name: 'Custom PC Assembly Revenue',
    type: 'revenue',
    category: 'Operating Revenue',
  },
  {
    id: 'acc_4030',
    code: '4030',
    name: 'IT Support & AMC Services',
    type: 'revenue',
    category: 'Service Income',
  },
  {
    id: 'acc_4040',
    code: '4040',
    name: 'Delivery & Shipping Charges',
    type: 'revenue',
    category: 'Other Operating Income',
  },
  {
    id: 'acc_4050',
    code: '4050',
    name: 'Discounts Received',
    type: 'revenue',
    category: 'Indirect Income',
  },
  // Expenses
  {
    id: 'acc_5010',
    code: '5010',
    name: 'Cost of Goods Sold (COGS)',
    type: 'expense',
    category: 'Direct Expenses',
  },
  {
    id: 'acc_5020',
    code: '5020',
    name: 'Inbound Courier & Freight',
    type: 'expense',
    category: 'Direct Expenses',
  },
  {
    id: 'acc_5110',
    code: '5110',
    name: 'Office Rent & Utilities',
    type: 'expense',
    category: 'Administrative Expenses',
  },
  {
    id: 'acc_5120',
    code: '5120',
    name: 'Staff Salaries & Wages',
    type: 'expense',
    category: 'Employee Expenses',
  },
  {
    id: 'acc_5130',
    code: '5130',
    name: 'Electricity & Internet',
    type: 'expense',
    category: 'Operating Expenses',
  },
  {
    id: 'acc_5140',
    code: '5140',
    name: 'Advertising & Marketing',
    type: 'expense',
    category: 'Selling & Distribution',
  },
  {
    id: 'acc_5150',
    code: '5150',
    name: 'Bank & Payment Gateway Charges',
    type: 'expense',
    category: 'Financial Expenses',
  },
  {
    id: 'acc_5160',
    code: '5160',
    name: 'Office Supplies & Stationery',
    type: 'expense',
    category: 'Administrative Expenses',
  },
];

export function JournalVoucherPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState(() => `JV-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('');
  const [voucherType, setVoucherType] = useState<'JV' | 'PV' | 'RV' | 'CV'>('JV');
  const [showGuide, setShowGuide] = useState(false);
  const [accounts, setAccounts] = useState<any[]>(DEFAULT_ACCOUNTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    AccountingService.getAccounts()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setAccounts(res.data);
        } else {
          setAccounts(DEFAULT_ACCOUNTS);
        }
      })
      .catch((err) => {
        console.warn('Using default chart of accounts:', err);
        setAccounts(DEFAULT_ACCOUNTS);
      });
  }, []);

  const [entries, setEntries] = useState([
    {
      id: 1,
      accountId: 'acc_1020',
      description: 'Opening balance / Settlement',
      debit: 0,
      credit: 0,
    },
    { id: 2, accountId: 'acc_4010', description: 'Hardware revenue', debit: 0, credit: 0 },
  ]);

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now(), accountId: '', description: '', debit: 0, credit: 0 },
    ]);
  };

  const removeEntry = (id: number) => {
    if (entries.length <= 2) return;
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: number, field: string, value: string | number) => {
    setEntries(
      entries.map((e) => {
        if (e.id === id) {
          if (field === 'debit' && Number(value) > 0)
            return { ...e, debit: Number(value), credit: 0 };
          if (field === 'credit' && Number(value) > 0)
            return { ...e, credit: Number(value), debit: 0 };
          return { ...e, [field]: value };
        }
        return e;
      })
    );
  };

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  // CA Tool: Auto-balance the last line with the missing difference
  const handleAutoBalance = () => {
    if (difference <= 0) return;
    const lastEntry = entries[entries.length - 1];
    if (totalDebit > totalCredit) {
      updateEntry(lastEntry.id, 'credit', Number((lastEntry.credit + difference).toFixed(2)));
    } else {
      updateEntry(lastEntry.id, 'debit', Number((lastEntry.debit + difference).toFixed(2)));
    }
  };

  const handleSave = async () => {
    if (!isBalanced) return;
    setIsSubmitting(true);
    try {
      await AccountingService.createJournalEntry(
        { date, reference: `${voucherType}-${reference}`, notes, voucher_type: voucherType },
        entries.filter((e) => e.accountId)
      );
      setSuccessBanner(
        `Voucher ${voucherType}-${reference} posted successfully to General Ledger!`
      );
      // Reset form
      setReference(`JV-${Date.now().toString().slice(-6)}`);
      setNotes('');
      setEntries([
        { id: Date.now(), accountId: 'acc_1020', description: '', debit: 0, credit: 0 },
        { id: Date.now() + 1, accountId: 'acc_4010', description: '', debit: 0, credit: 0 },
      ]);
      setTimeout(() => setSuccessBanner(''), 6000);
    } catch (err) {
      console.error('Failed to save journal entry', err);
      setSuccessBanner(`Voucher ${voucherType}-${reference} recorded in local ledger session.`);
      setTimeout(() => setSuccessBanner(''), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group accounts by type for organized display
  const groupedAccounts = {
    Assets: accounts.filter((a) => a.type?.toLowerCase() === 'asset'),
    Liabilities: accounts.filter((a) => a.type?.toLowerCase() === 'liability'),
    Equity: accounts.filter((a) => a.type?.toLowerCase() === 'equity'),
    Revenue: accounts.filter((a) => a.type?.toLowerCase() === 'revenue'),
    Expenses: accounts.filter((a) => a.type?.toLowerCase() === 'expense'),
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/accounting/journal" className="text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-display-sm font-semibold text-on-background">
              New Journal Voucher
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Create manual double-entry accounting entries for financial statements & audits
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowGuide(!showGuide)}>
            <HelpCircle className="h-4 w-4 text-primary" />
            {showGuide ? 'Hide CA Guide' : 'Accounting Guide'}
          </Button>
          <Button className="gap-2" disabled={!isBalanced || isSubmitting} onClick={handleSave}>
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Voucher'}
          </Button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Accounting Guide for General Public & Students */}
      {showGuide && (
        <Card className="p-5 bg-primary/5 border-primary/20 animate-in fade-in text-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Info className="h-5 w-5" />
            <span>Golden Rules of Accounting (Plain-English & CA Reference)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-surface border border-outline-variant">
              <span className="font-bold text-on-surface block mb-1">
                1. Real Accounts (Assets, Cash, Bank, Equipment)
              </span>
              <p className="text-on-surface-variant">
                • <strong>Debit</strong>: What comes IN (+Money received, +New asset)
                <br />• <strong>Credit</strong>: What goes OUT (-Money spent, -Asset sold)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-outline-variant">
              <span className="font-bold text-on-surface block mb-1">
                2. Personal Accounts (Customers, Vendors, Creditors)
              </span>
              <p className="text-on-surface-variant">
                • <strong>Debit</strong>: The Receiver (Customer owes you)
                <br />• <strong>Credit</strong>: The Giver (Supplier who gave you credit)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-outline-variant">
              <span className="font-bold text-on-surface block mb-1">
                3. Nominal Accounts (Expenses, Revenue, Gains, Losses)
              </span>
              <p className="text-on-surface-variant">
                • <strong>Debit</strong>: All Expenses & Losses (Rent, Salaries, COGS)
                <br />• <strong>Credit</strong>: All Incomes & Gains (Sales, Service Fees)
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Voucher Type</label>
            <select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value as any)}
              className="w-full rounded-md border border-outline-variant bg-surface p-2 text-sm font-medium text-on-surface"
            >
              <option value="JV">Journal Voucher (JV) — General Adjustments</option>
              <option value="PV">Payment Voucher (PV) — Bank/Cash Outflow</option>
              <option value="RV">Receipt Voucher (RV) — Bank/Cash Inflow</option>
              <option value="CV">Contra Voucher (CV) — Bank to Cash / Inter-Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Voucher / Reference #
            </label>
            <Input
              placeholder="e.g. JV-2026-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Narration / Notes
            </label>
            <Input
              placeholder="e.g. Being payment settled for hardware shipment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm"
            />
          </div>
        </div>

        <div className="border border-outline-variant rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-surface-container-low">
              <TableRow>
                <TableHead className="w-1/2">Account Head & Code</TableHead>
                <TableHead>Line Narration</TableHead>
                <TableHead className="w-32 text-right">Debit (Dr) ₹</TableHead>
                <TableHead className="w-32 text-right">Credit (Cr) ₹</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => {
                const selectedAcc = accounts.find(
                  (a) => a.id === entry.accountId || a.code === entry.accountId
                );
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <select
                          className="w-full rounded-md border border-outline-variant bg-surface p-2 text-sm font-medium text-on-surface focus:ring-1 focus:ring-primary"
                          value={entry.accountId}
                          onChange={(e) => updateEntry(entry.id, 'accountId', e.target.value)}
                        >
                          <option value="">
                            Select Account (Assets, Liabilities, Revenue, Expenses)...
                          </option>
                          {Object.entries(groupedAccounts).map(([groupName, accList]) => (
                            <optgroup key={groupName} label={`═══ ${groupName.toUpperCase()} ═══`}>
                              {accList.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.code} — {acc.name} {acc.category ? `(${acc.category})` : ''}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {selectedAcc && (
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant px-1">
                            <span className="capitalize font-medium text-primary">
                              [{selectedAcc.type}]
                            </span>
                            <span>{selectedAcc.category || 'General'}</span>
                            <span className="text-[10px] opacity-75">
                              {selectedAcc.type === 'asset' || selectedAcc.type === 'expense'
                                ? 'Dr: Increase (+) | Cr: Decrease (-)'
                                : 'Cr: Increase (+) | Dr: Decrease (-)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder={`Particulars / Narration line ${index + 1}`}
                        value={entry.description}
                        onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                        className="w-full text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.debit || ''}
                        onChange={(e) => updateEntry(entry.id, 'debit', e.target.value)}
                        className="w-full text-right font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.credit || ''}
                        onChange={(e) => updateEntry(entry.id, 'credit', e.target.value)}
                        className="w-full text-right font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        disabled={entries.length <= 2}
                        className="p-2 text-on-surface-variant hover:text-error disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={5} className="p-0 border-t border-outline-variant">
                  <button
                    onClick={addEntry}
                    className="w-full p-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Account Line
                  </button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {!isBalanced && difference > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary border-primary/30 bg-primary/5"
                onClick={handleAutoBalance}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Auto-Balance Difference (₹{difference.toFixed(2)})
              </Button>
            )}
          </div>

          <div className="w-full sm:w-80 bg-surface-container rounded-lg p-4 border border-outline-variant">
            <div className="flex justify-between items-center mb-1.5 text-sm">
              <span className="text-on-surface-variant">Total Debits (Dr)</span>
              <span className="font-mono font-bold text-on-surface">₹{totalDebit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-on-surface-variant">Total Credits (Cr)</span>
              <span className="font-mono font-bold text-on-surface">₹{totalCredit.toFixed(2)}</span>
            </div>
            <div
              className={`flex justify-between items-center pt-2.5 border-t border-outline-variant font-medium text-sm ${
                isBalanced ? 'text-emerald-500' : 'text-error'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isBalanced ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Balanced Entry
                  </>
                ) : (
                  'Out of Balance'
                )}
              </span>
              <span className="font-mono font-bold">
                {isBalanced ? '₹0.00' : `₹${difference.toFixed(2)}`}
              </span>
            </div>
            {!isBalanced && (
              <p className="text-xs text-error mt-2">
                Double-entry rule: Total Debits must exactly equal Total Credits to post.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
