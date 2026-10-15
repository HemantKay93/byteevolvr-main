import { apiClient } from '../apiClient';

export const AccountingService = {
  // Chart of Accounts
  getAccounts: async () => {
    const response = await apiClient.get('/accounting/accounts');
    return response.data;
  },

  createAccount: async (accountData: any) => {
    const response = await apiClient.post('/accounting/accounts', accountData);
    return response.data;
  },

  // Journal Entries
  getJournalEntries: async (accountType?: string) => {
    const url = accountType
      ? `/accounting/journal?account_type=${accountType}`
      : '/accounting/journal';
    const response = await apiClient.get(url);
    return response.data;
  },

  createJournalEntry: async (header: any, lines: any[]) => {
    const response = await apiClient.post('/accounting/journal', { header, lines });
    return response.data;
  },

  // AR / AP
  getAR: async () => {
    const response = await apiClient.get('/accounting/ar');
    return response.data;
  },

  recordARPayment: async (paymentData: any) => {
    const response = await apiClient.post('/accounting/ar/record-payment', paymentData);
    return response.data;
  },

  getAP: async () => {
    const response = await apiClient.get('/accounting/ap');
    return response.data;
  },

  // GST
  getGSTFilings: async () => {
    const response = await apiClient.get('/accounting/gst');
    return response.data;
  },

  // Financial Reports
  getProfitLoss: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/accounting/profit-loss?${params.toString()}`);
    return response.data;
  },

  getBalanceSheet: async (asOfDate?: string) => {
    const url = asOfDate
      ? `/accounting/balance-sheet?asOfDate=${asOfDate}`
      : '/accounting/balance-sheet';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Banking & Reconciliation
  getBankAccounts: async () => {
    const response = await apiClient.get('/accounting/banking/accounts');
    return response.data;
  },

  createBankAccount: async (bankAccountData: any) => {
    const response = await apiClient.post('/accounting/banking/accounts', bankAccountData);
    return response.data;
  },

  getUnreconciledTransactions: async (bankAccountId: string) => {
    const response = await apiClient.get(`/accounting/banking/reconcile/${bankAccountId}`);
    return response.data;
  },

  reconcileTransaction: async (transactionId: string, journalHeaderId: string) => {
    const response = await apiClient.post(`/accounting/banking/reconcile/${transactionId}`, {
      journalHeaderId,
    });
    return response.data;
  },

  // Financial Periods
  getPeriods: async () => {
    const response = await apiClient.get('/accounting/periods');
    return response.data;
  },

  closePeriod: async (periodId: string) => {
    const response = await apiClient.post(`/accounting/periods/${periodId}/close`);
    return response.data;
  },

  getFinancialHealthTracker: async () => {
    const response = await apiClient.get('/accounting/health-tracker');
    return response.data;
  },
};
