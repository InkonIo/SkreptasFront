import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi, type SearchResultItem } from './SearchApi';
import './SearchBar.css';

interface SearchBarProps {
  categories: any[];
  onCategorySelect?: (categoryId: number | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ categories, onCategorySelect }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);



  // Закрываем подсказки при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Автодополнение при вводе
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Дебаунсинг - ждем 300мс после последнего ввода
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await searchApi.search({
          query: searchQuery,
          limit: 5, // Показываем только 5 подсказок
        });
        setSuggestions(response.results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (item: SearchResultItem) => {
    setShowSuggestions(false);
    setSearchQuery('');
    
    // Переходим на страницу объекта
    if (item.type === 'SHOP') {
      navigate(`/shop/${item.id}`);
    } else if (item.type === 'ITEM') {
      navigate(`/item/${item.id}`);
    } else if (item.type === 'CATEGORY') {
      navigate(`/category/${item.data.slug}`);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ITEM': return '📦';
      case 'SHOP': return '🏪';
      case 'CATEGORY': return '🏷️';
      default: return '🔍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ITEM': return 'Товар';
      case 'SHOP': return 'Магазин';
      case 'CATEGORY': return 'Категория';
      default: return '';
    }
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      {/* Выпадающий список категорий */}
      <select 
        className="category-select"
        value={selectedCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Все категории</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Поле поиска */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Умный поиск: товары, магазины, категории..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button type="submit" className="search-button">
          {isLoading ? '⏳' : '🔍'}
        </button>
      </form>

      {/* Автодополнение */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(item)}
            >
              <span className="suggestion-icon">{getTypeIcon(item.type)}</span>
              <div className="suggestion-content">
                <div className="suggestion-title">{item.title}</div>
                <div className="suggestion-type">
                  {getTypeLabel(item.type)} • 
                  <span className="suggestion-score">
                    {Math.round(item.score * 100)}% совпадение
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="suggestion-footer" onClick={handleSearch}>
            Показать все результаты →
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;