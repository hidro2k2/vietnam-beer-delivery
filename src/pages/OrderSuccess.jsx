import React, { useState } from 'react';
import { useLocation, Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Search } from 'lucide-react';
import '../styles/order-success.css';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order } = location.state || {};
    const [copied, setCopied] = useState(false);

    if (!order) {
        return <Navigate to="/" />;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(order.order_code || order.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTrackOrder = () => {
        navigate('/track-order', { state: { orderCode: order.order_code || order.id } });
    };

    return (
        <div className="order-success-page">
            <div className="success-card card">
                <div className="success-icon">
                    <CheckCircle size={64} color="var(--color-success)" />
                </div>
                <h1 className="success-title decorative-text">Đặt Hàng Thành Công!</h1>

                <div className="order-code-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <p className="order-code" style={{ margin: 0 }}>Mã đơn hàng: <span className="code">#{order.order_code || order.id}</span></p>
                    <button
                        onClick={copyToClipboard}
                        className="btn-icon"
                        title="Sao chép mã"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
                    >
                        {copied ? <span style={{ fontSize: '0.8rem', color: 'green', fontWeight: 'bold' }}>Đã chép!</span> : <Copy size={18} />}
                    </button>
                </div>

                <div className="order-details">
                    <h3 className="details-title">Chi tiết đơn hàng</h3>
                    <ul className="items-list">
                        {order.items.map((item, index) => (
                            <li key={index} className="item-row">
                                <span>{item.name} x{item.qty}</span>
                                <span>{formatPrice(item.price * item.qty)}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="divider"></div>

                    <div className="total-row">
                        <span>Tổng cộng:</span>
                        <span className="total-price">{formatPrice(order.total)}</span>
                    </div>
                </div>

                <div className="message-box">
                    <p>Anh/chị vui lòng chuẩn bị khoảng số tiền này.</p>
                    <p>Bên em sẽ giao trong thời gian sớm nhất.</p>
                </div>

                <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <button onClick={handleTrackOrder} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Search size={18} /> Tra cứu đơn hàng này
                    </button>
                    <Link to="/" className="btn btn-primary btn-home" style={{ width: '100%' }}>
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
