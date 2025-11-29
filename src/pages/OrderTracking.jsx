import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { supabase, formatOrderFromSupabase } from '../lib/supabase';
import '../styles/order-tracking.css';

const OrderTracking = () => {
    const location = useLocation();
    const [orderCode, setOrderCode] = useState('');
    const [order, setOrder] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [searched, setSearched] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (location.state?.orderCode) {
            setOrderCode(location.state.orderCode);
        }
    }, [location.state]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearched(true);
        setSearching(true);

        try {
            const searchCode = orderCode.toUpperCase().replace('#', '').trim();

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .ilike('order_code', searchCode)
                .single();

            if (error || !data) {
                setOrder(null);
                setNotFound(true);
            } else {
                const formattedOrder = formatOrderFromSupabase(data);
                setOrder(formattedOrder);
                setNotFound(false);
            }
        } catch (err) {
            console.error('Error searching order:', err);
            setOrder(null);
            setNotFound(true);
        } finally {
            setSearching(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { label: 'Vừa đặt', color: '#E65100', bg: '#FFF3E0' },
            delivering: { label: 'Đang giao', color: '#1565C0', bg: '#E3F2FD' },
            done: { label: 'Hoàn thành', color: '#2E7D32', bg: '#E8F5E9' }
        };
        return statusMap[status] || statusMap.pending;
    };

    return (
        <div className="order-tracking-page">
            <Header />

            <main className="tracking-content container">
                <div className="tracking-header">
                    <h1 className="decorative-text">Tra Cứu Đơn Hàng</h1>
                    <p className="tracking-subtitle">Nhập mã đơn hàng để xem tình trạng giao hàng</p>
                </div>

                <form className="search-form card" onSubmit={handleSearch}>
                    <div className="search-input-group">
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Nhập mã đơn hàng (VD: DH1234567890)"
                            value={orderCode}
                            onChange={(e) => setOrderCode(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary search-btn" disabled={searching}>
                            <Search size={20} />
                            {searching ? 'Đang tìm...' : 'Tra cứu'}
                        </button>
                    </div>
                </form>

                {searched && notFound && (
                    <div className="card result-card not-found">
                        <div className="not-found-icon">❌</div>
                        <h3>Không tìm thấy đơn hàng</h3>
                        <p>Mã đơn hàng "<strong>{orderCode}</strong>" không tồn tại.</p>
                        <p className="hint">Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ hotline để được hỗ trợ.</p>
                    </div>
                )}

                {order && (
                    <div className="card result-card order-found">
                        <div className="order-header-section">
                            <h2>Đơn hàng #{order.id}</h2>
                            <div
                                className="status-badge-large"
                                style={{
                                    backgroundColor: getStatusInfo(order.status).bg,
                                    color: getStatusInfo(order.status).color
                                }}
                            >
                                {getStatusInfo(order.status).label}
                            </div>
                        </div>

                        <div className="order-info-section">
                            <div className="info-row">
                                <span className="label">Khách hàng:</span>
                                <span className="value">{order.customer.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Số điện thoại:</span>
                                <span className="value">{order.customer.phone}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Địa chỉ:</span>
                                <span className="value">{order.customer.address}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Thời gian đặt:</span>
                                <span className="value">
                                    {new Date(order.date).toLocaleString('vi-VN')}
                                </span>
                            </div>
                        </div>

                        <div className="items-section">
                            <h3>Sản phẩm đã đặt</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>SL</th>
                                        <th className="text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td data-label="Sản phẩm">{item.name}</td>
                                            <td data-label="SL">{item.qty}</td>
                                            <td data-label="Thành tiền" className="text-right">{formatPrice(item.price * item.qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="total-section">
                            <div className="total-row">
                                <span>Tổng cộng:</span>
                                <span className="total-amount">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        <div className="status-message">
                            {order.status === 'pending' && (
                                <p>📦 Đơn hàng của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
                            )}
                            {order.status === 'delivering' && (
                                <p>🚚 Đơn hàng đang được giao đến bạn. Vui lòng chuẩn bị tiền mặt.</p>
                            )}
                            {order.status === 'done' && (
                                <p>✅ Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua hàng!</p>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default OrderTracking;
