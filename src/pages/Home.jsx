import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSlider from '../components/customer/HeroSlider';
import ProductCatalog from '../components/customer/ProductCatalog';
import OrderForm from '../components/customer/OrderForm';
import CartSummary from '../components/customer/CartSummary';
import { useCart } from '../context/CartContext';
import { supabase, formatOrderForSupabase } from '../lib/supabase';
import { sendNewOrderNotification } from '../lib/telegram';
import '../styles/home.css';

const Home = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleOrderSubmit = async (formData) => {
        // Calculate total
        const selectedProducts = Object.entries(cartItems).map(([id, qty]) => {
            const product = products.find(p => p.id === parseInt(id));
            if (!product) return null;
            return {
                name: product.name,
                price: product.price,
                qty: qty
            };
        }).filter(item => item !== null);

        if (selectedProducts.length === 0) {
            alert('Vui lòng chọn sản phẩm trước khi đặt hàng!');
            return;
        }

        const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const deliveryFee = subtotal > 0 ? 15000 : 0;
        const total = subtotal + deliveryFee;

        // Create order object for Supabase
        const orderData = {
            customer: formData,
            items: selectedProducts,
            total: total
        };

        setSubmitting(true);

        try {
            // Save to Supabase
            const supabaseOrder = formatOrderForSupabase(orderData);
            console.log('Submitting order:', supabaseOrder);

            const { data, error } = await supabase
                .from('orders')
                .insert([supabaseOrder])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
                setSubmitting(false);
                return;
            }

            console.log('Order created successfully:', data);

            // Create order object for success page
            const order = {
                id: data.id,
                order_code: data.order_code,
                customer: formData,
                items: selectedProducts,
                total: total,
                date: data.created_at,
                status: 'pending'
            };

            console.log('Navigating to success page with order:', order);

            // Send Telegram notification (async, don't wait)
            sendNewOrderNotification(order).then(result => {
                if (result) {
                    console.log('Telegram notification sent successfully');
                } else {
                    console.log('Failed to send Telegram notification');
                }
            });

            // Clear cart and redirect
            clearCart();
            navigate('/success', { state: { order } });
        } catch (err) {
            console.error('Error submitting order:', err);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="home-page">
            <Header />
            <HeroSlider />

            <main className="main-content">
                <ProductCatalog products={products} loading={loadingProducts} />

                <section className="checkout-section container">
                    <div className="checkout-grid">
                        <div className="checkout-form">
                            <OrderForm onSubmit={handleOrderSubmit} />
                        </div>
                        <div className="checkout-summary">
                            <CartSummary submitting={submitting} products={products} />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
