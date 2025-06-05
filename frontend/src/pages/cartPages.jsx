// frontend/src/pages/CartPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart, updateCartItemQuantity, removeFromCart, clearUserCart } from '../redux/cartSlice';

const CartPage = () => {
    const dispatch = useDispatch();
    const { items, itemCount, totalAmount, status, error } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity >= 1) {
            dispatch(updateCartItemQuantity({ itemId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (itemId) => {
        dispatch(removeFromCart(itemId));
    };

    const handleClearCart = () => {
        if(window.confirm('Sepeti boşaltmak istediğinizden emin misiniz?')) {
            dispatch(clearUserCart());
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
                <div className="card w-full max-w-md bg-base-100 shadow-2xl">
                    <div className="card-body text-center">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-base-content mb-2">Sepetim</h1>
                        <p className="text-base-content/70 mb-6">Sepetinizi görüntülemek için lütfen giriş yapın.</p>
                        <Link to="/auth" className="btn btn-primary btn-lg w-full">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-base-content/70">Sepetiniz yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
                <div className="alert alert-error max-w-md">
                    <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Hata: {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
            <div className="container mx-auto p-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">🛒 Sepetim</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                </div>

                {items.length === 0 ? (
                    /* Empty Cart */
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-32 h-32 bg-base-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                            <svg className="w-16 h-16 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-base-content mb-4">Sepetiniz Boş</h2>
                        <p className="text-base-content/60 mb-8 text-center max-w-md">
                            Henüz sepetinize ürün eklememişsiniz. Harika ürünlerimizi keşfetmek için alışverişe başlayın!
                        </p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Alışverişe Başla
                        </Link>
                    </div>
                ) : (
                    /* Cart with Items */
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Cart Items */}
                        <div className="xl:col-span-3 space-y-4">
                            <div className="bg-base-100 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-base-content">
                                        Sepetinizdeki Ürünler ({itemCount} ürün)
                                    </h2>
                                    <button 
                                        onClick={handleClearCart}
                                        className="btn btn-outline btn-error btn-sm"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Sepeti Boşalt
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={item._id || item.product?._id} 
                                             className="card card-side bg-gradient-to-r from-base-50 to-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
                                            <figure className="w-24 h-24 md:w-32 md:h-32 p-3">
                                                <div className="avatar">
                                                    <div className="w-full rounded-xl">
                                                        <img 
                                                            src={item.image || item.product?.images?.[0]?.url || '/default-product.png'} 
                                                            alt={item.name || item.product?.title}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                </div>
                                            </figure>
                                            <div className="card-body p-4 flex-1">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-base-content line-clamp-1">
                                                            {item.name || item.product?.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="badge badge-primary badge-sm">#{index + 1}</span>
                                                            <span className="text-primary font-bold text-lg">
                                                                {item.price.toLocaleString('tr-TR')} ₺
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">Miktar:</span>
                                                            <div className="join">
                                                                <button 
                                                                    className="join-item btn btn-sm btn-outline"
                                                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                                    </svg>
                                                                </button>
                                                                <input 
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                                                    className="join-item input input-sm input-bordered w-16 text-center font-medium"
                                                                />
                                                                <button 
                                                                    className="join-item btn btn-sm btn-outline"
                                                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button 
                                                            onClick={() => handleRemoveItem(item._id)}
                                                            className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                                                            title="Ürünü kaldır"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Subtotal */}
                                                <div className="text-right mt-2">
                                                    <span className="text-sm text-base-content/60">Ara Toplam: </span>
                                                    <span className="font-bold text-secondary">
                                                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="xl:col-span-1">
                            <div className="sticky top-4">
                                <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300">
                                    <div className="card-body p-6">
                                        <h2 className="card-title text-xl mb-4 text-primary flex items-center">
                                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Sipariş Özeti
                                        </h2>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-base-content/70">Ürün Sayısı</span>
                                                <span className="badge badge-primary">{itemCount}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-base-content/70">Ara Toplam</span>
                                                <span className="font-semibold">{totalAmount.toLocaleString('tr-TR')} ₺</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-base-content/70">Kargo</span>
                                                <span className="badge badge-success">Ücretsiz</span>
                                            </div>
                                            
                                            <div className="divider my-2"></div>
                                            
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-lg font-bold">Toplam</span>
                                                <span className="text-xl font-bold text-primary">
                                                    {totalAmount.toLocaleString('tr-TR')} ₺
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 mt-6">
                                            <button className="btn btn-primary btn-lg w-full shadow-lg hover:shadow-xl transition-all duration-300">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                Siparişi Tamamla
                                            </button>
                                            
                                            <Link to="/products" className="btn btn-outline w-full">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h14" />
                                                </svg>
                                                Alışverişe Devam Et
                                            </Link>
                                        </div>
                                        
                                        {/* Security Badge */}
                                        <div className="alert alert-success mt-4">
                                            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span className="text-sm">🔒 Güvenli ödeme garantisi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;