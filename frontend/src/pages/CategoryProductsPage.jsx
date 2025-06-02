import React from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCategory } from '../redux/categorySlice'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ProductCard from '../components/ProductCard'

const CategoryProductsPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { category, products, loading, error } = useSelector((state) => state.category)
    const navigate = useNavigate()
    
    useEffect(() => {
        dispatch(getCategory(id))
    }, [dispatch, id])
    
    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        )
    }
    
    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button 
                        className="btn btn-primary mt-4"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }
    
    // No category data
    if (!category || category.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Kategori bulunamadı.</p>
                    <button 
                        className="btn btn-primary mt-4"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">{category.name}</h1>
                <button 
                    className="btn btn-outline btn-primary"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
            <div className="divider w-1/4 mx-auto"></div>
            
            {/* Check if products exist before rendering ProductCard */}
            
            {products && products.length > 0 ? (
                <ProductCard products={products} />
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-600">Bu kategoride ürün bulunmamaktadır.</p>
                </div>
            )}
        </div>
    )
}

export default CategoryProductsPage