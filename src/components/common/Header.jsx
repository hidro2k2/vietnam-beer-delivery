import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, ShoppingBag, User, Menu, X, ShoppingCart, History } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import '../../styles/header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { getTotalItems } = useCart();
    const totalItems = getTotalItems();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const scrollToCart = (e) => {
        e.preventDefault();
        const cartElement = document.getElementById('cart-summary');
        if (cartElement) {
            cartElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/#cart-summary';
        }
    };

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo-section">
                    <div className="logo-icon">
                        <span style={{ fontSize: '2rem' }}>🍺</span>
                    </div>
                    <div className="brand-name">
                        <h1 className="brand-title">CỬA HÀNG TẠP HÓA</h1>
                        <p className="brand-subtitle">ĐẠI LÝ BIA HÒA - TẾT 2026</p>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <nav className="nav-menu desktop-menu">
                    <Link to="/" className="nav-link">Đặt hàng</Link>
                    <Link to="/track-order" className="nav-link">Tra cứu đơn hàng</Link>
                    <Link to="/order-history" className="nav-link">Lịch sử</Link>
                    <Link to="/contact" className="nav-link">Liên hệ</Link>
                    <Link to="/admin" className="nav-link admin-link">
                        <User size={16} />
                        Đăng nhập admin
                    </Link>

                    <a href="#cart-summary" onClick={scrollToCart} className="nav-link cart-icon-link" id="cart-icon-container">
                        <div className="cart-icon-wrapper" style={{ position: 'relative' }}>
                            <ShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="cart-badge" style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: '#d32f2f',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                }}>
                                    {totalItems}
                                </span>
                            )}
                        </div>
                    </a>
                </nav>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <nav className="mobile-nav">
                        <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Đặt hàng</Link>
                        <Link to="/track-order" className="mobile-nav-link" onClick={toggleMenu}>Tra cứu đơn hàng</Link>
                        <Link to="/order-history" className="mobile-nav-link" onClick={toggleMenu}>Lịch sử đơn hàng</Link>
                        <Link to="/contact" className="mobile-nav-link" onClick={toggleMenu}>Liên hệ</Link>
                        <Link to="/admin" className="mobile-nav-link admin-link-mobile" onClick={toggleMenu}>
                            <User size={16} style={{ marginRight: 8 }} />
                            Đăng nhập admin
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
