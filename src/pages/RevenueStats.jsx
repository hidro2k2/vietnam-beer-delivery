import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, ShoppingCart, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/revenue-stats.css';

const RevenueStats = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all'); // 'today', 'month', 'all'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
            return;
        }
        loadOrders();
    }, [navigate]);

    const loadOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return orders.filter(order => {
            const orderDate = new Date(order.created_at);

            if (filter === 'today') {
                return orderDate >= today;
            } else if (filter === 'month') {
                return orderDate >= thisMonth;
            }
            return true; // 'all'
        });
    };

    const filteredOrders = getFilteredOrders();
    const completedOrders = filteredOrders.filter(o => o.status === 'done');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const completedCount = completedOrders.length;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getFilterLabel = () => {
        if (filter === 'today') return 'Hôm Nay';
        if (filter === 'month') return 'Tháng Này';
        return 'Tất Cả';
    };

    if (loading) {
        return (
            <div className="revenue-stats-page">
                <div className="stats-container">
                    <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="revenue-stats-page">
            <div className="stats-container">
                {/* Header */}
                <div className="stats-header">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        <ArrowLeft size={28} />
                        Quay lại
                    </button>
                    <h1 className="stats-title">Thống Kê Doanh Thu</h1>
                </div>

                {/* Filter Buttons */}
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                        onClick={() => setFilter('today')}
                    >
                        <Calendar size={24} />
                        Hôm nay
                    </button>
                    <button
                        className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
                        onClick={() => setFilter('month')}
                    >
                        <Calendar size={24} />
                        Tháng này
                    </button>
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <TrendingUp size={24} />
                        Tất cả
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card revenue-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <p className="stat-label">Tổng Doanh Thu</p>
                            <p className="stat-value">{formatPrice(totalRevenue)}</p>
                            <p className="stat-period">{getFilterLabel()}</p>
                        </div>
                    </div>

                    <div className="stat-card orders-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <p className="stat-label">Tổng Đơn Hàng</p>
                            <p className="stat-value">{totalOrders}</p>
                            <p className="stat-period">đơn</p>
                        </div>
                    </div>

                    <div className="stat-card completed-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <p className="stat-label">Đã Hoàn Thành</p>
                            <p className="stat-value">{completedCount}</p>
                            <p className="stat-period">đơn</p>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                {filteredOrders.length > 0 && (
                    <div className="recent-orders">
                        <h2 className="section-title">Đơn Hàng Gần Đây</h2>
                        <div className="orders-list">
                            {filteredOrders.slice(0, 10).map(order => (
                                <div key={order.id} className="order-item">
                                    <div className="order-info">
                                        <p className="order-code">#{order.order_code}</p>
                                        <p className="order-customer">{order.customer_name}</p>
                                        <p className="order-date">
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="order-amount">
                                        <p className="amount-value">{formatPrice(order.total)}</p>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status === 'pending' && '⏳ Vừa đặt'}
                                            {order.status === 'delivering' && '🚚 Đang giao'}
                                            {order.status === 'done' && '✅ Hoàn thành'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredOrders.length === 0 && (
                    <div className="no-data">
                        <p>Chưa có đơn hàng nào trong khoảng thời gian này</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueStats;
