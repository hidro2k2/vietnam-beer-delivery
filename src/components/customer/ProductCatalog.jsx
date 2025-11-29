import React, { useState } from 'react';
import ProductCard from './ProductCard';
import '../../styles/product-catalog.css';

const CATEGORIES = [
    { id: 'all', label: 'Tất cả' },
    { id: 'beer', label: 'Bia' },
    { id: 'soft-drink', label: 'Nước ngọt' },
    { id: 'water', label: 'Nước suối' },
    { id: 'food', label: 'Đồ ăn' },
    { id: 'ice', label: 'Nước đá' },
    { id: 'other', label: 'Khác' },
];

const ProductCatalog = ({ products = [], loading = false }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Apply filters
    let filteredProducts = products;

    // 1. Filter by category
    if (activeCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === activeCategory);
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return (
        <section className="product-catalog section-padding">
            <div className="container">
                <h2 className="section-title text-center decorative-text">Chọn Bia & Nước Uống</h2>

                {/* Search Control */}
                <div className="filter-controls">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center">Đang tải sản phẩm...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center" style={{ padding: '40px', color: '#666' }}>
                        Không tìm thấy sản phẩm nào
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductCatalog;
