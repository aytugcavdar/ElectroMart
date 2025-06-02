import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../redux/productSlice';
import Filter from '../layout/Filter';

const Products = () => {
  const { products, loading, error, pagination, total } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  // Arama ve filtreleme state'i
  const [filters, setFilters] = useState({
    search: '',
    title: '',
    category: '',
    brand: '',
    price: '',
    rating: '',
    sort: 'createdAt,desc',
    page: 1,
    limit: 12
  });

  // Sayfalama state'i
  const [currentPage, setCurrentPage] = useState(1);

  // View mode state'i (grid/list)
  const [viewMode, setViewMode] = useState('grid');

  // Ürünleri yükle
  useEffect(() => {
    const queryParams = {
      ...filters,
      page: currentPage
    };

    // Boş değerleri kaldır
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    // Filtre değişikliklerini uygula
    dispatch(getProducts(queryParams)).catch(error => {
      console.error('Error fetching products:', error);
    });
  }, [dispatch, filters, currentPage]);

  // Filter değişikliklerini handle et
  const handleFilterChange = (newFilters) => {
    // Mevcut filtreleri koru ve yeni filtreleri ekle
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1 // Yeni filtre uygulandığında ilk sayfaya dön
    };

    // Boş değerleri temizle
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === '' || updatedFilters[key] === null || updatedFilters[key] === undefined) {
        delete updatedFilters[key];
      }
    });

    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  // Sayfa değişikliklerini handle et
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sıralama değişikliklerini handle et
  const handleSortChange = (sortValue) => {
    setFilters(prev => ({
      ...prev,
      sort: sortValue
    }));
    setCurrentPage(1);
  };

  // Limit değişikliklerini handle et
  const handleLimitChange = (limitValue) => {
    setFilters(prev => ({
      ...prev,
      limit: parseInt(limitValue)
    }));
    setCurrentPage(1);
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setFilters({
      search: '',
      title: '',
      category: '',
      brand: '',
      price: '',
      rating: '',
      sort: 'createdAt,desc',
      page: 1,
      limit: 12
    });
    setCurrentPage(1);
  };

  // Sayfa numaralarını oluştur
  const generatePageNumbers = () => {
    const totalPages = Math.ceil(total / filters.limit);
    const pages = [];

    // Her zaman gösterilecek sayfa sayısı
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Eğer son sayfaya yakınsak, başlangıcı ayarla
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return { pages, totalPages };
  };

  const { pages, totalPages } = generatePageNumbers();

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Hata: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar - Filtreler */}
        <div className="lg:w-1/4">
          <div className="sticky top-4">
            <Filter onFilterChange={handleFilterChange} currentFilters={filters} />
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="lg:w-3/4">
          
          {/* Üst Bar - Arama, Sıralama, View Mode */}
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body p-4">
              
              {/* Arama Çubuğu */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="form-control">
                    <div className="input-group">
                      <input 
                        type="text" 
                        placeholder="Ürün ara..." 
                        className="input input-bordered flex-1"
                        value={filters.search}
                        onChange={(e) => handleFilterChange({ search: e.target.value })}
                      />
                      <button 
                        className="btn btn-square btn-primary"
                        onClick={() => handleFilterChange({ search: filters.search })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kontrol Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Sonuç Bilgisi */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {total > 0 ? (
                      <>
                        <span className="font-medium">{((currentPage - 1) * filters.limit) + 1}</span>
                        -
                        <span className="font-medium">{Math.min(currentPage * filters.limit, total)}</span>
                        {' '}/ {total} ürün
                      </>
                    ) : (
                      'Ürün bulunamadı'
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  
                  {/* Sıralama */}
                  <div className="form-control">
                    <select 
                      className="select select-bordered select-sm w-full max-w-xs"
                      value={filters.sort}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      <option value="createdAt,desc">Yeniden Eskiye</option>
                      <option value="createdAt,asc">Eskiden Yeniye</option>
                      <option value="title,asc">A-Z</option>
                      <option value="title,desc">Z-A</option>
                      <option value="price,asc">Fiyat: Düşük-Yüksek</option>
                      <option value="price,desc">Fiyat: Yüksek-Düşük</option>
                      <option value="rating,desc">En Yüksek Puan</option>
                    </select>
                  </div>

                  {/* Sayfa Başına Gösterim */}
                  <div className="form-control">
                    <select 
                      className="select select-bordered select-sm"
                      value={filters.limit}
                      onChange={(e) => handleLimitChange(e.target.value)}
                    >
                      <option value="6">6</option>
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="48">48</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="btn-group">
                    <button 
                      className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid Görünümü"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button 
                      className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="Liste Görünümü"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={handleResetFilters}
                    title="Filtreleri Temizle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {/* Ürün Listesi */}
          {!loading && (
            <>
              {products && products.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <div key={product._id} className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow ${
                      viewMode === 'list' ? 'card-side' : ''
                    }`}>
                      
                      {/* Ürün Resmi */}
                      <figure className={viewMode === 'list' ? 'w-48' : ''}>
                        <img 
                          src={product.image || '/api/placeholder/300/200'} 
                          alt={product.title}
                          className={`object-cover ${viewMode === 'list' ? 'h-full w-full' : 'h-48 w-full'}`}
                        />
                      </figure>
                      
                      <div className="card-body">
                        {/* Başlık */}
                        <h3 className="card-title text-lg">
                          {product.title}
                          {product.isNew && <div className="badge badge-secondary">Yeni</div>}
                        </h3>
                        
                        {/* Açıklama */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {/* Kategori ve Marka */}
                        <div className="flex flex-wrap gap-2 my-2">
                          {product.category && (
                            <div className="badge badge-outline">
                              {typeof product.category === 'object' ? product.category.name : product.category}
                            </div>
                          )}
                          {product.brand && (
                            <div className="badge badge-ghost">
                              {typeof product.brand === 'object' ? product.brand.name : product.brand}
                            </div>
                          )}
                        </div>
                        
                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <div className="rating rating-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <input
                                  key={star}
                                  type="radio"
                                  className="mask mask-star-2 bg-warning"
                                  checked={star <= Math.floor(product.rating)}
                                  readOnly
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({product.rating})</span>
                          </div>
                        )}
                        
                        {/* Fiyat ve Butonlar */}
                        <div className="card-actions justify-between items-center mt-4">
                          {product.price && (
                            <div className="text-xl font-bold text-primary">
                              ₺{product.price}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button className="btn btn-primary btn-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.3 3H19M7 13v0a1 1 0 001 1h10a1 1 0 001-1v0M9 19v0a1 1 0 001 1h0a1 1 0 001-1v0M20 19v0a1 1 0 01-1 1h0a1 1 0 01-1-1v0" />
                              </svg>
                              Sepete Ekle
                            </button>
                            <button className="btn btn-ghost btn-sm">
                              Detay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">Ürün Bulunamadı</h3>
                  <p className="text-gray-500 mb-4">Arama kriterlerinizi değiştirin veya filtreleri temizleyin.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleResetFilters}
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </>
          )}

          {/* Sayfalama */}
          {!loading && products && products.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="btn-group">
                
                {/* Önceki Sayfa */}
                <button 
                  className="btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  «
                </button>
                
                {/* İlk Sayfa */}
                {pages[0] > 1 && (
                  <>
                    <button 
                      className="btn"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                    {pages[0] > 2 && <span className="btn btn-disabled">...</span>}
                  </>
                )}
                
                {/* Sayfa Numaraları */}
                {pages.map((page) => (
                  <button 
                    key={page}
                    className={`btn ${currentPage === page ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                {/* Son Sayfa */}
                {pages[pages.length - 1] < totalPages && (
                  <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="btn btn-disabled">...</span>}
                    <button 
                      className="btn"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                {/* Sonraki Sayfa */}
                <button 
                  className="btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
