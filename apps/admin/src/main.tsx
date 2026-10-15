import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@byteevolvr/store';
import { Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './contexts/ThemeContext';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppErrorBoundary } from './components/AppErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
    },
  },
});

import './index.css';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const ProductManagementPage = lazy(() =>
  import('./pages/ProductManagementPage').then((m) => ({ default: m.ProductManagementPage }))
);
const ProductFormPage = lazy(() =>
  import('./pages/ProductFormPage').then((m) => ({ default: m.ProductFormPage }))
);
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const OrderManagementPage = lazy(() =>
  import('./pages/OrderManagementPage').then((m) => ({ default: m.OrderManagementPage }))
);
const OrderDetailPage = lazy(() =>
  import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage }))
);
const ReturnsPage = lazy(() =>
  import('./pages/ReturnsPage').then((m) => ({ default: m.ReturnsPage }))
);
const WarehousePage = lazy(() =>
  import('./pages/WarehousePage').then((m) => ({ default: m.WarehousePage }))
);
const CustomersPage = lazy(() =>
  import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
const CustomerDetailPage = lazy(() =>
  import('./pages/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage }))
);
const Customer360ProfilePage = lazy(() =>
  import('./pages/customers/Customer360ProfilePage').then((m) => ({
    default: m.Customer360ProfilePage,
  }))
);
const CRMDashboardPage = lazy(() =>
  import('./pages/crm/CRMDashboardPage').then((m) => ({ default: m.CRMDashboardPage }))
);
const LeadsPage = lazy(() =>
  import('./pages/crm/LeadsPage').then((m) => ({ default: m.LeadsPage }))
);
const OpportunityPipelinePage = lazy(() =>
  import('./pages/crm/OpportunityPipelinePage').then((m) => ({
    default: m.OpportunityPipelinePage,
  }))
);
const SalesForecastingPage = lazy(() =>
  import('./pages/crm/SalesForecastingPage').then((m) => ({ default: m.SalesForecastingPage }))
);
const CRMSettingsPage = lazy(() =>
  import('./pages/crm/CRMSettingsPage').then((m) => ({ default: m.CRMSettingsPage }))
);
const ApprovalInboxPage = lazy(() =>
  import('./pages/approvals/ApprovalInboxPage').then((m) => ({ default: m.ApprovalInboxPage }))
);
const ApprovalTemplatesPage = lazy(() =>
  import('./pages/approvals/ApprovalTemplatesPage').then((m) => ({
    default: m.ApprovalTemplatesPage,
  }))
);
const DocumentCenterPage = lazy(() =>
  import('./pages/documents/DocumentCenterPage').then((m) => ({ default: m.DocumentCenterPage }))
);
const WorkflowBuilderPage = lazy(() =>
  import('./pages/workflows/WorkflowBuilderPage').then((m) => ({ default: m.WorkflowBuilderPage }))
);
const SLADashboardPage = lazy(() =>
  import('./pages/sla/SLADashboardPage').then((m) => ({ default: m.SLADashboardPage }))
);
const OperationsDashboardPage = lazy(() =>
  import('./pages/operations/OperationsDashboardPage').then((m) => ({
    default: m.OperationsDashboardPage,
  }))
);
const InventoryDashboardPage = lazy(() =>
  import('./pages/operations/InventoryDashboardPage').then((m) => ({
    default: m.InventoryDashboardPage,
  }))
);
const StockTransfersPage = lazy(() =>
  import('./pages/operations/StockTransfersPage').then((m) => ({ default: m.StockTransfersPage }))
);
const PurchaseRequestsPage = lazy(() =>
  import('./pages/operations/PurchaseRequestsPage').then((m) => ({
    default: m.PurchaseRequestsPage,
  }))
);
const PurchaseOrdersPage = lazy(() =>
  import('./pages/operations/PurchaseOrdersPage').then((m) => ({ default: m.PurchaseOrdersPage }))
);
const VendorBillsPage = lazy(() =>
  import('./pages/operations/VendorBillsPage').then((m) => ({ default: m.VendorBillsPage }))
);
const ShippingDashboardPage = lazy(() =>
  import('./pages/operations/ShippingDashboardPage').then((m) => ({
    default: m.ShippingDashboardPage,
  }))
);
const ShippingZonesPage = lazy(() =>
  import('./pages/operations/ShippingZonesPage').then((m) => ({ default: m.ShippingZonesPage }))
);
const ShipmentTrackingPage = lazy(() =>
  import('./pages/operations/ShipmentTrackingPage').then((m) => ({
    default: m.ShipmentTrackingPage,
  }))
);
const KnowledgeBasePage = lazy(() =>
  import('./pages/support/KnowledgeBasePage').then((m) => ({ default: m.KnowledgeBasePage }))
);
const AudienceSegmentsPage = lazy(() =>
  import('./pages/marketing/AudienceSegmentsPage').then((m) => ({
    default: m.AudienceSegmentsPage,
  }))
);
const CampaignBuilderPage = lazy(() =>
  import('./pages/marketing/CampaignBuilderPage').then((m) => ({ default: m.CampaignBuilderPage }))
);
const MarketingDashboardPage = lazy(() =>
  import('./pages/marketing/MarketingDashboardPage').then((m) => ({
    default: m.MarketingDashboardPage,
  }))
);
const ReviewsPage = lazy(() =>
  import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage }))
);

const DiscountsPage = lazy(() =>
  import('./pages/DiscountsPage').then((m) => ({ default: m.DiscountsPage }))
);
const CMSBuilderPage = lazy(() =>
  import('./pages/CMSBuilderPage').then((m) => ({ default: m.CMSBuilderPage }))
);
const InvoiceTemplatePage = lazy(() =>
  import('./pages/InvoiceTemplatePage').then((m) => ({ default: m.InvoiceTemplatePage }))
);
const SuppliersPage = lazy(() =>
  import('./pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage }))
);
const SupplierProfilePage = lazy(() =>
  import('./pages/SupplierProfilePage').then((m) => ({ default: m.SupplierProfilePage }))
);
const MultiStorePage = lazy(() =>
  import('./pages/MultiStorePage').then((m) => ({ default: m.MultiStorePage }))
);
const POSPage = lazy(() => import('./pages/POSPage').then((m) => ({ default: m.POSPage })));
const TaxCompliancePage = lazy(() =>
  import('./pages/TaxCompliancePage').then((m) => ({ default: m.TaxCompliancePage }))
);
const ActivityLogPage = lazy(() =>
  import('./pages/ActivityLogPage').then((m) => ({ default: m.ActivityLogPage }))
);
const DevelopersPage = lazy(() =>
  import('./pages/DevelopersPage').then((m) => ({ default: m.DevelopersPage }))
);
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));

const AccountingDashboard = lazy(() =>
  import('./pages/accounting/AccountingDashboard').then((m) => ({ default: m.AccountingDashboard }))
);
const ChartOfAccountsPage = lazy(() =>
  import('./pages/accounting/ChartOfAccountsPage').then((m) => ({ default: m.ChartOfAccountsPage }))
);
const InvoicesPage = lazy(() =>
  import('./pages/accounting/InvoicesPage').then((m) => ({ default: m.InvoicesPage }))
);
const JournalEntriesPage = lazy(() =>
  import('./pages/accounting/JournalEntriesPage').then((m) => ({ default: m.JournalEntriesPage }))
);
const JournalVoucherPage = lazy(() =>
  import('./pages/accounting/JournalVoucherPage').then((m) => ({ default: m.JournalVoucherPage }))
);
const ProfitLossPage = lazy(() =>
  import('./pages/accounting/ProfitLossPage').then((m) => ({ default: m.ProfitLossPage }))
);
const BalanceSheetPage = lazy(() =>
  import('./pages/accounting/BalanceSheetPage').then((m) => ({ default: m.BalanceSheetPage }))
);
const BankingReconciliationPage = lazy(() =>
  import('./pages/accounting/BankingReconciliationPage').then((m) => ({
    default: m.BankingReconciliationPage,
  }))
);
const BankAccountsPage = lazy(() =>
  import('./pages/accounting/BankAccountsPage').then((m) => ({ default: m.BankAccountsPage }))
);
const FinancialYearPage = lazy(() =>
  import('./pages/accounting/FinancialYearPage').then((m) => ({ default: m.FinancialYearPage }))
);
const AccountsReceivablePage = lazy(() =>
  import('./pages/accounting/AccountsReceivablePage').then((m) => ({
    default: m.AccountsReceivablePage,
  }))
);
const AccountsPayablePage = lazy(() =>
  import('./pages/accounting/AccountsPayablePage').then((m) => ({ default: m.AccountsPayablePage }))
);
const BudgetsPage = lazy(() =>
  import('./pages/accounting/BudgetsPage').then((m) => ({ default: m.BudgetsPage }))
);
const TrialBalancePage = lazy(() =>
  import('./pages/accounting/TrialBalancePage').then((m) => ({ default: m.TrialBalancePage }))
);
const CashFlowPage = lazy(() =>
  import('./pages/accounting/CashFlowPage').then((m) => ({ default: m.CashFlowPage }))
);
const AccountingSettingsPage = lazy(() =>
  import('./pages/accounting/AccountingSettingsPage').then((m) => ({
    default: m.AccountingSettingsPage,
  }))
);
const CostCentersPage = lazy(() =>
  import('./pages/accounting/CostCentersPage').then((m) => ({ default: m.CostCentersPage }))
);
const ProfitCentersPage = lazy(() =>
  import('./pages/accounting/ProfitCentersPage').then((m) => ({ default: m.ProfitCentersPage }))
);
const GSTFilingPage = lazy(() =>
  import('./pages/accounting/GSTFilingPage').then((m) => ({ default: m.GSTFilingPage }))
);
const SupportPage = lazy(() =>
  import('./pages/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const WhatsAppDashboard = lazy(() =>
  import('./modules/whatsapp/WhatsAppDashboard').then((m) => ({ default: m.WhatsAppDashboard }))
);
const WhatsAppCampaigns = lazy(() =>
  import('./modules/whatsapp/WhatsAppCampaigns').then((m) => ({ default: m.WhatsAppCampaigns }))
);
const WhatsAppTasks = lazy(() =>
  import('./modules/whatsapp/WhatsAppTasks').then((m) => ({ default: m.WhatsAppTasks }))
);
const WhatsAppTemplates = lazy(() =>
  import('./modules/whatsapp/WhatsAppTemplates').then((m) => ({ default: m.WhatsAppTemplates }))
);

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-on-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Main = () => {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/pos" element={<POSPage />} />
                  <Route path="/products" element={<ProductManagementPage />} />
                  <Route path="/products/new" element={<ProductFormPage />} />
                  <Route path="/products/:id/edit" element={<ProductFormPage />} />
                  <Route path="/inventory">
                    <Route index element={<InventoryPage />} />
                    <Route path="dashboard" element={<InventoryDashboardPage />} />
                    <Route path="transfers" element={<StockTransfersPage />} />
                  </Route>
                  <Route path="/orders" element={<OrderManagementPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />
                  <Route path="/shipping">
                    <Route path="dashboard" element={<ShippingDashboardPage />} />
                    <Route path="zones" element={<ShippingZonesPage />} />
                    <Route path="tracking" element={<ShipmentTrackingPage />} />
                  </Route>
                  <Route path="/warehouse" element={<WarehousePage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />
                  <Route path="/customers/:id/360" element={<Customer360ProfilePage />} />
                  <Route path="/crm">
                    <Route index element={<CRMDashboardPage />} />
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="pipeline" element={<OpportunityPipelinePage />} />
                    <Route path="forecasting" element={<SalesForecastingPage />} />
                    <Route path="settings" element={<CRMSettingsPage />} />
                  </Route>
                  <Route path="/approvals" element={<ApprovalInboxPage />} />
                  <Route path="/approvals/templates" element={<ApprovalTemplatesPage />} />
                  <Route path="/documents" element={<DocumentCenterPage />} />
                  <Route path="/workflows" element={<WorkflowBuilderPage />} />
                  <Route path="/sla" element={<SLADashboardPage />} />
                  <Route path="/operations">
                    <Route index element={<OperationsDashboardPage />} />
                    <Route path="transfers" element={<StockTransfersPage />} />
                    <Route path="stock-transfers" element={<StockTransfersPage />} />
                    <Route path="shipping" element={<ShippingDashboardPage />} />
                    <Route path="zones" element={<ShippingZonesPage />} />
                  </Route>
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/marketing">
                    <Route index element={<MarketingDashboardPage />} />
                    <Route path="segments" element={<AudienceSegmentsPage />} />
                    <Route path="builder" element={<CampaignBuilderPage />} />
                  </Route>
                  <Route path="/discounts" element={<DiscountsPage />} />
                  <Route path="/cms" element={<CMSBuilderPage />} />
                  <Route path="/invoice-template" element={<InvoiceTemplatePage />} />
                  <Route path="/procurement">
                    <Route path="requests" element={<PurchaseRequestsPage />} />
                    <Route path="orders" element={<PurchaseOrdersPage />} />
                    <Route path="bills" element={<VendorBillsPage />} />
                  </Route>
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/suppliers/:id" element={<SupplierProfilePage />} />
                  <Route path="/stores" element={<MultiStorePage />} />
                  <Route path="/tax-compliance" element={<TaxCompliancePage />} />
                  <Route path="/activity-log" element={<ActivityLogPage />} />
                  <Route path="/developers" element={<DevelopersPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/accounting">
                    <Route index element={<AccountingDashboard />} />
                    <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
                    <Route path="invoices" element={<InvoicesPage />} />
                    <Route path="journal" element={<JournalEntriesPage />} />
                    <Route path="journal/new" element={<JournalVoucherPage />} />
                    <Route path="profit-loss" element={<ProfitLossPage />} />
                    <Route path="balance-sheet" element={<BalanceSheetPage />} />
                    <Route path="trial-balance" element={<TrialBalancePage />} />
                    <Route path="cash-flow" element={<CashFlowPage />} />
                    <Route path="financial-year" element={<FinancialYearPage />} />
                    <Route path="receivables" element={<AccountsReceivablePage />} />
                    <Route path="payables" element={<AccountsPayablePage />} />
                    <Route path="budgets" element={<BudgetsPage />} />
                    <Route path="cost-centers" element={<CostCentersPage />} />
                    <Route path="profit-centers" element={<ProfitCentersPage />} />
                    <Route path="bank-accounts" element={<BankAccountsPage />} />
                    <Route path="banking-reconciliation" element={<BankingReconciliationPage />} />
                    <Route path="gst" element={<GSTFilingPage />} />
                    <Route path="settings" element={<AccountingSettingsPage />} />
                  </Route>
                  <Route path="/support">
                    <Route index element={<SupportPage />} />
                    <Route path="knowledge-base" element={<KnowledgeBasePage />} />
                  </Route>
                  <Route path="/whatsapp" element={<WhatsAppDashboard />} />
                  <Route path="/whatsapp/campaigns" element={<WhatsAppCampaigns />} />
                  <Route path="/whatsapp/tasks" element={<WhatsAppTasks />} />
                  <Route path="/whatsapp/templates" element={<WhatsAppTemplates />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
