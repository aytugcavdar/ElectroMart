import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    products: [],
    product: null,
    loading: false,
    error: null,
    total: null,
    count: null,
    pagination: {},
};

const API_URL = "http://localhost:4000/api/v1/product/";

export const addProduct = createAsyncThunk(
    "product/addProduct",
    async (productData, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(productData),
            });
            if (!response.ok) {
                throw new Error("Failed to add product");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const getProducts = createAsyncThunk(
    "product/getProducts",
   
    async (queryParams = {}, { rejectWithValue }) => {
        try {
            
            const params = new URLSearchParams();
            
            for (const [key, value] of Object.entries(queryParams)) {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            }

            const queryString = params.toString();
            const url = `${API_URL}${queryString ? `?${queryString}` : ''}`;
            console.log("Fetching products from URL:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const getProduct = createAsyncThunk(
    "product/getProduct",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch product");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const updateProduct = createAsyncThunk(
    "product/updateProduct",
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(productData),
            });
            if (!response.ok) {
                throw new Error("Failed to update product");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const deleteProduct = createAsyncThunk(
    "product/deleteProduct",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to delete product");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data;
                state.total = action.payload.total;
                state.count = action.payload.count;
                state.pagination = action.payload.pagination;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload.data;
            })
            .addCase(getProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(
                    (product) => product._id === action.payload._id
                );
                if (index !== -1) {
                    state.products[index] = action.payload;
                    state.product = action.payload; // Update the current product as well
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(
                    (product) => product._id !== action.payload._id
                );
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearErrors } = productSlice.actions;
export default productSlice.reducer;
