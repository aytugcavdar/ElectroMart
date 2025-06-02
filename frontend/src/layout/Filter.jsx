import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../redux/categorySlice';
import { getBrands } from '../redux/brandSlice';

const Filter = ({ onFilterChange, currentFilters }) => {
  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { brands, loading: brandLoading } = useSelector((state) => state.brand);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getBrands());
  }, [dispatch]);

  const [filter, setFilter] = useState({
    title: currentFilters?.title || '',
    category: currentFilters?.category || '',
    brand: currentFilters?.brand || '',
    price: currentFilters?.price || '',
    rating: currentFilters?.rating || ''
  });

  // Props'dan gelen filtreler değiştiğinde local state'i güncelle
  useEffect(() => {
    if (currentFilters) {
      setFilter({
        title: currentFilters.title || '',
        category: currentFilters.category || '',
        brand: currentFilters.brand || '',
        price: currentFilters.price || '',
        rating: currentFilters.rating || ''
      });
    }
  }, [currentFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Parent component'e filtreleri gönder
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      title: '',
      category: '',
      brand: '',
      price: '',
      rating: ''
    };
    setFilter(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          Filtreler
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Başlık</span>
            </label>
            <input 
              type="text" 
              id="title"
              placeholder="Ürün adı ara..."
              className="input input-bordered w-full" 
              value={filter.title} 
              onChange={(e) => setFilter({ ...filter, title: e.target.value })} 
            />
          </div>

          {/* Category Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Kategori</span>
            </label>
            <select 
              id="category"
              className="select select-bordered w-full" 
              value={filter.category} 
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">Kategori Seçin</option>
              {categoryLoading ? (
                <option disabled>Yükleniyor...</option>
              ) : (
                categories?.map((category) => (
                  <option key={category._id || category.id || category.name} value={category._id || category.id || category.name}>
                    {category.name || category.title || category}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Brand Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Marka</span>
            </label>
            <select 
              id="brand"
              className="select select-bordered w-full" 
              value={filter.brand} 
              onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
            >
              <option value="">Marka Seçin</option>
              {brandLoading ? (
                <option disabled>Yükleniyor...</option>
              ) : (
                brands?.map((brand) => (
                  <option key={brand._id || brand.id || brand.name} value={brand._id || brand.id || brand.name}>
                    {brand.name || brand.title || brand}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Price Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Maksimum Fiyat</span>
            </label>
            <input 
              type="number" 
              id="price"
              placeholder="₺0"
              className="input input-bordered w-full" 
              value={filter.price} 
              onChange={(e) => setFilter({ ...filter, price: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>

          {/* Rating Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Minimum Puan</span>
            </label>
            <div className="rating rating-lg gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name="rating"
                  className="mask mask-star-2 bg-warning"
                  checked={filter.rating === star.toString()}
                  onChange={() => setFilter({ ...filter, rating: star.toString() })}
                />
              ))}
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={filter.rating || 1}
              className="range range-warning range-sm"
              onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
            />
            <div className="w-full flex justify-between text-xs px-2 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={categoryLoading || brandLoading}
            >
              {(categoryLoading || brandLoading) ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Filtrele
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost"
              onClick={handleReset}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Temizle
            </button>
          </div>
        </form>

        {/* Active Filters Display */}
        {(filter.title || filter.category || filter.brand || filter.price || filter.rating) && (
          <div className="divider">Aktif Filtreler</div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {filter.title && (
            <div className="badge badge-outline gap-2">
              Başlık: {filter.title}
              <button 
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => {
                  const newFilter = { ...filter, title: '' };
                  setFilter(newFilter);
                  onFilterChange(newFilter);
                }}
              >
                ✕
              </button>
            </div>
          )}
          {console.log(filter.category)}
          {filter.category && (
            
            <div className="badge badge-outline gap-2">
              Kategori: {(() => {
                const categoryName = categories?.find(c => (c._id || c.id || c.name) === filter.category)?.name || 
                                   categories?.find(c => (c._id || c.id || c.name) === filter.category)?.title || 
                                   filter.category;
                return typeof categoryName === 'object' ? categoryName.name || categoryName.title : categoryName;
              })()}
              <button 
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => {
                  const newFilter = { ...filter, category: '' };
                  setFilter(newFilter);
                  onFilterChange(newFilter);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {filter.brand && (
            <div className="badge badge-outline gap-2">
              Marka: {(() => {
                const brandName = brands?.find(b => (b._id || b.id || b.name) === filter.brand)?.name || 
                                brands?.find(b => (b._id || b.id || b.name) === filter.brand)?.title || 
                                filter.brand;
                return typeof brandName === 'object' ? brandName.name || brandName.title : brandName;
              })()}
              <button 
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => {
                  const newFilter = { ...filter, brand: '' };
                  setFilter(newFilter);
                  onFilterChange(newFilter);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {filter.price && (
            <div className="badge badge-outline gap-2">
              Max Fiyat: ₺{filter.price}
              <button 
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => {
                  const newFilter = { ...filter, price: '' };
                  setFilter(newFilter);
                  onFilterChange(newFilter);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {filter.rating && (
            <div className="badge badge-outline gap-2">
              Min Puan: {filter.rating}⭐
              <button 
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => {
                  const newFilter = { ...filter, rating: '' };
                  setFilter(newFilter);
                  onFilterChange(newFilter);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
