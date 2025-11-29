import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/hero-slider.css';

const SLIDES = [
    { id: 1, color: '#D62828', text: 'Banner 1: Chúc Mừng Năm Mới' },
    { id: 2, color: '#F7C948', text: 'Banner 2: Bia Giá Tốt' },
    { id: 3, color: '#2E7D32', text: 'Banner 3: Giao Hàng Nhanh' },
    { id: 4, color: '#1565C0', text: 'Banner 4: Quà Tặng Tết' },
    { id: 5, color: '#6A1B9A', text: 'Banner 5: Đại Lý Bia Hòa' },
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    return (
        <div className="hero-slider">
            <div
                className="slider-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {SLIDES.map((slide) => (
                    <div key={slide.id} className="slide" style={{ backgroundColor: slide.color }}>
                        <div className="slide-content">
                            {/* Placeholder for Image */}
                            <img
                                src={`https://placehold.co/1200x500/${slide.color.substring(1)}/FFFFFF?text=${encodeURIComponent(slide.text)}`}
                                alt={slide.text}
                                className="slide-image"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button className="slider-btn prev" onClick={prevSlide}>
                <ChevronLeft size={32} />
            </button>
            <button className="slider-btn next" onClick={nextSlide}>
                <ChevronRight size={32} />
            </button>

            <div className="slider-dots">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
