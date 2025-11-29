import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvcereevlxybmdvcfost.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2VyZWV2bHh5Ym1kdmNmb3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjIwNjYsImV4cCI6MjA3OTg5ODA2Nn0.PFuaFbneZvqUA-JuDnqnaqJoaCcb6MwKIVy_tfQkgOc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate order code
export const generateOrderCode = () => {
    const prefix = 'DH';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

// Helper function to format order for Supabase
export const formatOrderForSupabase = (orderData) => {
    return {
        order_code: generateOrderCode(),
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        customer_address: orderData.customer.address,
        customer_note: orderData.customer.note || null,
        latitude: orderData.customer.coordinates?.lat || null,
        longitude: orderData.customer.coordinates?.lng || null,
        items: orderData.items,
        total: orderData.total,
        status: 'pending'
    };
};

// Helper function to format order from Supabase to app format
export const formatOrderFromSupabase = (dbOrder) => {
    return {
        id: dbOrder.order_code,
        customer: {
            name: dbOrder.customer_name,
            phone: dbOrder.customer_phone,
            address: dbOrder.customer_address,
            note: dbOrder.customer_note,
            coordinates: dbOrder.latitude && dbOrder.longitude
                ? { lat: dbOrder.latitude, lng: dbOrder.longitude }
                : null
        },
        items: dbOrder.items,
        total: dbOrder.total,
        status: dbOrder.status,
        date: dbOrder.created_at
    };
};
