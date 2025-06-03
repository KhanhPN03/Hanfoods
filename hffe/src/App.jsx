import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerRouter from './navigation/CustomerRouter';
import AdminRoutes from './page/admin/AdminRoutes';
import GlobalContextProvider from './context/GlobalContextProvider';
import ApiStatusMonitor from './page/customer/customerComponent/ApiStatusMonitor';
import './page/customer/css/customerPage.css';
import './page/customer/css/ScrollbarFix.css';
import 'react-toastify/dist/ReactToastify.css';
import './page/customer/css/ToastStyles.css';

function App() {
  return (
    <Router>
      <GlobalContextProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* Customer Routes */}
          <Route path="/*" element={<CustomerRouter />} />
        </Routes>
        <ApiStatusMonitor />
      </GlobalContextProvider>
    </Router>
  );
}

export default App;