import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, X, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/admin.css';

const AdminProductManager = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'beer',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        checkAdmin();
        fetchProducts();
    }, []);

    const checkAdmin = () => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Lỗi khi upload ảnh!');
            return null;
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'beer',
            image_url: ''
        });
        setImageFile(null);
        setPreviewUrl('');
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            image_url: product.image_url || ''
        });
        setImageFile(null);
        setPreviewUrl(product.image_url || '');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = formData.image_url;

            // Nếu có file ảnh mới được chọn, upload lên Supabase Storage
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseInt(formData.price),
                category: formData.category,
                image_url: imageUrl || null
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                alert('Cập nhật sản phẩm thành công!');
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);

                if (error) throw error;
                alert('Thêm sản phẩm thành công!');
            }

            setShowModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Có lỗi xảy ra khi lưu sản phẩm');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Có lỗi xảy ra khi xóa sản phẩm');
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getCategoryLabel = (cat) => {
        switch (cat) {
            case 'beer': return 'Bia';
            case 'soft-drink': return 'Nước ngọt';
            case 'water': return 'Nước suối';
            case 'food': return 'Đồ ăn';
            case 'ice': return 'Nước đá';
            case 'other': return 'Khác';
            default: return cat;
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ padding: '8px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="decorative-text" style={{ margin: 0 }}>Quản Lý Sản Phẩm</h2>
                </div>
                <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                    <Plus size={16} style={{ marginRight: 4 }} /> Thêm sản phẩm
                </button>
            </header>

            <main className="admin-content">
                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu...</p>
                ) : (
                    <div className="table-container" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <table className="product-table">
                            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Hình ảnh</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Tên sản phẩm</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Danh mục</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Giá</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }} data-label="ID">#{product.id}</td>
                                        <td style={{ padding: '15px' }} data-label="Hình ảnh">
                                            <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <ImageIcon size={20} color="#ccc" />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }} data-label="Tên sản phẩm">
                                            <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.description}</div>
                                        </td>
                                        <td style={{ padding: '15px' }} data-label="Danh mục">
                                            <span className="badge" style={{
                                                background: product.category === 'beer' ? '#fff3cd' :
                                                    product.category === 'soft-drink' ? '#d1e7dd' :
                                                        product.category === 'water' ? '#cff4fc' :
                                                            product.category === 'food' ? '#f8d7da' :
                                                                product.category === 'ice' ? '#e2e3e5' : '#fff3cd',
                                                color: product.category === 'beer' ? '#856404' :
                                                    product.category === 'soft-drink' ? '#0f5132' :
                                                        product.category === 'water' ? '#055160' :
                                                            product.category === 'food' ? '#842029' :
                                                                product.category === 'ice' ? '#41464b' : '#856404',
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'
                                            }}>
                                                {getCategoryLabel(product.category)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }} data-label="Giá">
                                            {formatPrice(product.price)}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }} data-label="Thao tác">
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="btn"
                                                    style={{ padding: '6px', background: '#e3f2fd', color: '#0d47a1', border: 'none' }}
                                                    title="Sửa"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="btn"
                                                    style={{ padding: '6px', background: '#ffebee', color: '#c62828', border: 'none' }}
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                            <h3 className="decorative-text" style={{ margin: 0 }}>
                                {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên sản phẩm</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mô tả</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Giá (VNĐ)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="form-input"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Danh mục</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="beer">Bia</option>
                                    <option value="soft-drink">Nước ngọt</option>
                                    <option value="water">Nước suối</option>
                                    <option value="food">Đồ ăn</option>
                                    <option value="ice">Nước đá</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>URL Hình ảnh (Tùy chọn)</label>
                                <input
                                    type="text"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="form-input"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                {formData.image_url && !imageFile && (
                                    <div style={{ marginTop: '10px', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Hoặc Tải ảnh lên</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" className="upload-btn">
                                    <ImageIcon size={18} /> Chọn ảnh
                                </label>
                            </div>
                            {previewUrl && imageFile && (
                                <div style={{ marginTop: '10px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Ảnh đã chọn: {imageFile.name}</p>
                                    <div style={{ width: '120px', height: '120px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Save size={18} /> Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductManager;
