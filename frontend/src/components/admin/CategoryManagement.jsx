import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  // selectAllCategories, selectCategoryStatus, selectCategoryError
} from "../../redux/categorySlice";
import CategoryForm from "./CategoryForm";

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.category.categories || []);
  const categoryStatus = useSelector((state) => state.category.status);
  const categoryError = useSelector((state) => state.category.error);
  
  // parentCategory isimlerini göstermek için tüm kategorileri alalım
  const allCategoriesForName = useSelector((state) => state.category.categories || []);


  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    // if (categoryStatus === 'idle' || categories.length === 0) {
        dispatch(getCategories());
    // }
  }, [dispatch]);

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmitForm = async (categoryData) => {
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory._id, ...categoryData })).unwrap();
      } else {
        await dispatch(addCategory(categoryData)).unwrap();
      }
      setShowForm(false);
      setEditingCategory(null);
      dispatch(getCategories());
    } catch (err) {
      console.error("Kategori işlemi başarısız:", err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Alt kategorileri varsa bu işlem sorun yaratabilir!")) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        dispatch(getCategories());
      } catch (err) {
        console.error("Kategori silinemedi:", err);
      }
    }
  };
  
  const getCategoryNameById = (id) => {
    const foundCategory = allCategoriesForName.find(cat => cat._id === id);
    return foundCategory ? foundCategory.name : 'Yok';
  };


  if (categoryStatus === 'loading' && !showForm) {
    return <div className="flex justify-center items-center h-32"><span className="loading loading-lg loading-spinner text-primary"></span></div>;
  }
  
  if (categoryError && !showForm) {
     return <div role="alert" className="alert alert-error"><span>Hata: {categoryError.message || categoryError}</span></div>;
  }

  return (
    <div className="category-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Kategori Yönetimi</h2>
        {!showForm && (
             <button onClick={handleAddNew} className="btn btn-primary">Yeni Kategori Ekle</button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
           <h3 className="text-xl font-medium mb-3">{editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}</h3>
          <CategoryForm 
            onSubmit={handleSubmitForm} 
            initialData={editingCategory || {}}
            buttonText={editingCategory ? "Değişiklikleri Kaydet" : "Kategoriyi Oluştur"}
            onCancel={handleCancelForm}
          />
        </div>
      )}
      
      {!showForm && categories.length === 0 && categoryStatus !== 'loading' && (
         <div role="alert" className="alert alert-info"><span>Henüz hiç kategori eklenmemiş.</span></div>
      )}

      {!showForm && categories.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>İkon</th>
                <th>Kategori Adı</th>
                <th>Açıklama</th>
                <th>Üst Kategori</th>
                <th>Sıra</th>
                <th>Öne Çıkan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="hover">
                  <td>{category.icon && <i className={`fa ${category.icon}`}></i>}</td>
                  <td className="font-medium">{category.name}</td>
                  <td className="text-sm max-w-xs truncate" title={category.description}>{category.description}</td>
                  <td>{category.parentCategory ? getCategoryNameById(category.parentCategory) : 'Ana Kategori'}</td>
                  <td>{category.order}</td>
                  <td>{category.featured ? <span className="badge badge-success badge-sm">Evet</span> : <span className="badge badge-ghost badge-sm">Hayır</span>}</td>
                  <td>
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(category)} className="btn btn-sm btn-outline btn-info">Düzenle</button>
                        <button onClick={() => handleDelete(category._id)} className="btn btn-sm btn-outline btn-error">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;