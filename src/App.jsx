import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RevenueStats from './pages/RevenueStats';
import AdminProductManager from './pages/AdminProductManager';
import ProtectedRoute from './components/common/ProtectedRoute';

import FloatingContact from './components/common/FloatingContact';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/success" element={<OrderSuccess />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute><RevenueStats /></ProtectedRoute>} />
            <Route path="/admin/stats" element={<ProtectedRoute><RevenueStats /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProductManager /></ProtectedRoute>} />
          </Routes>
          <FloatingContact />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
