import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { FaShoppingCart, FaSearch, FaBars } from "react-icons/fa";
import { HiX } from "react-icons/hi";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  console.log(isAuthenticated, user);
  const { cartItems } = useSelector((state) => state.cart) || { cartItems: [] };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  // Navigation links for desktop and mobile menus
  const navLinks = [
    { title: "Ana Sayfa", path: "/" },
    { title: "Ürünler", path: "/products" },
    { title: "Kategoriler", path: "/categories" },
    { title: "Markalar", path: "/brands" },
    { title: "Hakkımızda", path: "/about" },
    { title: "İletişim", path: "/contact" }
  ];

  return (
    <>
      <div className={`sticky top-0 z-30 w-full transition-all duration-300 ${isScrolled ? "bg-base-100 shadow-md" : "bg-base-100"}`}>
       
        
        {/* Main Navbar */}
        <div className="navbar container mx-auto px-4 h-16">
          {/* Mobile menu button and logo */}
          <div className="navbar-start">
            <button 
              className="lg:hidden btn btn-ghost btn-circle"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <Link to="/" className="flex items-center">
              <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ElectroMart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-1">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`rounded-lg font-medium transition-colors ${location.pathname === link.path ? 'bg-base-200 text-primary' : 'hover:bg-base-200'}`}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right section - Search, Cart, User */}
          <div className="navbar-end">
            {/* Search button (opens drawer on mobile) */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <FaSearch className="h-5 w-5" />
              </div>
              <div tabIndex={0} className="dropdown-content z-[999] menu p-2 shadow bg-base-100 rounded-box w-72">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary ml-2">
                    <FaSearch />
                  </button>
                </form>
              </div>
            </div>

            {/* Shopping Cart */}
            <Link to="/cart" className="btn btn-ghost btn-circle ml-1">
              <div className="indicator">
                <FaShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="badge badge-sm indicator-item badge-primary">{cartItems.length}</span>
                )}
              </div>
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <div className="dropdown dropdown-end ml-1">
                <div 
                  tabIndex={0} 
                  role="button" 
                  onClick={toggleProfileMenu}
                  className="btn btn-ghost btn-circle avatar"
                >
                  {user.avatar ? (
                    <div className="w-10 rounded-full">
                      <img 
                        src={user.avatar.url} 
                        alt={user.name}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-10">
                        <span className="text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <ul tabIndex={0} className="dropdown-content z-[999] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                  <li className="menu-title pt-2">
                    <span className="text-sm font-semibold">Merhaba, {user.name}</span>
                  </li>
                  <div className="divider my-0"></div>
                  <li><Link to="/me" className="text-base-content hover:text-primary">Profilim</Link></li>
                  <li><Link to="/orders" className="text-base-content hover:text-primary">Siparişlerim</Link></li>
                  <li><Link to="/wishlist" className="text-base-content hover:text-primary">Favorilerim</Link></li>
                  {user.role === "admin" && (
                    <li><Link to="/admin" className="text-secondary hover:bg-secondary/10">Admin Paneli</Link></li>
                  )}
                  <div className="divider my-0"></div>
                  <li><button onClick={handleLogout} className="text-error">Çıkış Yap</button></li>
                </ul>
              </div>
            ) : (
              <div className="flex gap-2 ml-2">
                <Link to="/auth" className="btn btn-ghost btn-sm">Giriş</Link>
                <Link to="/auth?type=register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`drawer-side z-40 ${isMobileMenuOpen ? 'drawer-open' : ''}`}>
        <label 
          htmlFor="my-drawer" 
          aria-label="close sidebar" 
          className={`drawer-overlay ${isMobileMenuOpen ? 'fixed inset-0 bg-black bg-opacity-50' : 'hidden'}`}
          onClick={toggleMobileMenu}
        ></label>
        <div className={`menu p-4 w-72 min-h-full bg-base-100 text-base-content shadow-xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0`}>
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <Link 
              to="/" 
              className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              onClick={toggleMobileMenu}
            >
              ElectroMart
            </Link>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={toggleMobileMenu}
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          {/* Search bar for mobile */}
          <form onSubmit={handleSearch} className="flex mb-4">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary ml-2">
              <FaSearch />
            </button>
          </form>

          {/* Mobile navigation links */}
          <ul className="menu menu-lg w-full">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  onClick={toggleMobileMenu}
                  className={location.pathname === link.path ? 'active font-medium' : ''}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Account section for mobile */}
          {isAuthenticated && user ? (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                {user.avatar ? (
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-12">
                      <span className="text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-base-content/70">{user.email}</p>
                </div>
              </div>
              
              <ul className="menu w-full p-0">
                <li><Link to="/profile" onClick={toggleMobileMenu}>Profilim</Link></li>
                <li><Link to="/orders" onClick={toggleMobileMenu}>Siparişlerim</Link></li>
                <li><Link to="/wishlist" onClick={toggleMobileMenu}>Favorilerim</Link></li>
                {user.role === "admin" && (
                  <li><Link to="/admin" onClick={toggleMobileMenu} className="text-secondary">Admin Paneli</Link></li>
                )}
                <div className="divider my-2"></div>
                <li>
                  <button 
                    onClick={() => { handleLogout(); toggleMobileMenu(); }}
                    className="text-error"
                  >
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t flex flex-col gap-3">
              <Link 
                to="/auth" 
                className="btn btn-outline w-full" 
                onClick={toggleMobileMenu}
              >
                Giriş Yap
              </Link>
              <Link 
                to="/auth?type=register" 
                className="btn btn-primary w-full" 
                onClick={toggleMobileMenu}
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;