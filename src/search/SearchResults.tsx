import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchApi, type SearchResultItem } from './SearchApi';
import ShopDetailView from '../ShopAndUser/ShopDetailView';
import ItemDetailModal from '../ShopAndUser/ItemAbout/ItemDetailModal/ItemDetailModal';
import './SearchResults.css';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'ITEM' | 'SHOP' | 'CATEGORY'>('ALL');

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchApi.search({
        query,
        type: filterType === 'ALL' ? null : filterType,
        limit: 50,
      });
      
      setResults(response.results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Ошибка при поиске. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = filterType === 'ALL' 
    ? results 
    : results.filter(r => r.type === filterType);

  const handleResultClick = (result: SearchResultItem) => {
    if (result.type === 'SHOP') {
      setSelectedShop(result.data);
    } else if (result.type === 'ITEM') {
      setSelectedItem(result.data);
    } else if (result.type === 'CATEGORY') {
      navigate(`/category/${result.data.slug}`);
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

  const renderResultCard = (result: SearchResultItem) => {
    const { type, data, score } = result;

    if (type === 'ITEM') {
      return (
        <div 
          key={`${type}-${result.id}`}
          className="search-result-card item-result"
          onClick={() => handleResultClick(result)}
        >
          <div className="result-type-badge">
            {getTypeIcon(type)} {getTypeLabel(type)}
          </div>
          
          {data.images && data.images.length > 0 && (
            <div className="result-images">
              {data.images.slice(0, 3).map((img: string, idx: number) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={data.title}
                  className="result-image"
                />
              ))}
            </div>
          )}
          
          <div className="result-content">
            <h3 className="result-title">{data.title}</h3>
            <p className="result-description">{data.description}</p>
            <p className="result-meta">🏪 {data.shop?.name}</p>
            <p className="result-meta">📍 {data.city}</p>
            {data.tags && data.tags.length > 0 && (
              <p className="result-tags">
                🏷️ {data.tags.map((tag: string) => `#${tag}`).join(' ')}
              </p>
            )}
            <div className="result-footer">
              <span className="result-stats">👁️ {data.views} | ❤️ {data.favorites}</span>
              <span className="result-score">{Math.round(score * 100)}% совпадение</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'SHOP') {
      return (
        <div 
          key={`${type}-${result.id}`}
          className="search-result-card shop-result"
          onClick={() => handleResultClick(result)}
        >
          <div className="result-type-badge">
            {getTypeIcon(type)} {getTypeLabel(type)}
          </div>
          
          <div className="shop-result-content">
            {data.logoUrl ? (
              <img 
                src={data.logoUrl} 
                alt={data.name}
                className="shop-result-logo"
              />
            ) : (
              <div className="shop-result-logo-placeholder">
                {data.name.substring(0, 2)}
              </div>
            )}
            
            <div className="result-content">
              <h3 className="result-title">{data.name}</h3>
              <p className="result-description">{data.description}</p>
              <p className="result-meta">📍 {data.city}</p>
              {data.instagramLink && (
                <p className="result-meta">📷 Instagram</p>
              )}
              <div className="result-footer">
                <span className="result-score">{Math.round(score * 100)}% совпадение</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'CATEGORY') {
      return (
        <div 
          key={`${type}-${result.id}`}
          className="search-result-card category-result"
          onClick={() => handleResultClick(result)}
        >
          <div className="result-type-badge">
            {getTypeIcon(type)} {getTypeLabel(type)}
          </div>
          
          <div className="category-result-content">
            {data.icon && (
              <img 
                src={data.icon} 
                alt={data.name}
                className="category-result-icon"
              />
            )}
            
            <div className="result-content">
              <h3 className="result-title">{data.name}</h3>
              <div className="result-footer">
                <span className="result-score">{Math.round(score * 100)}% совпадение</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="search-results-container">
      {/* Шапка с результатами */}
      <div className="search-results-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Назад
        </button>
        <div className="search-results-info">
          <h1 className="search-results-title">
            Результаты поиска: <span className="query-text">"{query}"</span>
          </h1>
          {!loading && (
            <p className="search-results-count">
              Найдено результатов: {filteredResults.length}
            </p>
          )}
        </div>
      </div>

      {/* Фильтры по типу */}
      <div className="search-filters">
        <button 
          className={`filter-button ${filterType === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterType('ALL')}
        >
          🔍 Все ({results.length})
        </button>
        <button 
          className={`filter-button ${filterType === 'ITEM' ? 'active' : ''}`}
          onClick={() => setFilterType('ITEM')}
        >
          📦 Товары ({results.filter(r => r.type === 'ITEM').length})
        </button>
        <button 
          className={`filter-button ${filterType === 'SHOP' ? 'active' : ''}`}
          onClick={() => setFilterType('SHOP')}
        >
          🏪 Магазины ({results.filter(r => r.type === 'SHOP').length})
        </button>
        <button 
          className={`filter-button ${filterType === 'CATEGORY' ? 'active' : ''}`}
          onClick={() => setFilterType('CATEGORY')}
        >
          🏷️ Категории ({results.filter(r => r.type === 'CATEGORY').length})
        </button>
      </div>

      {/* Результаты */}
      {loading ? (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Поиск...</p>
        </div>
      ) : error ? (
        <div className="search-error">
          <h2>😔 {error}</h2>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="search-empty">
          <h2>😕 Ничего не найдено</h2>
          <p>Попробуйте изменить запрос или использовать другие ключевые слова</p>
        </div>
      ) : (
        <div className="search-results-grid">
          {filteredResults.map(renderResultCard)}
        </div>
      )}

      {/* Модальные окна */}
      {selectedShop && (
        <ShopDetailView 
          shop={selectedShop} 
          onClose={() => setSelectedShop(null)} 
          currentUserId={null}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isFavorite={false}
          onClose={() => setSelectedItem(null)}
          onToggleFavorite={() => {}}
        />
      )}
    </div>
  );
};

export default SearchResults;