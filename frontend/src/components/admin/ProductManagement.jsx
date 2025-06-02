import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  // selectAllProducts, selectProductStatus, selectProductError
} from "../../redux/productSlice";
// Marka ve kategori isimlerini almak için selector'lar
// import { selectAllBrands } from "../../redux/brandSlice";
// import { selectAllCategories } from "../../redux/categorySlice";
import ProductForm from "./ProductForm";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products || []);
  const productStatus = useSelector((state) => state.product.status);
  const productError = useSelector((state) => state.product.error);
  
  // Marka ve kategori isimlerini göstermek için
  const brands = useSelector((state) => state.brand.brands || []);
  const categories = useSelector((state) => state.category.categories || []);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // if (productStatus === 'idle' || products.length === 0) {
        dispatch(getProducts());
    // }
    // Form için markalar ve kategoriler de çekilmeli, Admin.jsx zaten çekiyor.
    // Eğer çekilmiyorsa burada dispatch(getBrands()); dispatch(getCategories()); yapılabilir.
  }, [dispatch]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmitForm = async (productData) => {
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, ...productData })).unwrap();
      } else {
        await dispatch(addProduct(productData)).unwrap();
      }
      setShowForm(false);
      setEditingProduct(null);
      dispatch(getProducts());
    } catch (err) {
      console.error("Ürün işlemi başarısız:", err);
       // Hata mesajı (örneğin bir toast notification ile)
      alert(`Ürün işlemi başarısız: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        dispatch(getProducts());
      } catch (err) {
        console.error("Ürün silinemedi:", err);
      }
    }
  };
  
  const getBrandName = (brandId) => brands.find(b => b._id === brandId)?.name || 'Bilinmiyor';
  const getCategoryName = (categoryId) => categories.find(c => c._id === categoryId)?.name || 'Bilinmiyor';


  if (productStatus === 'loading' && !showForm) {
    return <div className="flex justify-center items-center h-32"><span className="loading loading-lg loading-spinner text-primary"></span></div>;
  }
  if (productError && !showForm) {
    return <div role="alert" className="alert alert-error"><span>Hata: {productError.message || productError}</span></div>;
  }

  return (
    <div className="product-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ürün Yönetimi</h2>
         {!showForm && (
             <button onClick={handleAddNew} className="btn btn-primary">Yeni Ürün Ekle</button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Oluştur"}</h3>
          <ProductForm 
            onSubmit={handleSubmitForm} 
            initialData={editingProduct || {}}
            buttonText={editingProduct ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {!showForm && products.length === 0 && productStatus !== 'loading' && (
        <div role="alert" className="alert alert-info"><span>Henüz hiç ürün eklenmemiş.</span></div>
      )}

      {!showForm && products.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Resim</th>
                <th>Ürün Adı</th>
                <th>SKU</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>Marka</th>
                <th>Kategori</th>
                <th>Öne Çıkan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
                return (
                    <tr key={product._id} className="hover">
                    <td>
                        {mainImage?.url ? (
                        <div className="avatar">
                            <div className="w-12 h-12 rounded">
                                <img src={mainImage.url} alt={product.title} />
                            </div>
                        </div>
                        ) : (
                        <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded w-12 h-12">
                                <span className="text-xs">{product.title?.substring(0,3)}</span>
                            </div>
                        </div>
                        )}
                    </td>
                    <td className="font-medium max-w-xs truncate" title={product.title}>{product.title}</td>
                    <td>{product.sku}</td>
                    <td>{product.price?.toFixed(2)} TL</td>
                    <td>{product.stock}</td>
                    <td>{getBrandName(product.brand)}</td>
                    <td>{getCategoryName(product.category)}</td>
                    <td>{product.featured ? <span className="badge badge-success badge-sm">Evet</span> : <span className="badge badge-ghost badge-sm">Hayır</span>}</td>
                    <td>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(product)} className="btn btn-sm btn-outline btn-info">Düzenle</button>
                            <button onClick={() => handleDelete(product._id)} className="btn btn-sm btn-outline btn-error">Sil</button>
                        </div>
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;