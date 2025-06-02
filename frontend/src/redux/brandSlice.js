import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";


const initialState = {
    brands: [],
    brand: null,
    loading: false,
    error: null,
};
const API_URL = "http://localhost:4000/api/v1/brand/";

export const addBrand = createAsyncThunk(
    "brand/addBrand",
    async (brandData, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(brandData),
            });
            if (!response.ok) {
                throw new Error("Failed to add brand");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getBrands = createAsyncThunk(
    "brand/getBrands",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch brands");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getBrand = createAsyncThunk(
    "brand/getBrand",
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
                throw new Error("Failed to fetch brand");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBrand = createAsyncThunk(
    "brand/updateBrand",
    async ({ id, brandData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(brandData),
            });
            if (!response.ok) {
                throw new Error("Failed to update brand");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBrand = createAsyncThunk(
    "brand/deleteBrand",
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
                throw new Error("Failed to delete brand");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const brandSlice = createSlice({
    name: "brand",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
        clearBrand: (state) => {
            state.brand = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addBrand.pending, (state) => {
                state.loading = true;
            })
            .addCase(addBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands.push(action.payload);
            })
            .addCase(addBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBrands.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = action.payload.data;
            })
            .addCase(getBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getBrand.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brand = action.payload.data;
            })
            .addCase(getBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateBrand.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.brands.findIndex((brand) => brand._id === action.payload._id);
                if (index !== -1) {
                    state.brands[index] = action.payload;
                    if (state.brand && state.brand._id === action.payload._id) {
                        state.brand = action.payload;
                    }
                }
            })
            .addCase(updateBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteBrand.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = state.brands.filter((brand) => brand._id !== action.payload._id);
                if (state.brand && state.brand._id === action.payload._id) {
                    state.brand = null;
                }
            })
            .addCase(deleteBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});
export const { clearErrors, clearBrand } = brandSlice.actions;
export default brandSlice.reducer;