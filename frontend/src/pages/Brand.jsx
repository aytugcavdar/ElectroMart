import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getBrands } from '../redux/brandSlice'

const Brand = () => {
  const dispatch = useDispatch()
  const { brands, loading, error } = useSelector((state) => state.brand)

  console.log(brands)

  const navigate = useNavigate()

  const handleBrandClick = (brandId) => {
    navigate(`/brands/${brandId}`)
  }

  useEffect(() => {
    dispatch(getBrands())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="hero bg-base-100 rounded-lg shadow-xl p-8 mb-8">
        <div className="hero-content text-center">
          <div>
            <h1 className="text-5xl font-bold text-primary">Markalarımız</h1>
            <p className="py-6 text-lg">Kaliteli markalarımızı keşfedin.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <button className="btn btn-ghost loading">Yükleniyor...</button>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg max-w-xl mx-auto">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Hata: {error}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand._id}
              onClick={() => handleBrandClick(brand._id)}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
            >
              <figure className="px-4 pt-4">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="rounded-xl h-64 w-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-primary">{brand.name}</h2>
                <p className="text-sm text-base-content opacity-70">{brand.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Brand
