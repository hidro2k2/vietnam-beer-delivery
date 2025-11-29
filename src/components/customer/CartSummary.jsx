import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import '../../styles/cart-summary.css';

const CartSummary = ({ submitting = false, products = [] }) => {
    const { cartItems, getTotalItems, updateQuantity } = useCart();

    const selectedProducts = Object.entries(cartItems).map(([id, qty]) => {
        const product = products.find(p => p.id === parseInt(id));
        if (!product) return null;
        return { ...product, qty };
    }).filter(item => item !== null);

    const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliveryFee = subtotal > 0 ? 15000 : 0;
    const total = subtotal + deliveryFee;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const removeItem = (productId) => {
        updateQuantity(productId, -cartItems[productId]);
    };

    if (getTotalItems() === 0) {
        return (
            <div className="card cart-summary empty">
                <h3 className="summary-title decorative-text">Đơn Hàng</h3>
                <p className="empty-text">Chưa có sản phẩm nào.</p>
                <p className="empty-subtext">Hãy chọn bia và nước ngọt ở danh sách bên trái nhé!</p>
            </div>
        );
    }

    return (
        <div className="card cart-summary" id="cart-summary">
            <h3 className="summary-title decorative-text">Đơn Hàng Của Bạn</h3>

            <div className="cart-items">
                {selectedProducts.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-info">
                            <span className="item-name">{item.name} <span className="item-qty">x{item.qty}</span></span>
                            <span className="item-price">{formatPrice(item.price * item.qty)}</span>
                        </div>
                        <button
                            className="remove-item-btn"
                            onClick={() => removeItem(item.id)}
                            title="Xóa sản phẩm"
                            type="button"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-divider"></div>

            <div className="cart-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-row">
                <span>Phí giao hàng:</span>
                <span>{formatPrice(deliveryFee)}</span>
            </div>

            <div className="cart-divider"></div>

            <div className="cart-total">
                <span>Tổng cộng:</span>
                <span className="total-amount">{formatPrice(total)}</span>
            </div>

            <button
                type="submit"
                form="order-form"
                className="btn btn-primary btn-block place-order-btn"
                disabled={submitting}
            >
                {submitting ? 'Đang gửi...' : 'ĐẶT HÀNG NGAY'}
            </button>
            <p className="note-text text-center">Bên em sẽ gọi xác nhận trước khi giao.</p>
        </div>
    );
};

export default CartSummary;
