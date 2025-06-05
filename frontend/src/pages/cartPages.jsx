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
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Sepetim</h1>
                <p className="mb-4">Sepetinizi görüntülemek için lütfen giriş yapın.</p>
                <Link to="/auth" className="btn btn-primary">Giriş Yap</Link>
            </div>
        );
    }

    if (status === 'loading') {
        return <div className="container mx-auto p-4 text-center"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    if (status === 'failed') {
        return <div className="container mx-auto p-4 text-center alert alert-error">Hata: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-primary">Sepetim</h1>
            {items.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500 mb-4">Sepetiniz şu anda boş.</p>
                    <Link to="/products" className="btn btn-primary">Alışverişe Başla</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item._id || item.product?._id} className="card card-side bg-base-100 shadow-md">
                                <figure className="w-24 h-24 md:w-32 md:h-32 p-2">
                                    <img 
                                        src={item.image || item.product?.images?.[0]?.url || '/default-product.png'} 
                                        alt={item.name || item.product?.title} 
                                        className="object-contain w-full h-full rounded"
                                    />
                                </figure>
                                <div className="card-body p-4">
                                    <h2 className="card-title text-lg">{item.name || item.product?.title}</h2>
                                    <p className="text-primary font-semibold">{item.price.toLocaleString('tr-TR')} ₺</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <label htmlFor={`quantity-${item._id}`} className="text-sm">Miktar:</label>
                                        <input 
                                            type="number"
                                            id={`quantity-${item._id}`}
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                                            className="input input-bordered input-sm w-20 text-center"
                                            // max={item.product?.stock} // Stok kontrolü backendde yapılıyor
                                        />
                                    </div>
                                    <div className="card-actions justify-end">
                                        <button 
                                            onClick={() => handleRemoveItem(item._id)}
                                            className="btn btn-ghost btn-sm text-error"
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="card bg-base-200 shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Ara Toplam ({itemCount} ürün)</span>
                                    <span>{totalAmount.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                {/* Kargo, indirim vb. eklenebilir */}
                                <div className="divider"></div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Toplam</span>
                                    <span>{totalAmount.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>
                            <button className="btn btn-primary w-full mb-2">Siparişi Tamamla</button>
                            <button 
                                onClick={handleClearCart}
                                className="btn btn-outline btn-error w-full"
                            >
                                Sepeti Boşalt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;