import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    categories: [],
    products: [],
    category: null,
    loading: false,
    error: null,
};


const API_URL = "http://localhost:4000/api/v1/category/";

export const addCategory = createAsyncThunk(
    "category/addCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(categoryData),
            });
            if (!response.ok) {
                throw new Error("Failed to add category");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const getCategories = createAsyncThunk(
    "category/getCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}`,{

                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const getCategory = createAsyncThunk(
    "category/getCategory",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch category");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(categoryData),
            });
            if (!response.ok) {
                throw new Error("Failed to update category");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const deleteCategory = createAsyncThunk(
    "category/deleteCategory",
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
                throw new Error("Failed to delete category");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        setCategory: (state, action) => {
            state.category = action.payload;
        },
        clearCategory: (state) => {
            state.category = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.push(action.payload);
            })
            .addCase(addCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.data;
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCategory.fulfilled, (state, action) => {
                state.loading = false;               
                state.category = action.payload.data;
                state.products = action.payload.products;
            })
            .addCase(getCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(
                    (category) => category._id === action.payload._id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload;
                    if (state.category && state.category._id === action.payload._id) {
                        state.category = action.payload; // Update the selected category
                    }
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(
                    (category) => category._id === action.payload._id
                );
                if (index !== -1) {
                    state.categories.splice(index, 1);
                    if (state.category && state.category._id === action.payload._id) {
                        state.category = null; // Clear the selected category
                    }
                }
            }
            )
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default categorySlice.reducer;