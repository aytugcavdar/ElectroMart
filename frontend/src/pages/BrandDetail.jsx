import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBrand } from '../redux/brandSlice';
import ProductCard from '../components/ProductCard';

const BrandDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { brand, loading, error } = useSelector((state) => state.brand);
  
  useEffect(() => {
    dispatch(getBrand(id));
  }, [dispatch, id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Brand Detail</h1>
        <button 
          className="btn btn-outline btn-primary" 
          onClick={handleGoBack}
        >
          Go Back
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Brand details */}
      {brand && (
        <div className="card lg:card-side bg-base-100 shadow-xl mb-8">
          <figure className="lg:w-1/3 p-6">
            <img 
              src={brand.image} 
              alt={brand.name} 
              className="rounded-xl object-cover w-full h-full"
            />
          </figure>
          <div className="card-body lg:w-2/3">
            <h2 className="card-title text-2xl">{brand.name}</h2>
            <div className="divider my-2"></div>
            <p className="text-lg">{brand.description}</p>
          </div>
        </div>
      )}

      {/* Products list */}
      {brand && brand.products && (
        <ProductCard products={brand.products} />
      )}

      {/* Empty state */}
      {brand && (!brand.products || brand.products.length === 0) && (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No products found for this brand.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDetail;