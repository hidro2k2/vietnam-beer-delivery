import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/contact.css';

const Contact = () => {
    return (
        <>
            <Header />
            <div className="contact-page">
                <div className="container">
                    <div className="contact-content">
                        {/* About Section */}
                        <section className="about-section">
                            <h1 className="page-title decorative-text">Giới Thiệu</h1>
                            <div className="about-card card">
                                <h2 className="store-name">CỬA HÀNG TẠP HÓA<br />ĐẠI LÝ BIA HÒA</h2>
                                <p className="store-description">
                                    Chúng tôi là đại lý bia uy tín tại Tây Ninh, chuyên cung cấp các loại bia,
                                    nước ngọt, nước suối và đồ ăn vặt với giá cả cạnh tranh. Với phương châm
                                    "Giao hàng nhanh - Giá cả hợp lý - Phục vụ tận tâm", chúng tôi cam kết
                                    mang đến cho quý khách hàng trải nghiệm mua sắm tốt nhất.
                                </p>
                                <div className="store-features">
                                    <div className="feature-item">
                                        <span className="feature-icon">🚚</span>
                                        <span>Giao hàng nhanh chóng</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">💰</span>
                                        <span>Giá cả cạnh tranh</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">✨</span>
                                        <span>Hàng hóa chất lượng</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">🤝</span>
                                        <span>Phục vụ tận tâm</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact Section */}
                        <section className="contact-section">
                            <h2 className="section-title decorative-text">Thông Tin Liên Hệ</h2>

                            <div className="contact-info-grid">
                                {/* Hotline */}
                                <div className="contact-card card">
                                    <div className="contact-icon">
                                        <Phone size={32} />
                                    </div>
                                    <h3>Hotline</h3>
                                    <div className="hotline-list">
                                        <div className="hotline-row">
                                            <span className="hotline-label">HOTLINE 1:</span>
                                            <div className="hotline-content">
                                                <a href="tel:0938386264">0938 386 264</a>
                                                <span>(Gặp Chị Hòa)</span>
                                            </div>
                                        </div>
                                        <div className="hotline-row">
                                            <span className="hotline-label">HOTLINE 2:</span>
                                            <div className="hotline-content">
                                                <a href="tel:0916231530">0916 231 530</a>
                                                <span>(Gặp Anh Hòa)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="contact-card card">
                                    <div className="contact-icon">
                                        <MapPin size={32} />
                                    </div>
                                    <h3>Địa Chỉ</h3>
                                    <p className="address-text">
                                        41a2, Phước Tử Thanh Phú, xã Bến Lức, tỉnh Tây Ninh
                                    </p>
                                    <a
                                        href="https://maps.google.com/?q=41a2,+Phước+Tử+Thanh+Phú,+xã+Bến+Lức,+tỉnh+Tây+Ninh"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        Xem trên bản đồ
                                    </a>
                                </div>

                                {/* Payment Methods */}
                                <div className="contact-card card">
                                    <div className="contact-icon">
                                        <span style={{ fontSize: '32px' }}>💳</span>
                                    </div>
                                    <h3>Thanh Toán</h3>
                                    <p>Chúng tôi chấp nhận các hình thức thanh toán:</p>
                                    <div className="payment-methods">
                                        <div className="payment-item">💵 Tiền mặt</div>
                                        <div className="payment-item">🏦 Chuyển khoản</div>
                                        <div className="payment-item">📱 Ví điện tử</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Working Hours */}
                        <section className="hours-section">
                            <div className="hours-card card">
                                <h3 className="decorative-text">Giờ Mở Cửa</h3>
                                <div className="hours-content">
                                    <div className="hours-row">
                                        <span className="day">Thứ 2 - Chủ Nhật:</span>
                                        <span className="time">6:00 - 21:30</span>
                                    </div>
                                    <p className="hours-note">
                                        * Giao hàng tận nơi trong khu vực Bến Lức - Tây Ninh
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Contact;
