import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PortalPage from './pages/PortalPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ManagerLoginPage from './pages/ManagerLoginPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import CashierDashboardPage from './pages/CashierDashboardPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import ManageEmployeesPage from './pages/ManageEmployeesPage';
import ManageMenuPage from './pages/ManageMenuPage';
import InventoryPage from './pages/InventoryPage';
import IngredientEditorPage from './pages/IngredientEditorPage';
import SalesAndTrendsPage from './pages/SalesAndTrendsPage';
import SalesReportPage from './pages/SalesReportPage';
import XReportPage from './pages/XReportPage';
import ZReportPage from './pages/ZReportPage';
import RestockReportPage from './pages/RestockReportPage';
import MenuBoardPage from './pages/MenuBoardPage';
import CustomerPage from './pages/CustomerPage';
import CustomerCheckoutPage from './pages/CustomerCheckoutPage';
import KitchenDashboardPage from './pages/KitchenDashboardPage';
import Translator from './components/Translator';
import CustomizePage from './pages/CustomizePage';
import HappyHourAndManageMenuPage from './pages/HappyHourAndManageMenuPage';
import HappyHourPage from './pages/HappyHourPage';


export default function App() {
  const location = useLocation();

  const hideTranslator =
    location.pathname === '/menu-board';

  return (
    <>
      {!hideTranslator && <Translator />}

      <Routes>
        <Route path="/home" element={<PortalPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/cashier-login" element={<LoginPage />} />
        <Route path="/kitchen" element={<KitchenDashboardPage />} />
        <Route path="/manager-login" element={<ManagerLoginPage />} />
        <Route path="/menu-board" element={<MenuBoardPage />} />

        <Route
          path="/manager"
          element={<ProtectedRoute roles={['manager']}><ManagerDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/employees"
          element={<ProtectedRoute roles={['manager']}><ManageEmployeesPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/menu"
          element={<ProtectedRoute roles={['manager']}><HappyHourAndManageMenuPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/menu/menu"
          element={<ProtectedRoute roles={['manager']}><ManageMenuPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/menu//menu:itemName/ingredients"
          element={<ProtectedRoute roles={['manager']}><IngredientEditorPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/menu/happyhour"
          element={<ProtectedRoute roles={['manager']}><HappyHourPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/inventory"
          element={<ProtectedRoute roles={['manager']}><InventoryPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/reports"
          element={<ProtectedRoute roles={['manager']}><SalesAndTrendsPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/reports/sales"
          element={<ProtectedRoute roles={['manager']}><SalesReportPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/reports/x"
          element={<ProtectedRoute roles={['manager']}><XReportPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/reports/z"
          element={<ProtectedRoute roles={['manager']}><ZReportPage /></ProtectedRoute>}
        />
        <Route
          path="/manager/reports/restock"
          element={<ProtectedRoute roles={['manager']}><RestockReportPage /></ProtectedRoute>}
        />

        <Route
          path="/cashier"
          element={<ProtectedRoute><CashierDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/cashier/menu"
          element={<ProtectedRoute><MenuPage /></ProtectedRoute>}
        />
        <Route
          path="/cashier/checkout"
          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
        />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/customer/checkout" element={<CustomerCheckoutPage />} />

        <Route path="/customize/:name" element={<CustomizePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} /> 
      </Routes>
    </>
  );
}