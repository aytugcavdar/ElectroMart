import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProduct } from '../redux/productSlice';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/cartSlice';
import { useState } from 'react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.product);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    dispatch(getProduct(id));
  }, [dispatch, id]);


  const increment = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
        toast.error('Ürünü sepete eklemek için giriş yapmalısınız.');
        navigate('/auth');
        return;
    }
    if (product && product.stock > 0) {
      dispatch(addToCart({
        productId: product._id,
        quantity: quantity, 
        price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
        name: product.title,
        image: product.images?.[0]?.url || '/default-product.png'
      }))
      .unwrap()
      .then(() => {
        toast.success(`${product.title} sepete eklendi!`);
      })
      .catch((err) => {
        toast.error(`Hata: ${err || 'Ürün sepete eklenemedi.'}`);
      });
    } else {
        toast.warn('Bu ürün şu anda stokta bulunmuyor.');
    }
  };

  // İndirimli fiyat gösterme fonksiyonu
  const renderPrice = () => {
    if (product.discountPercentage > 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-primary">{product.discountedPrice.toLocaleString('tr-TR')} ₺</span>
          <span className="text-lg line-through text-gray-400">{product.price.toLocaleString('tr-TR')} ₺</span>
          <span className="badge badge-accent">%{product.discountPercentage} İndirim</span>
        </div>
      );
    }
    return <span className="text-3xl font-bold text-primary">{product.price?.toLocaleString('tr-TR')} ₺</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg max-w-4xl mx-auto my-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Hata: {error}</span>
        </div>
      </div>
    );
  }

  if (!product || !product.title) {
    return (
      <div className="alert alert-warning shadow-lg max-w-4xl mx-auto my-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Ürün bulunamadı veya yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb - Fixed */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><a onClick={() => navigate('/')} className="cursor-pointer hover:text-primary">Ana Sayfa</a></li>
          {/* Parent Category */}
          {product.category?.parentCategory && (
            <li>
              <a 
                onClick={() => navigate('/category/' + product.category.parentCategory._id)} 
                className="cursor-pointer hover:text-primary"
              >
                {product.category.parentCategory.name}
              </a>
            </li>
          )}
          {/* Current Category */}
          {product.category && (
            <li>
              <a 
                onClick={() => navigate('/category/' + product.category._id)} 
                className="cursor-pointer hover:text-primary"
              >
                {product.category.name}
              </a>
            </li>
          )}
          <li className="text-gray-500">{product.title}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ürün Görseli */}
        <div className="card bg-base-100 shadow-xl">
          <figure className="px-4 pt-4">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0].url} 
                alt={product.title} 
                className="rounded-xl object-contain h-96 w-full"
              />
            ) : (
              <div className="flex justify-center items-center h-96 w-full bg-gray-100 rounded-xl">
                <span className="text-gray-400">Görsel Mevcut Değil</span>
              </div>
            )}
          </figure>
          
          {/* Küçük görseller - eğer birden fazla resim varsa */}
          {product.images && product.images.length > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {product.images.map((image, index) => (
                <div key={image.id || index} className="avatar">
                  <div className="w-16 rounded cursor-pointer hover:ring hover:ring-primary">
                    <img src={image.url} alt={`${product.title} - ${index + 1}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Detayları */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h1 className="card-title text-3xl mb-2">{product.title}</h1>
              {product.isNewProduct && <div className="badge badge-secondary">Yeni</div>}
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="rating rating-sm">
                {[...Array(5)].map((_, i) => (
                  <input 
                    key={i} 
                    type="radio" 
                    name="rating-2" 
                    className={`mask mask-star-2 ${i < Math.round(product.rating || 0) ? 'bg-orange-400' : 'bg-gray-300'}`} 
                    disabled
                  />
                ))}
              </div>
              <span>({product.totalReviews || 0} Değerlendirme)</span>
              <span className="text-gray-500">|</span>
              <span className="badge badge-outline">SKU: {product.sku}</span>
            </div>
            
            <div className="mb-6">
              {renderPrice()}
            </div>
            
            <div className="divider"></div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Marka:</span>
                <span>{product.brand?.name || 'Belirtilmemiş'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">Kategori:</span>
                <span>{product.category?.name || 'Belirtilmemiş'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">Stok Durumu:</span>
                {product.inStock ? (
                  <span className="text-success flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Stokta ({product.stock} adet)
                  </span>
                ) : (
                  <span className="text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Stokta Yok
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">Garanti:</span>
                <span>{product.warranty || 0} Ay</span>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="card-actions">
              <div className="join">
                <button className="btn btn-outline join-item" onClick={decrement}>-</button>
                <input className="input input-bordered join-item w-20 text-center" type="text" value={quantity} readOnly />
                <button className="btn btn-outline join-item" onClick={increment}>+</button>
              </div>
              
              <button 
                className="btn btn-primary flex-grow" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Sepete Ekle
              </button>
              
              <button className="btn btn-outline btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ürün Özellikleri ve Diğer Bilgiler */}
      <div className="mt-12">
        <div className="tabs tabs-boxed justify-center mb-6">
          <a className="tab tab-active">Özellikler</a>
          <a className="tab">Yorumlar ({product.totalReviews || 0})</a>
          <a className="tab">Teslimat Bilgisi</a>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Teknik Özellikler</h2>
            
            {product.specifications && product.specifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr key={index}>
                        <td className="font-medium w-1/3">{spec.name}</td>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Bu ürün için henüz teknik özellik bilgisi girilmemiştir.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;