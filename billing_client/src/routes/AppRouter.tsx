import { lazy, Suspense, type ReactElement } from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../login/Login';

const MainLayout = lazy(() => import('../main-layout/MainLayout'));
const AuthGuard = lazy(() => import('../auth-guard/AuthGuard'));
const SidebarProvider = lazy(() =>
  import('../context/SidebarContext').then((m) => ({ default: m.SidebarProvider }))
);
const BillingLayout = lazy(() => import('../billing/BillingLayout'));
const ModuleAccessGuard = lazy(() => import('../billing/components/ModuleAccessGuard'));
const DefaultAppRedirect = lazy(() =>
  import('../billing/components/ModuleAccessGuard').then((m) => ({ default: m.DefaultAppRedirect }))
);
const Dashboard = lazy(() => import('../billing/pages/Dashboard'));
const BillingPage = lazy(() => import('../billing/pages/BillingPage'));
const OrderListPage = lazy(() => import('../billing/pages/orders/OrderListPage'));
const PrintBill = lazy(() => import('../billing/pages/PrintBill'));
const CategoryPage = lazy(() => import('../billing/pages/master/CategoryPage'));
const BrandsPage = lazy(() => import('../billing/pages/master/BrandsPage'));
const ProductPage = lazy(() => import('../billing/pages/master/ProductPage'));
const ConfigMaterialPage = lazy(() => import('../billing/pages/master/ConfigMaterialPage'));
const ProductMasterPage = lazy(() => import('../billing/pages/master/ProductMasterPage'));
const StockPage = lazy(() => import('../billing/pages/master/StockPage'));
const CustomersPage = lazy(() => import('../billing/pages/master/CustomersPage'));
const CafeTablesPage = lazy(() => import('../billing/pages/master/CafeTablesPage'));
const UnitsPage = lazy(() => import('../billing/pages/master/UnitsPage'));
const BarcodePage = lazy(() => import('../billing/pages/master/BarcodePage'));
const SupplierPage = lazy(() => import('../billing/pages/inventory/SupplierPage'));
const PurchasePage = lazy(() => import('../billing/pages/inventory/PurchasePage'));
const PurchaseReturnPage = lazy(() => import('../billing/pages/inventory/PurchaseReturnPage'));
const PurchaseReportPage = lazy(() => import('../billing/pages/inventory/PurchaseReportPage'));
const PurchaseReturnReportPage = lazy(() => import('../billing/pages/inventory/PurchaseReturnReportPage'));
const SupplierPaymentReportPage = lazy(() => import('../billing/pages/inventory/SupplierPaymentReportPage'));
const CustomerBalancePage = lazy(() => import('../billing/pages/credit/CustomerBalancePage'));
const SupplierPaymentPage = lazy(() => import('../billing/pages/credit/SupplierPaymentPage'));
const CreateUserPage = lazy(() => import('../billing/pages/users/CreateUserPage'));
const ModulePermissionPage = lazy(() => import('../billing/pages/users/PermissionPage'));
const SpecialPermissionPage = lazy(() => import('../billing/pages/users/SpecialPermissionPage'));
const AttenderPage = lazy(() => import('../billing/pages/users/AttenderPage'));
const ChangePasswordPage = lazy(() => import('../billing/pages/users/ChangePasswordPage'));
const UserDiscountPage = lazy(() => import('../billing/pages/users/UserDiscountPage'));
const CompanyDetailsPage = lazy(() => import('../billing/pages/admin/CompanyDetailsPage'));
const EditBillPage = lazy(() => import('../billing/pages/admin/EditBillPage'));
const MonthlyBillsPage = lazy(() => import('../billing/pages/admin/MonthlyBillsPage'));
const EditLogPage = lazy(() => import('../billing/pages/admin/EditLogPage'));
const ChangePaymentTypePage = lazy(() => import('../billing/pages/admin/ChangePaymentTypePage'));
const ExchangePage = lazy(() => import('../billing/pages/admin/ExchangePage'));
const BillDateChangeReportPage = lazy(() => import('../billing/pages/admin/BillDateChangeReportPage'));
const CancelBillReportPage = lazy(() => import('../billing/pages/admin/CancelBillReportPage'));
const PaymentTypeChangeReportPage = lazy(() => import('../billing/pages/admin/PaymentTypeChangeReportPage'));
const ExchangeReportPage = lazy(() => import('../billing/pages/admin/ExchangeReportPage'));
const ExpenseTypePage = lazy(() => import('../billing/pages/expense/ExpenseTypePage'));
const ExpenseEntryPage = lazy(() => import('../billing/pages/expense/ExpenseEntryPage'));
const ExpenseReportPage = lazy(() => import('../billing/pages/expense/ExpenseReportPage'));
const ProfitAnalysisPage = lazy(() => import('../billing/pages/statistics/ProfitAnalysisPage'));
const StatsDashboardPage = lazy(() => import('../billing/pages/statistics/StatsDashboardPage'));
const CategorySalesPage = lazy(() => import('../billing/pages/statistics/CategorySalesPage'));
const ProductAnalysisPage = lazy(() => import('../billing/pages/statistics/ProductAnalysisPage'));
const BalanceSummaryPage = lazy(() => import('../billing/pages/statistics/BalanceSummaryPage'));
const CurrentStockPage = lazy(() => import('../billing/pages/stock-reports/CurrentStockPage'));
const ProductTransactionPage = lazy(() => import('../billing/pages/stock-reports/ProductTransactionPage'));
const StockAdjustmentReportPage = lazy(() => import('../billing/pages/stock-reports/StockAdjustmentReportPage'));
const SalesReportPage = lazy(() => import('../billing/pages/account-reports/SalesReportPage'));
const SalesByCategoryPage = lazy(() => import('../billing/pages/account-reports/SalesByCategoryPage'));
const SalesByDepartmentPage = lazy(() => import('../billing/pages/account-reports/SalesByDepartmentPage'));
const SalesByProductPage = lazy(() => import('../billing/pages/account-reports/SalesByProductPage'));
const SalesByCustomerPage = lazy(() => import('../billing/pages/account-reports/SalesByCustomerPage'));
const SalesByAttenderPage = lazy(() => import('../billing/pages/account-reports/SalesByAttenderPage'));
const DayAccountPage = lazy(() => import('../billing/pages/account-reports/DayAccountPage'));
const DayBookPage = lazy(() => import('../billing/pages/account-reports/DayBookPage'));
const CommissionReportPage = lazy(() => import('../billing/pages/account-reports/CommissionReportPage'));
const GstSalesSummaryPage = lazy(() => import('../billing/pages/account-reports/GstSalesSummaryPage'));
const GstBillWisePage = lazy(() => import('../billing/pages/account-reports/GstBillWisePage'));
const GstItemWisePage = lazy(() => import('../billing/pages/account-reports/GstItemWisePage'));
const GstHsnPage = lazy(() => import('../billing/pages/account-reports/GstHsnPage'));
const GstPurchasePage = lazy(() => import('../billing/pages/account-reports/GstPurchasePage'));
const GstPurchaseSummaryPage = lazy(() => import('../billing/pages/account-reports/GstPurchaseSummaryPage'));
const Gstr1Page = lazy(() => import('../billing/pages/account-reports/Gstr1Page'));

const guard = (element: ReactElement) => <AuthGuard component={element} />;

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            element={guard(
              <SidebarProvider>
                <MainLayout />
              </SidebarProvider>
            )}
          >
            <Route path="/app" element={<BillingLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users/change-password" element={<ChangePasswordPage />} />
              <Route element={<ModuleAccessGuard />}>
              <Route path="billing" element={<BillingPage />} />
              <Route path="billing/print/:billNo" element={<PrintBill />} />
              <Route path="order-list" element={<OrderListPage />} />
              <Route path="master/category" element={<CategoryPage />} />
              <Route path="master/brands" element={<BrandsPage />} />
              <Route path="master/product" element={<ProductPage />} />
              <Route path="master/config-material" element={<ConfigMaterialPage />} />
              <Route path="master/product-master" element={<ProductMasterPage />} />
              <Route path="master/stock" element={<StockPage />} />
              <Route path="master/customers" element={<CustomersPage />} />
              <Route path="master/cafe-tables" element={<CafeTablesPage />} />
              <Route path="master/units" element={<UnitsPage />} />
              <Route path="master/barcode" element={<BarcodePage />} />
              <Route path="inventory/supplier" element={<SupplierPage />} />
              <Route path="inventory/purchase" element={<PurchasePage />} />
              <Route path="inventory/purchase-return" element={<PurchaseReturnPage />} />
              <Route path="inventory/purchase-report" element={<PurchaseReportPage />} />
              <Route path="inventory/purchase-return-report" element={<PurchaseReturnReportPage />} />
              <Route path="inventory/supplier-payment-report" element={<SupplierPaymentReportPage />} />
              <Route path="statistics/profit-analysis" element={<ProfitAnalysisPage />} />
              <Route path="statistics/dashboard" element={<StatsDashboardPage />} />
              <Route path="statistics/category-sales" element={<CategorySalesPage />} />
              <Route path="statistics/product-analysis" element={<ProductAnalysisPage />} />
              <Route path="statistics/balance-summary" element={<BalanceSummaryPage />} />
              <Route path="stock-reports/current-stock" element={<CurrentStockPage />} />
              <Route path="stock-reports/product-transaction" element={<ProductTransactionPage />} />
              <Route path="stock-reports/stock-adjustment" element={<StockAdjustmentReportPage />} />
              <Route path="account-reports/sales" element={<SalesReportPage />} />
              <Route path="account-reports/sales-by-category" element={<SalesByCategoryPage />} />
              <Route path="account-reports/sales-by-department" element={<SalesByDepartmentPage />} />
              <Route path="account-reports/sales-by-item" element={<SalesByProductPage />} />
              <Route path="account-reports/sales-by-customer" element={<SalesByCustomerPage />} />
              <Route path="account-reports/sales-by-attender" element={<SalesByAttenderPage />} />
              <Route path="account-reports/day-account" element={<DayAccountPage />} />
              <Route path="account-reports/day-book" element={<DayBookPage />} />
              <Route path="account-reports/commission" element={<CommissionReportPage />} />
              <Route path="account-reports/gst-sales-summary" element={<GstSalesSummaryPage />} />
              <Route path="account-reports/gst-bill-wise" element={<GstBillWisePage />} />
              <Route path="account-reports/gst-item-wise" element={<GstItemWisePage />} />
              <Route path="account-reports/gst-hsn" element={<GstHsnPage />} />
              <Route path="account-reports/gst-purchase" element={<GstPurchasePage />} />
              <Route path="account-reports/gst-purchase-summary" element={<GstPurchaseSummaryPage />} />
              <Route path="account-reports/gstr1" element={<Gstr1Page />} />
              <Route path="credit/customer-balance" element={<CustomerBalancePage />} />
              <Route path="credit/supplier-payment" element={<SupplierPaymentPage />} />
              <Route path="users/create" element={<CreateUserPage />} />
              <Route path="users/permission" element={<ModulePermissionPage />} />
              <Route path="users/special-permission" element={<SpecialPermissionPage />} />
              <Route path="users/attender" element={<AttenderPage />} />
              <Route path="users/discount" element={<UserDiscountPage />} />
              <Route path="admin/company-details" element={<CompanyDetailsPage />} />
              <Route path="admin/edit-bill" element={<EditBillPage />} />
              <Route path="admin/monthly-bills" element={<MonthlyBillsPage />} />
              <Route path="admin/edit-log" element={<EditLogPage />} />
              <Route path="admin/change-payment-type" element={<ChangePaymentTypePage />} />
              <Route path="admin/exchange" element={<ExchangePage />} />
              <Route path="admin/bill-date-change-report" element={<BillDateChangeReportPage />} />
              <Route path="admin/cancel-bill-report" element={<CancelBillReportPage />} />
              <Route path="admin/payment-type-change-report" element={<PaymentTypeChangeReportPage />} />
              <Route path="admin/exchange-report" element={<ExchangeReportPage />} />
              <Route path="expense/type" element={<ExpenseTypePage />} />
              <Route path="expense/entry" element={<ExpenseEntryPage />} />
              <Route path="expense/report" element={<ExpenseReportPage />} />
              </Route>
              <Route index element={<DefaultAppRedirect />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
