import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  // Slice'ınızda bu selector'ları tanımlayın
  // selectAllBrands, selectBrandStatus, selectBrandError
} from "../../redux/brandSlice"; 
import BrandForm from "./BrandForm"; // Yeni formu import et

const BrandManagement = () => {
  const dispatch = useDispatch();
  
  // Slice'ınızdaki selector'ların isimlerine göre güncelleyin
  const brands = useSelector((state) => state.brand.brands || []); 
  const brandStatus = useSelector((state) => state.brand.status); 
  const brandError = useSelector((state) => state.brand.error);

  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); 

  useEffect(() => {
    // Başlangıçta veya ihtiyaç duyulduğunda çekmek için
    // if (brandStatus === 'idle' || brands.length === 0) {
        dispatch(getBrands());
    // }
  }, [dispatch]); // brands.length bağımlılığını kaldırarak sürekli veri çekme riskini azaltın

  const handleAddNew = () => {
    setEditingBrand(null);
    setShowForm(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  const handleSubmitForm = async (brandData) => {
    try {
      if (editingBrand) {
        await dispatch(updateBrand({ id: editingBrand._id, ...brandData })).unwrap(); // _id MongoDB'den gelir
        // Başarı mesajı
      } else {
        await dispatch(addBrand(brandData)).unwrap();
        // Başarı mesajı
      }
      setShowForm(false);
      setEditingBrand(null);
      dispatch(getBrands()); // Listeyi güncelle
    } catch (err) {
      console.error("Marka işlemi başarısız:", err);
      // Hata mesajı
    }
  };

  const handleDelete = async (brandId) => {
    // DaisyUI modal ile onay sorabilirsiniz
    const confirmDelete = window.confirm("Bu markayı silmek istediğinizden emin misiniz?");
    if (confirmDelete) {
      try {
        await dispatch(deleteBrand(brandId)).unwrap();
        dispatch(getBrands()); // Listeyi güncelle
        // Başarı mesajı
      } catch (err) {
        console.error("Marka silinemedi:", err);
        // Hata mesajı
      }
    }
  };

  if (brandStatus === 'loading' && !showForm) { // Form açıkken yükleme gösterme
    return <div className="flex justify-center items-center h-32"><span className="loading loading-lg loading-spinner text-primary"></span></div>;
  }

  if (brandError && !showForm) {
    return <div role="alert" className="alert alert-error"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>Hata: {brandError.message || brandError}</span></div>;
  }

  return (
    <div className="brand-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Marka Yönetimi</h2>
        {!showForm && (
            <button onClick={handleAddNew} className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Yeni Marka Ekle
            </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">{editingBrand ? "Markayı Düzenle" : "Yeni Marka Oluştur"}</h3>
          <BrandForm 
            onSubmit={handleSubmitForm} 
            initialData={editingBrand || {}} // initialData null olmamalı
            buttonText={editingBrand ? "Değişiklikleri Kaydet" : "Markayı Oluştur"}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {!showForm && brands.length === 0 && brandStatus !== 'loading' && (
        <div role="alert" className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Henüz hiç marka eklenmemiş.</span>
        </div>
      )}

      {!showForm && brands.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Logo</th>
                <th>Marka Adı</th>
                <th>Açıklama</th>
                <th>Web Sitesi</th>
                <th>Kuruluş Yılı</th>
                <th>Öne Çıkan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand._id || brand.id} className="hover"> {/* MongoDB _id kullanır */}
                  <td>
                    {brand.logo && brand.logo !== 'no-logo.png' ? (
                        <div className="avatar">
                            <div className="w-12 h-12 rounded"> 
                            {/* Eğer logo bir URL ise img etiketi kullanın, değilse dosya adı gösterin */}
                            {brand.logo.startsWith('http') || brand.logo.startsWith('/') ? 
                                <img src={brand.logo} alt={brand.name} /> : 
                                <span className="text-xs p-1">{brand.logo}</span>
                            }
                            </div>
                        </div>
                    ) : (
                        <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded w-12 h-12">
                                <span className="text-xl">{brand.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                    )}
                  </td>
                  <td className="font-medium">{brand.name}</td>
                  <td className="text-sm max-w-xs truncate" title={brand.description}>{brand.description}</td>
                  <td>
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="link link-hover link-primary text-sm">
                        Ziyaret Et
                      </a>
                    ) : '-'}
                  </td>
                  <td>{brand.foundedYear || '-'}</td>
                  <td>
                    {brand.featured ? (
                        <span className="badge badge-success badge-sm">Evet</span>
                    ) : (
                        <span className="badge badge-ghost badge-sm">Hayır</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                        <button
                        onClick={() => handleEdit(brand)}
                        className="btn btn-sm btn-outline btn-info"
                        >
                        Düzenle
                        </button>
                        <button
                        onClick={() => handleDelete(brand._id || brand.id)}
                        className="btn btn-sm btn-outline btn-error"
                        >
                        Sil
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
             {brands.length > 5 && ( // Çok fazla satır varsa footer'da da başlıkları göster
                <tfoot className="bg-base-200">
                     <tr>
                        <th>Logo</th>
                        <th>Marka Adı</th>
                        <th>Açıklama</th>
                        <th>Web Sitesi</th>
                        <th>Kuruluş Yılı</th>
                        <th>Öne Çıkan</th>
                        <th>İşlemler</th>
                    </tr>
                </tfoot>
             )}
          </table>
        </div>
      )}
    </div>
  );
};

export default BrandManagement;