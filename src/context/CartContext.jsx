import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'beerDeliveryCart';

export const CartProvider = ({ children }) => {
    // Load cart from localStorage on mount
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : {};
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return {};
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cartItems]);

    const updateQuantity = (productId, delta) => {
        setCartItems(prev => {
            const currentQty = prev[productId] || 0;
            const newQty = Math.max(0, currentQty + delta);

            if (newQty === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    const getItemQuantity = (productId) => cartItems[productId] || 0;

    const getTotalItems = () => Object.values(cartItems).reduce((a, b) => a + b, 0);

    const clearCart = () => setCartItems({});

    return (
        <CartContext.Provider value={{ cartItems, updateQuantity, getItemQuantity, getTotalItems, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
