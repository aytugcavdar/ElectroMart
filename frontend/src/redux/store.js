import {configureStore} from '@reduxjs/toolkit';

import authReducer from './authSlice';
import brandReducer from './brandSlice';
import categoryReducer from './categorySlice';
import productReducer from './productSlice';




export const store = configureStore({
  reducer: {
    auth: authReducer,
    brand: brandReducer,
    category: categoryReducer,
    product: productReducer
  },
  
});

export default store;