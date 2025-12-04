import React, { useState } from 'react';
import { Phone, Search, Package, Clock, MapPin, CheckCircle, Truck, XCircle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { supabase } from '../lib/supabase';
import '../styles/order-history.css';

const OrderHistory = () => {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { text: 'Chờ xác nhận', color: '#f59e0b', icon: Clock, bgColor: '#fef3c7' },
            delivering: { text: 'Đang giao', color: '#3b82f6', icon: Truck, bgColor: '#dbeafe' },
            done: { text: 'Hoàn thành', color: '#10b981', icon: CheckCircle, bgColor: '#d1fae5' },
            cancelled: { text: 'Đã hủy', color: '#ef4444', icon: XCircle, bgColor: '#fee2e2' }
        };
        return statusMap[status] || statusMap.pending;
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!phone.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }

        // Clean phone number
        const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '');

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_phone', cleanPhone)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-history-page">
            <Header />

            <main className="order-history-container">
                <div className="order-history-header">
                    <h1>📋 Lịch sử đơn hàng</h1>
                    <p>Nhập số điện thoại để xem các đơn hàng đã đặt</p>
                </div>

                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <Phone size={20} className="search-icon" />
                        <input
                            type="tel"
                            placeholder="Nhập số điện thoại (VD: 0901234567)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="search-btn" disabled={loading}>
                        <Search size={18} />
                        {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        <XCircle size={18} />
                        {error}
                    </div>
                )}

                {searched && !loading && (
                    <div className="orders-result">
                        {orders.length === 0 ? (
                            <div className="no-orders">
                                <Package size={48} />
                                <h3>Không tìm thấy đơn hàng</h3>
                                <p>Số điện thoại này chưa có đơn hàng nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="orders-count">
                                    Tìm thấy <strong>{orders.length}</strong> đơn hàng
                                </div>
                                <div className="orders-list">
                                    {orders.map((order) => {
                                        const statusInfo = getStatusInfo(order.status);
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <div key={order.id} className="order-card">
                                                <div className="order-card-header">
                                                    <div className="order-code">
                                                        <Package size={18} />
                                                        <span>#{order.order_code}</span>
                                                    </div>
                                                    <div
                                                        className="order-status"
                                                        style={{
                                                            backgroundColor: statusInfo.bgColor,
                                                            color: statusInfo.color
                                                        }}
                                                    >
                                                        <StatusIcon size={14} />
                                                        {statusInfo.text}
                                                    </div>
                                                </div>

                                                <div className="order-card-body">
                                                    <div className="order-info">
                                                        <div className="info-row">
                                                            <Clock size={16} />
                                                            <span>{formatDate(order.created_at)}</span>
                                                        </div>
                                                        <div className="info-row">
                                                            <MapPin size={16} />
                                                            <span>{order.customer_address}</span>
                                                        </div>
                                                    </div>

                                                    <div className="order-items">
                                                        <h4>Sản phẩm:</h4>
                                                        <ul>
                                                            {order.items.map((item, idx) => (
                                                                <li key={idx}>
                                                                    {item.name} x{item.qty} - {formatPrice(item.price * item.qty)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="order-card-footer">
                                                    <span className="total-label">Tổng tiền:</span>
                                                    <span className="total-amount">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default OrderHistory;
