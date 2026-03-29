import { Navigate, Route, Routes } from 'react-router-dom';
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

export default function App() {
  return (
    <Routes>
      <Route path="/home" element={<PortalPage />} />
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/manager-login" element={<ManagerLoginPage />} />

      <Route
        path="/manager"
        element={<ProtectedRoute role="manager"><ManagerDashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/employees"
        element={<ProtectedRoute role="manager"><ManageEmployeesPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/menu"
        element={<ProtectedRoute role="manager"><ManageMenuPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/menu/:itemName/ingredients"
        element={<ProtectedRoute role="manager"><IngredientEditorPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/inventory"
        element={<ProtectedRoute role="manager"><InventoryPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/reports"
        element={<ProtectedRoute role="manager"><SalesAndTrendsPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/reports/sales"
        element={<ProtectedRoute role="manager"><SalesReportPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/reports/x"
        element={<ProtectedRoute role="manager"><XReportPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/reports/z"
        element={<ProtectedRoute role="manager"><ZReportPage /></ProtectedRoute>}
      />
      <Route
        path="/manager/reports/restock"
        element={<ProtectedRoute role="manager"><RestockReportPage /></ProtectedRoute>}
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

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}


/*
------------------------------------- BELOW THIS LINE IS TO DEBUG A SINGLE FILE/PAGE -------------------------------------
simply change the import(s) w the file(s) name and path as well as the return in the App() and comment the code above this line
*/

// import { Navigate, Route, Routes } from 'react-router-dom';

// /* ----- These are the file(s) you want to test ----- */
// import PortalPage from './pages/PortalPage';
// import ProtectedRoute from './components/ProtectedRoute';
// import ManagerLoginPage from './pages/ManagerLoginPage';
// import ManagerDashboardPage from './pages/ManagerDashboardPage';

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/home" element={<PortalPage />} />
//       <Route path="/" element={<Navigate to="/home" replace />} />

//       <Route path="/login" element={<ManagerLoginPage />} />

//       <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerDashboardPage/></ProtectedRoute>} />
//     </Routes>
//   );
// }