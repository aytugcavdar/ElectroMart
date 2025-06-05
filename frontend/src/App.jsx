
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Navbar from './layout/Navbar'
import Home from './pages/Home'
import Auth from './pages/Auth' 
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import PasswordReset from "./components/PasswordReset";
import { getUserProfile } from './redux/authSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Admin from './pages/Admin';
import Brand from './pages/Brand';
import BrandDetails from './pages/BrandDetail'; 
import ProductDetail from './pages/ProductDetail';
import Category from './pages/Category';
import CategoryProductsPage from './pages/CategoryProductsPage';
import Products from './pages/Products';
import Profile from './pages/Profile';
import CartPage from './pages/CartPages'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const noNavbarRoutes = ['/auth', '/verify-email', '/reset-password', '/resetpassword'];

  const shouldHideNavbar = noNavbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {!shouldHideNavbar && <Navbar />} 
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/resetpassword/:token" element={<PasswordReset />} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/brands' element={<Brand />} />
        <Route path='/brands/:id' element={<BrandDetails />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='/products' element={<Products />} />
        <Route path='/categories' element={<Category />} />
        <Route path='/category/:id' element={<CategoryProductsPage />} />
        <Route path='/me' element={<Profile />} />
        <Route path='/cart' element={<CartPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;