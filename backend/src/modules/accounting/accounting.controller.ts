import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';

import { AccountingService } from './accounting.service.js';
import { AccountingRepository } from './accounting.repository.js';
import { LedgerService } from './ledger.service.js';
import { ARService } from './ar.service.js';
import { APService } from './ap.service.js';
import { ExpenseService } from './expense.service.js';
import { BankingService } from './banking.service.js';
import { ReconciliationService } from './reconciliation.service.js';
import { GSTService } from './gst.service.js';
import { ReportingService } from './reporting.service.js';
import { PeriodService } from './period.service.js';

export const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const { invoice, lineItems } = req.body;
  const tenantId = (req as any).user?.tenant_id;
  const created = await AccountingService.createInvoice(tenantId, invoice, lineItems);
  res.status(201).json({ status: 'success', data: created });
});

export const getInvoices = catchAsync(async (req: Request, res: Response) => {
  const { type, status } = req.query;
  const invoices = await AccountingRepository.getInvoices({
    type: type as string,
    status: status as string,
  });
  res.status(200).json({ status: 'success', data: invoices });
});

export const getInvoiceById = catchAsync(async (req: Request, res: Response) => {
  const invoice = await AccountingRepository.getInvoiceById(req.params.id as string);
  res.status(200).json({ status: 'success', data: invoice });
});

export const createJournalEntry = catchAsync(async (req: Request, res: Response) => {
  const { header, lines } = req.body;
  const userId = (req as any).user?.id || 'system';

  // Phase 14: Role-based approval (Admin or Accounting Manager only)
  const role = (req as any).user?.role;
  if (role && role !== 'admin' && role !== 'accounting_manager') {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have permission to post journal entries directly.',
    });
  }

  const entry = await AccountingRepository.createDoubleEntryJournal(header, lines, userId);
  res.status(201).json({ status: 'success', data: entry });
});

export const getJournalEntries = catchAsync(async (req: Request, res: Response) => {
  const { account_type } = req.query;
  const tenantId = (req as any).user?.tenant_id;
  const entries = await AccountingRepository.getJournalEntries(tenantId, {
    account_type: account_type as string,
  });
  res.status(200).json({ status: 'success', data: entries });
});

export const getAccountLedger = catchAsync(async (req: Request, res: Response) => {
  const { accountId, startDate, endDate } = req.query;
  const ledger = await LedgerService.getAccountLedger({
    accountId: accountId as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  res.status(200).json({ status: 'success', data: ledger });
});

export const getTrialBalance = catchAsync(async (req: Request, res: Response) => {
  const { asOfDate } = req.query;
  const tb = await LedgerService.getTrialBalance(asOfDate as string);
  res.status(200).json({ status: 'success', data: tb });
});

export const getARAging = catchAsync(async (req: Request, res: Response) => {
  const report = await ARService.getAgingReport();
  res.status(200).json({ status: 'success', data: report });
});

export const getCustomerLedger = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const ledger = await ARService.getCustomerLedger(customerId as string);
  res.status(200).json({ status: 'success', data: ledger });
});

export const getAPAging = catchAsync(async (req: Request, res: Response) => {
  const report = await APService.getAgingReport();
  res.status(200).json({ status: 'success', data: report });
});

export const getVendorLedger = catchAsync(async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  const ledger = await APService.getVendorLedger(vendorId as string);
  res.status(200).json({ status: 'success', data: ledger });
});

export const submitExpense = catchAsync(async (req: Request, res: Response) => {
  const data = await ExpenseService.submitExpense(req.body);
  res.status(201).json({ status: 'success', data });
});

export const createBankAccount = catchAsync(async (req: Request, res: Response) => {
  const data = await BankingService.createBankAccount(req.body);
  res.status(201).json({ status: 'success', data });
});

export const getBankAccounts = catchAsync(async (req: Request, res: Response) => {
  const data = await BankingService.getBankAccounts();
  res.status(200).json({ status: 'success', data });
});

export const getUnreconciled = catchAsync(async (req: Request, res: Response) => {
  const { bankAccountId } = req.params;
  const data = await ReconciliationService.getUnreconciledTransactions(bankAccountId as string);
  res.status(200).json({ status: 'success', data });
});

export const reconcileTransaction = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const { journalHeaderId } = req.body;
  const data = await ReconciliationService.reconcileTransaction(
    transactionId as string,
    journalHeaderId
  );
  res.status(200).json({ status: 'success', data });
});

export const getTaxRates = catchAsync(async (req: Request, res: Response) => {
  const data = await GSTService.getTaxRates();
  res.status(200).json({ status: 'success', data });
});

export const prepareGSTR3B = catchAsync(async (req: Request, res: Response) => {
  const { month, year } = req.body;
  const data = await GSTService.prepareGSTR3B(month, year);
  res.status(201).json({ status: 'success', data });
});

export const fileReturn = catchAsync(async (req: Request, res: Response) => {
  const { returnId } = req.params;
  const data = await GSTService.fileReturn(returnId as string);
  res.status(200).json({ status: 'success', data });
});

export const getProfitLoss = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const data = await ReportingService.getProfitLoss({
    startDate: startDate as string,
    endDate: endDate as string,
  });
  res.status(200).json({ status: 'success', data });
});

export const getBalanceSheet = catchAsync(async (req: Request, res: Response) => {
  const { asOfDate } = req.query;
  const data = await ReportingService.getBalanceSheet(asOfDate as string);
  res.status(200).json({ status: 'success', data });
});

export const closePeriod = catchAsync(async (req: Request, res: Response) => {
  const { periodId } = req.params;
  const userId = (req as any).user?.id || 'system';
  const data = await PeriodService.closePeriod(periodId as string, userId);
  res.status(200).json({ status: 'success', data });
});

export const getPeriods = catchAsync(async (req: Request, res: Response) => {
  const data = await PeriodService.getPeriods();
  res.status(200).json({ status: 'success', data });
});

export const getAccounts = catchAsync(async (req: Request, res: Response) => {
  const tenantId = (req as any).user?.tenant_id;
  const data = await AccountingRepository.getAccounts(tenantId);
  res.status(200).json({ status: 'success', data });
});

export const createAccount = catchAsync(async (req: Request, res: Response) => {
  const data = await AccountingRepository.createAccount(req.body);
  res.status(201).json({ status: 'success', data });
});

export const getAR = catchAsync(async (req: Request, res: Response) => {
  const data = await AccountingRepository.getARInvoices();
  res.status(200).json({ status: 'success', data });
});

export const recordARPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'admin';
  const data = await AccountingRepository.recordInvoicePayment(req.body, userId);
  res.status(200).json({ status: 'success', data });
});

export const getAP = catchAsync(async (req: Request, res: Response) => {
  const report = await APService.getAgingReport();
  res.status(200).json({ status: 'success', data: report });
});

export const getGSTOverview = catchAsync(async (req: Request, res: Response) => {
  const data = await AccountingService.getGSTReport();
  res.status(200).json({ status: 'success', data });
});
