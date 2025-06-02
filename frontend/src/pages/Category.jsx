import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCategories } from '../redux/categorySlice'

const Category = () => {
  const dispatch = useDispatch()
  const { categories, loading, error } = useSelector((state) => state.category)
  const navigate = useNavigate()
  
  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="alert alert-error w-96 shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  // Ana kategorileri filtrele (alt kategorileri olan ve ana kategorisi bulunan)
  const mainCategories = categories.filter(category => 
    category.subcategories.length !== 0 && category.parentCategory !== null
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Kategoriler</h1>
        <div className="divider w-1/4 mx-auto"></div>
        <p className="text-gray-600">Tüm kategorilerimizi keşfedin</p>
      </div>

      {mainCategories.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Henüz kategori bulunmamaktadır.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainCategories.map((category) => (
            <div key={category._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body">
                <h2 className="card-title text-primary">
                  {category.name}
                  <div className="badge badge-secondary">{category.subcategories.length}</div>
                </h2>
                <div className="divider my-1"></div>
                <ul className="menu bg-base-100 w-full p-0">
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory._id}>
                      <button 
                        onClick={() => navigate(`/category/${subcategory._id}`)}
                        className="flex justify-between hover:bg-base-200 rounded-lg p-2"
                      >
                        <span>{subcategory.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate(`/category/${category._id}`)}
                  >
                    Tümünü Gör
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Category