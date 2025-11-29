import React from 'react';
import { Phone } from 'lucide-react';
import '../../styles/floating-contact.css';

const FloatingContact = () => {
    return (
        <div className="floating-contact-container">
            <a href="https://zalo.me/0908817185" target="_blank" rel="noopener noreferrer" className="floating-btn zalo-btn" title="Chat Zalo">
                <div className="btn-icon">
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Zalo</span>
                </div>
            </a>
            <a href="tel:0938386264" className="floating-btn phone-btn" title="Gọi ngay">
                <div className="btn-icon">
                    <Phone size={24} />
                </div>
            </a>
        </div>
    );
};

export default FloatingContact;
