import { Router } from 'express';

import { authenticate, requireAdmin } from '../../middlewares/auth.js';

import * as accountingController from './accounting.controller.js';

const router = Router();

// Protect all accounting routes
router.use(authenticate);
router.use(requireAdmin);

router.post('/invoices', accountingController.createInvoice);
router.get('/invoices', accountingController.getInvoices);
router.get('/invoices/:id', accountingController.getInvoiceById);

router.post('/journal', accountingController.createJournalEntry);
router.get('/journal', accountingController.getJournalEntries);

router.get('/profit-loss', accountingController.getProfitLoss);
router.get('/balance-sheet', accountingController.getBalanceSheet);

router.post('/periods/:periodId/close', accountingController.closePeriod);
router.get('/periods', accountingController.getPeriods);
router.get('/ledger', accountingController.getAccountLedger);
router.get('/trial-balance', accountingController.getTrialBalance);

router.get('/ar/aging', accountingController.getARAging);
router.get('/ar/customer-ledger/:customerId', accountingController.getCustomerLedger);

router.get('/ap/aging', accountingController.getAPAging);
router.get('/ap/vendor-ledger/:vendorId', accountingController.getVendorLedger);

router.post('/expenses', accountingController.submitExpense);

router.post('/banking/accounts', accountingController.createBankAccount);
router.get('/banking/accounts', accountingController.getBankAccounts);
router.get('/banking/reconcile/:bankAccountId', accountingController.getUnreconciled);
router.post('/banking/reconcile/:transactionId', accountingController.reconcileTransaction);

router.get('/gst/rates', accountingController.getTaxRates);
router.get('/gst', accountingController.getGSTOverview);
router.post('/gst/returns/gstr3b', accountingController.prepareGSTR3B);
router.post('/gst/returns/:returnId/file', accountingController.fileReturn);

router.get('/accounts', accountingController.getAccounts);
router.post('/accounts', accountingController.createAccount);

router.get('/ar', accountingController.getAR);
router.post('/ar/record-payment', accountingController.recordARPayment);
router.get('/ap', accountingController.getAP);

export const accountingRoutes = router;
