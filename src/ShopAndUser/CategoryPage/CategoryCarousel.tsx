import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryCarousel.css'; // Импортируйте стили карусели

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  loading?: boolean;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, loading = false }) => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Проверка возможности скролла
  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [categories]);

  // Обработка начала перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  // Обработка перетаскивания
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Скорость прокрутки
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  // Обработка окончания перетаскивания
  const handleDragEnd = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
    checkScrollability();
  };

  // Кнопки навигации
  const scrollTo = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    const newScrollLeft = direction === 'left' 
      ? carouselRef.current.scrollLeft - scrollAmount
      : carouselRef.current.scrollLeft + scrollAmount;
    
    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
    
    setTimeout(checkScrollability, 300);
  };

  // Переход на страницу категории
  const handleCategoryClick = (slug: string) => {
    if (!isDragging) {
      navigate(`/category/${slug}`);
    }
  };

  // Скелетон для загрузки
  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="category-card skeleton">
          <div className="category-card-image"></div>
          <p className="category-card-name">Loading</p>
        </div>
      ))}
    </>
  );

  return (
    <div className="categories-carousel-wrapper">
      {/* Кнопка влево */}
      <button
        className={`carousel-nav-button left ${!canScrollLeft ? 'disabled' : ''}`}
        onClick={() => scrollTo('left')}
        disabled={!canScrollLeft}
        aria-label="Прокрутить влево"
      >
        ←
      </button>

      {/* Карусель */}
      <div
        ref={carouselRef}
        className={`categories-carousel-container ${isDragging ? 'grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onScroll={checkScrollability}
      >
        {loading ? renderSkeleton() : (
          categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.slug)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCategoryClick(category.slug);
              }}
            >
              <img
                src={category.icon}
                alt={category.name}
                className="category-card-image"
                draggable="false"
              />
              <p className="category-card-name">{category.name}</p>
            </div>
          ))
        )}
      </div>

      {/* Кнопка вправо */}
      <button
        className={`carousel-nav-button right ${!canScrollRight ? 'disabled' : ''}`}
        onClick={() => scrollTo('right')}
        disabled={!canScrollRight}
        aria-label="Прокрутить вправо"
      >
        →
      </button>
    </div>
  );
};

export default CategoryCarousel;