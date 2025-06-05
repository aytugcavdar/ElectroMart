// frontend/src/utils/localStorageCart.js
const LOCAL_STORAGE_CART_KEY = 'electroMartGuestCart';

export const getLocalCart = () => {
    try {
        const serializedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
        if (serializedCart === null) {
            return []; // Sepet yoksa boş dizi döndür
        }
        return JSON.parse(serializedCart);
    } catch (error) {
        console.error("Local storage'dan sepet okunurken hata oluştu:", error);
        return [];
    }
};

export const saveLocalCart = (cartItems) => {
    try {
        const serializedCart = JSON.stringify(cartItems);
        localStorage.setItem(LOCAL_STORAGE_CART_KEY, serializedCart);
    } catch (error) {
        console.error("Sepet local storage'a kaydedilirken hata oluştu:", error);
    }
};

export const clearLocalCart = () => {
    try {
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    } catch (error) {
        console.error("Local storage'dan sepet silinirken hata oluştu:", error);
    }
};