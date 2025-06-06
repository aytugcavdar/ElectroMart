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

  // Filtre değişikliklerini doğrudan ana bileşene ileten fonksiyon
  const handleFilterUpdate = (update) => {
    if (onFilterChange) {
      onFilterChange(update);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      title: '',
      category: '',
      brand: '',
      price: '',
      rating: '',
      search: '',
    };
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
        
        <div className="space-y-4">
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
              value={currentFilters.search || ''} 
              onChange={(e) => handleFilterUpdate({ search: e.target.value })} 
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
              value={currentFilters.category || ''} 
              onChange={(e) => handleFilterUpdate({ category: e.target.value })}
            >
              <option value="">Kategori Seçin</option>
              {categoryLoading ? (
                <option disabled>Yükleniyor...</option>
              ) : (
                categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
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
              value={currentFilters.brand || ''} 
              onChange={(e) => handleFilterUpdate({ brand: e.target.value })}
            >
              <option value="">Marka Seçin</option>
              {brandLoading ? (
                <option disabled>Yükleniyor...</option>
              ) : (
                brands?.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
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
              type="range" 
              min="0" 
              max="100000" // Maksimum fiyatı ihtiyacınıza göre ayarlayın
              step="100"
              value={currentFilters.price || ''} 
              className="range range-primary" 
              onChange={(e) => handleFilterUpdate({ price: e.target.value })}
            />
             <div className="w-full flex justify-between text-xs px-2">
                <span>0 ₺</span>
                <span>{currentFilters.price ? `${Number(currentFilters.price).toLocaleString('tr-TR')} ₺` : '100.000+ ₺'}</span>
            </div>
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
                  checked={currentFilters.rating === star.toString()}
                  onChange={() => handleFilterUpdate({ rating: star.toString() })}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              className="btn btn-ghost flex-1"
              onClick={handleReset}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Temizle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;