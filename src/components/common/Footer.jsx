import React from 'react';
import { Phone, MapPin, Music } from 'lucide-react';
import '../../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title decorative-text">LIÊN HỆ</h3>
                        <div className="contact-item">
                            <Phone size={20} className="icon" />
                            <div>
                                <div className="hotline-row">
                                    <span className="hotline-label">HOTLINE 1:</span>
                                    <span className="hotline-content">
                                        <a href="tel:0938386264">0938 386 264</a> (Gặp Chị Hòa)
                                    </span>
                                </div>
                                <div className="hotline-row">
                                    <span className="hotline-label">HOTLINE 2:</span>
                                    <span className="hotline-content">
                                        <a href="tel:0916231530">0916 231 530</a> (Gặp Anh Hòa)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="contact-item">
                            <MapPin size={20} className="icon" />
                            <p>41a2, Phước Tú Thanh Phú, xã Bến Lức, tỉnh Tây Ninh</p>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title decorative-text">KHÔNG KHÍ TẾT</h3>
                        <a
                            href="https://www.youtube.com/watch?v=W-b-3c5v0Ac&list=RDW-b-3c5v0Ac&start_radio=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="music-link"
                        >
                            <Music size={20} />
                            Nghe nhạc Tết 2026
                        </a>
                        <p className="copyright">
                            © 2026 Cửa Hàng Tạp Hóa - Đại Lý Bia Hòa. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
