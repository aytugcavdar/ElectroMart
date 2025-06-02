import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Kategorileri çekmek için

const CategoryForm = ({ onSubmit, initialData = {}, buttonText = "Kaydet", onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "fa-folder",
    image: "", // URL veya dosya adı
    parentCategory: null, // Veya ""
    featured: false,
    order: 0,
  });

  // Diğer kategorileri store'dan çek (parentCategory seçimi için)
  const categories = useSelector((state) => state.category.categories || []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        icon: initialData.icon || "fa-folder",
        image: initialData.image || "",
        parentCategory: initialData.parentCategory?._id || initialData.parentCategory || null, // Objeden ID'yi al veya direkt ID
        featured: initialData.featured || false,
        order: initialData.order || 0,
      });
    } else {
        setFormData({
            name: "",
            description: "",
            icon: "fa-folder",
            image: "",
            parentCategory: null,
            featured: false,
            order: 0,
        });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "parentCategory" && value === "" ? null : value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { 
        ...formData,
        order: Number(formData.order)
    };
    // parentCategory boş string ise null olarak gönder
    if (dataToSubmit.parentCategory === "") {
        dataToSubmit.parentCategory = null;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6 border rounded-lg shadow bg-base-200">
      <div className="form-control">
        <label className="label"><span className="label-text">Kategori Adı*</span></label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Kategori adı" className="input input-bordered w-full" required maxLength="50" />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Açıklama*</span></label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Kategori açıklaması" className="textarea textarea-bordered w-full h-24" required maxLength="500"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
            <label className="label"><span className="label-text">İkon (örn: fa-tag)</span></label>
            <input type="text" name="icon" value={formData.icon} onChange={handleChange} placeholder="FontAwesome ikonu" className="input input-bordered w-full" />
        </div>
        <div className="form-control">
            <label className="label"><span className="label-text">Resim URL'i</span></label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Resim URL'i" className="input input-bordered w-full" />
        </div>
      </div>
      
      <div className="form-control">
        <label className="label"><span className="label-text">Üst Kategori</span></label>
        <select 
            name="parentCategory" 
            value={formData.parentCategory || ""} // null ise boş string
            onChange={handleChange} 
            className="select select-bordered w-full"
        >
          <option value="">Ana Kategori (Yok)</option>
          {categories
            .filter(cat => !initialData || cat._id !== initialData._id) // Kendisini üst kategori olarak seçemesin
            .map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="form-control">
            <label className="label"><span className="label-text">Sıralama Değeri</span></label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} placeholder="0" className="input input-bordered w-full" />
        </div>
        <div className="form-control mt-auto"> {/* Checkbox'ı diğer input ile hizalamak için */}
            <label className="label cursor-pointer w-max">
            <span className="label-text mr-4">Öne Çıkan Kategori mi?</span>
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="checkbox checkbox-primary" />
            </label>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-ghost">İptal</button>
        )}
        <button type="submit" className="btn btn-primary">{buttonText}</button>
      </div>
    </form>
  );
};

export default CategoryForm;