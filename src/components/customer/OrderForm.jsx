import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import '../../styles/order-form.css';

const OrderForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: '',
        coordinates: null // Store lat/lng separately for Google Maps
    });
    const [loadingLoc, setLoadingLoc] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Trình duyệt của bạn không hỗ trợ định vị.');
            return;
        }

        setLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Update coordinates immediately
                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat: latitude, lng: longitude }
                }));

                try {
                    // Reverse geocoding using OpenStreetMap (Nominatim)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await response.json();

                    if (data && data.display_name) {
                        setFormData(prev => ({
                            ...prev,
                            address: data.display_name
                        }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            address: `Vị trí: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setFormData(prev => ({
                        ...prev,
                        address: `Vị trí: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    }));
                } finally {
                    setLoadingLoc(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = 'Không thể lấy vị trí. Vui lòng nhập thủ công.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Bạn đã từ chối cấp quyền vị trí. Vui lòng kiểm tra cài đặt trình duyệt.';
                }
                alert(msg);
                setLoadingLoc(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form id="order-form" className="order-form card" onSubmit={handleSubmit}>
            <h3 className="form-title decorative-text">Thông Tin Giao Hàng</h3>

            <div className="form-group">
                <label htmlFor="name">Tên của bạn</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Chú Bảy, Cô Ba..."
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="address">Địa chỉ nhận hàng <span style={{ fontWeight: '400', fontStyle: 'italic', color: '#b71c1c', fontSize: '0.9em' }}>(Nên nhập tay để tránh sai định vị)</span></label>
                <div className="location-input-group">
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Số nhà, tên đường, phường/xã..."
                        required
                        className="form-input"
                    />
                    <button
                        type="button"
                        className="btn-location"
                        onClick={handleGetLocation}
                        title="Lấy vị trí hiện tại"
                    >
                        {loadingLoc ? '...' : <MapPin size={20} />}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="note">Ghi chú (tùy chọn)</label>
                <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao cổng sau, gọi trước khi đến..."
                    className="form-input textarea"
                />
            </div>
        </form>
    );
};

export default OrderForm;
