import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ products, loading }) => {
  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  // Helper function to safely render text content
  const renderSafeText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // Try common object properties
      return value.name || value.title || value.text || value.content || fallback;
    }
    return fallback;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <figure className="px-4 pt-4">
            <div className="skeleton h-48 w-full rounded-xl"></div>
          </figure>
          <div className="card-body">
            <div className="skeleton h-6 w-3/4 mb-2"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-2/3 mb-4"></div>
            <div className="card-actions justify-between items-center">
              <div className="skeleton h-6 w-16"></div>
              <div className="skeleton h-10 w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-primary mb-2">
          Ürünlerimiz
        </h2>
        <p className="text-base-content/70 max-w-2xl mx-auto">
          Özenle hazırlanmış muhteşem ürün koleksiyonumuzu keşfedin
        </p>
        <div className="divider max-w-xs mx-auto"></div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">Ürün Bulunamadı</h3>
          <p className="text-base-content/50">Şu anda gösterilecek ürün bulunmuyor.</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product._id} 
              className="card bg-base-100 shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleProductClick(product._id)}
            >
              {/* Product Image */}
              <figure className="px-4 pt-4 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="rounded-xl h-48 w-full object-cover transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/300/200';
                  }}
                />
                {/* Discount Badge */}
                {product.discount && (
                  <div className="badge badge-secondary absolute top-6 right-6">
                    -%{product.discount}
                  </div>
                )}
                {/* New Badge */}
                {product.isNew && (
                  <div className="badge badge-accent absolute top-6 left-6">
                    Yeni
                  </div>
                )}
              </figure>

              {/* Product Details */}
              <div className="card-body p-4">
                {/* Category */}
                {product.category && (
                  <div className="badge badge-outline badge-sm mb-2">
                    {renderSafeText(product.category)}
                  </div>
                )}

                {/* Title */}
                <h3 className="card-title text-lg mb-2 line-clamp-1 transition-colors">
                  {renderSafeText(product.title, 'İsimsiz Ürün')}
                </h3>

                {/* Description */}
                <p className="text-base-content/70 text-sm line-clamp-2 mb-3">
                  {renderSafeText(product.description, 'Açıklama mevcut değil')}
                </p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <div className="rating rating-sm">
                      {[...Array(5)].map((_, i) => (
                        <input
                          key={i}
                          type="radio"
                          className={`mask mask-star-2 ${
                            i < Math.floor(product.rating) ? 'bg-orange-400' : 'bg-gray-300'
                          }`}
                          disabled
                        />
                      ))}
                    </div>
                    <span className="text-sm text-base-content/60 ml-1">
                      ({product.rating})
                    </span>
                  </div>
                )}

                {/* Price and Action */}
                <div className="card-actions justify-between items-center mt-auto">
                  <div className="flex flex-col">
                    {product.originalPrice && product.originalPrice !== product.price && (
                      <span className="text-sm text-base-content/50 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-bold text-primary">
                      ${product.price}
                    </span>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product._id);
                    }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Görüntüle
                  </button>
                </div>

                {/* Stock Status */}
                {product.stock !== undefined && (
                  <div className="mt-2">
                    {product.stock > 0 ? (
                      <div className="badge badge-success badge-sm">
                        {product.stock > 10 ? 'Stokta Var' : `Sadece ${product.stock} adet kaldı`}
                      </div>
                    ) : (
                      <div className="badge badge-error badge-sm">Stokta Yok</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (if needed) */}
      {!loading && products.length > 0 && products.length % 5 === 0 && (
        <div className="text-center mt-12">
          <button className="btn btn-outline btn-primary">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;