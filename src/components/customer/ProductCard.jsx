import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import '../../styles/product-card.css';

const ProductCard = ({ product }) => {
    const { getItemQuantity, updateQuantity } = useCart();
    const quantity = getItemQuantity(product.id);
    const [quantityToAdd, setQuantityToAdd] = React.useState(0);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 0) {
            setQuantityToAdd(val);
        }
    };

    const adjustQuantity = (delta) => {
        setQuantityToAdd(prev => Math.max(0, prev + delta));
    };

    const handleAddToCart = (e) => {
        if (quantityToAdd <= 0) return;

        updateQuantity(product.id, quantityToAdd);

        // Animation logic
        const btn = e.currentTarget;
        const cartIcon = document.getElementById('cart-icon-container');

        if (cartIcon) {
            const img = btn.closest('.product-card').querySelector('.product-image');
            if (img) {
                const imgClone = img.cloneNode(true);
                const imgRect = img.getBoundingClientRect();
                const cartRect = cartIcon.getBoundingClientRect();

                imgClone.style.position = 'fixed';
                imgClone.style.top = `${imgRect.top}px`;
                imgClone.style.left = `${imgRect.left}px`;
                imgClone.style.width = `${imgRect.width}px`;
                imgClone.style.height = `${imgRect.height}px`;
                imgClone.style.borderRadius = '50%';
                imgClone.style.opacity = '0.8';
                imgClone.style.zIndex = '9999';
                imgClone.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.2, 1)';
                imgClone.style.pointerEvents = 'none';

                document.body.appendChild(imgClone);

                setTimeout(() => {
                    imgClone.style.top = `${cartRect.top + 10}px`;
                    imgClone.style.left = `${cartRect.left + 10}px`;
                    imgClone.style.width = '20px';
                    imgClone.style.height = '20px';
                    imgClone.style.opacity = '0';
                }, 10);

                setTimeout(() => {
                    imgClone.remove();
                }, 810);
            }
        }

        // Reset quantity to 0 after adding
        setQuantityToAdd(0);
    };

    return (
        <div className="card product-card">
            <div className="product-image-container">
                <img
                    src={product.image_url || `https://placehold.co/300x300/FFF5E6/D62828?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    className="product-image"
                />
                {quantity > 0 && <span className="in-cart-badge">{quantity}</span>}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <p className="product-price">{formatPrice(product.price)}</p>

                <div className="product-actions">
                    <div className="quantity-selector">
                        <button
                            className="qty-btn minus"
                            onClick={() => adjustQuantity(-1)}
                            disabled={quantityToAdd <= 0}
                        >
                            <Minus size={16} />
                        </button>
                        <input
                            type="number"
                            className="qty-input"
                            value={quantityToAdd}
                            onChange={handleQuantityChange}
                            min="0"
                        />
                        <button
                            className="qty-btn plus"
                            onClick={() => adjustQuantity(1)}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
