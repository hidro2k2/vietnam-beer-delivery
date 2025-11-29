import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, X, BarChart3, Package } from 'lucide-react';
import { supabase, formatOrderFromSupabase } from '../lib/supabase';
import '../styles/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
            return;
        }

        loadOrders();

        const subscription = supabase
            .channel('orders_channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Change received!', payload);
                    loadOrders();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    const loadOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedOrders = data.map(formatOrderFromSupabase);
            setOrders(formattedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/admin');
    };

    const updateStatus = async (orderCode, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('order_code', orderCode);

            if (error) throw error;

            const updatedOrders = orders.map(o =>
                o.id === orderCode ? { ...o, status: newStatus } : o
            );
            setOrders(updatedOrders);

            if (selectedOrder && selectedOrder.id === orderCode) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Có lỗi khi cập nhật trạng thái!');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getGoogleMapsUrl = (customer) => {
        if (customer.coordinates && customer.coordinates.lat && customer.coordinates.lng) {
            return `https://www.google.com/maps/search/?api=1&query=${customer.coordinates.lat},${customer.coordinates.lng}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`;
    };

    const columns = {
        pending: { label: 'Vừa đặt', color: '#E65100' },
        delivering: { label: 'Đang giao', color: '#1565C0' },
        done: { label: 'Hoàn thành', color: '#2E7D32' }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <header className="admin-header">
                    <h2 className="decorative-text" style={{ margin: 0 }}>Quản Lý Đơn Hàng</h2>
                </header>
                <main className="admin-content" style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Đang tải dữ liệu...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h2 className="decorative-text" style={{ margin: 0 }}>Quản Lý Đơn Hàng</h2>
                <div className="admin-header-actions">
                    <button onClick={() => navigate('/admin/stats')} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                        <BarChart3 size={16} style={{ marginRight: 4 }} /> Xem thống kê
                    </button>
                    <button onClick={() => navigate('/admin/products')} className="btn btn-primary" style={{ padding: '8px 16px', background: '#6f42c1' }}>
                        <Package size={16} style={{ marginRight: 4 }} /> Quản lý sản phẩm
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                        <LogOut size={16} style={{ marginRight: 4 }} /> Đăng xuất
                    </button>
                </div>
            </header>

            <main className="admin-content">
                <div className="kanban-board">
                    {Object.entries(columns).map(([status, config]) => (
                        <div key={status} className="kanban-column">
                            <div className="column-header" style={{ color: config.color }}>
                                {config.label}
                                <span className="badge">{orders.filter(o => o.status === status).length}</span>
                            </div>

                            {orders.filter(o => o.status === status).map(order => (
                                <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                                    <div className="order-header">
                                        <span>#{order.id}</span>
                                        <span>{new Date(order.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="customer-name">{order.customer.name}</div>
                                    <div className="order-total">{formatPrice(order.total)}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </main>

            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                            <h3 className="decorative-text" style={{ margin: 0 }}>Chi Tiết Đơn #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="order-info">
                            <p><strong>Khách hàng:</strong> {selectedOrder.customer.name}</p>
                            <p><strong>SĐT:</strong> {selectedOrder.customer.phone}</p>
                            <p><strong>Địa chỉ:</strong> {selectedOrder.customer.address}</p>
                            {selectedOrder.customer.note && <p><strong>Ghi chú:</strong> {selectedOrder.customer.note}</p>}

                            <div style={{ margin: '20px 0' }}>
                                <a
                                    href={getGoogleMapsUrl(selectedOrder.customer)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                    <MapPin size={16} /> Xem bản đồ
                                </a>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                        <th style={{ padding: 8 }}>Sản phẩm</th>
                                        <th style={{ padding: 8 }}>SL</th>
                                        <th style={{ padding: 8, textAlign: 'right' }}>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 8 }}>{item.name}</td>
                                            <td style={{ padding: 8 }}>{item.qty}</td>
                                            <td style={{ padding: 8, textAlign: 'right' }}>{formatPrice(item.price * item.qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-right" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                Tổng cộng: {formatPrice(selectedOrder.total)}
                            </div>
                        </div>

                        <div className="modal-actions">
                            {selectedOrder.status === 'pending' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => updateStatus(selectedOrder.id, 'delivering')}
                                >
                                    Nhận đơn & Giao hàng
                                </button>
                            )}
                            {selectedOrder.status === 'delivering' && (
                                <button
                                    className="btn btn-success"
                                    style={{ background: 'var(--color-success)', color: 'white' }}
                                    onClick={() => updateStatus(selectedOrder.id, 'done')}
                                >
                                    Hoàn thành đơn
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
