// frontend/src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = "http://localhost:4000/api/v1/cart/";

const initialState = {
    items: [],
    itemCount: 0,
    totalAmount: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Helper function to calculate totals
const calculateCartTotals = (items) => {
    let itemCount = 0;
    let totalAmount = 0;
    items.forEach(item => {
        itemCount += item.quantity;
        totalAmount += item.quantity * item.price;
    });
    return { itemCount, totalAmount };
};

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Sepet getirilemedi');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (itemData, { rejectWithValue }) => { // itemData: { productId, quantity, price, name, image }
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(itemData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Ürün sepete eklenemedi');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCartItemQuantity = createAsyncThunk(
    'cart/updateCartItemQuantity',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            const response = await fetch(`<span class="math-inline">\{API\_URL\}</span>{itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Sepet öğesi güncellenemedi');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (itemId, { rejectWithValue }) => {
        try {
            const response = await fetch(`<span class="math-inline">\{API\_URL\}</span>{itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Ürün sepetten silinemedi');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const clearUserCart = createAsyncThunk(
    'cart/clearUserCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                credentials: 'include',
            });
             if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Sepet temizlenemedi');
            }
            const data = await response.json();
            return data.data; // Boş sepeti döndürür
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartState: (state) => { 
            state.items = [];
            state.itemCount = 0;
            state.totalAmount = 0;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        const handlePending = (state) => {
            state.status = 'loading';
            state.error = null;
        };
        const handleFulfilled = (state, action) => {
            state.status = 'succeeded';
            state.items = action.payload.items || [];
            const { itemCount, totalAmount } = calculateCartTotals(state.items);
            state.itemCount = itemCount;
            state.totalAmount = totalAmount;
        };
        const handleRejected = (state, action) => {
            state.status = 'failed';
            state.error = action.payload || 'Bir hata oluştu';
        };

        builder
            .addCase(fetchCart.pending, handlePending)
            .addCase(fetchCart.fulfilled, handleFulfilled)
            .addCase(fetchCart.rejected, handleRejected)
            .addCase(addToCart.pending, handlePending)
            .addCase(addToCart.fulfilled, handleFulfilled)
            .addCase(addToCart.rejected, handleRejected)
            .addCase(updateCartItemQuantity.pending, handlePending)
            .addCase(updateCartItemQuantity.fulfilled, handleFulfilled)
            .addCase(updateCartItemQuantity.rejected, handleRejected)
            .addCase(removeFromCart.pending, handlePending)
            .addCase(removeFromCart.fulfilled, handleFulfilled)
            .addCase(removeFromCart.rejected, handleRejected)
            .addCase(clearUserCart.pending, handlePending)
            .addCase(clearUserCart.fulfilled, handleFulfilled) // Backend güncel (boş) sepeti döner
            .addCase(clearUserCart.rejected, handleRejected);
    },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer; 