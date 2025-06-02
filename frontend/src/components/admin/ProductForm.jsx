import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const ProductForm = ({ onSubmit, initialData = {}, buttonText = "Kaydet", onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    price: 0,
    discountPercentage: 0,
    stock: 0,
    brand: "", // ID
    category: "", // ID
    sku: "",
    warranty: 24,
    featured: false,
    isNewProduct: true,
    isSale: false,
    images: [{ url: "", public_id: "", isMain: false }], // Başlangıç için bir resim alanı
    specifications: [{ name: "", value: "" }], // Başlangıç için bir özellik alanı
  });

  const brands = useSelector((state) => state.brand.brands || []);
  const categories = useSelector((state) => state.category.categories || []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        shortDescription: initialData.shortDescription || "",
        price: initialData.price || 0,
        discountPercentage: initialData.discountPercentage || 0,
        stock: initialData.stock || 0,
        brand: initialData.brand?._id || initialData.brand || "",
        category: initialData.category?._id || initialData.category || "",
        sku: initialData.sku || "",
        warranty: initialData.warranty || 24,
        featured: initialData.featured || false,
        isNewProduct: initialData.isNewProduct === undefined ? true : initialData.isNewProduct,
        isSale: initialData.isSale || false,
        images: initialData.images?.length ? initialData.images : [{ url: "", public_id: "", isMain: true }],
        specifications: initialData.specifications?.length ? initialData.specifications : [{ name: "", value: "" }],
      });
    } else {
        // Yeni kayıt için varsayılanlar
        setFormData({
            title: "", description: "", shortDescription: "", price: 0, discountPercentage: 0, stock: 0,
            brand: "", category: "", sku: "", warranty: 24, featured: false, isNewProduct: true, isSale: false,
            images: [{ url: "", public_id: "", isMain: true }],
            specifications: [{ name: "", value: "" }],
        });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Images ve Specifications için özel handler'lar
  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    // Ana resim ayarlandıysa diğerlerini false yap
    if (field === 'isMain' && value === true) {
        newImages.forEach((img, i) => {
            if (i !== index) img.isMain = false;
        });
    }
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, { url: "", public_id: "", isMain: false }] }));
  };
  const removeImageField = (index) => {
    if (formData.images.length <= 1) return; // En az bir resim alanı kalsın
    const newImages = formData.images.filter((_, i) => i !== index);
     // Eğer silinen ana resim ise ve başka resimler varsa, ilkini ana resim yap
    if (!newImages.some(img => img.isMain) && newImages.length > 0) {
        newImages[0].isMain = true;
    }
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecifications = [...formData.specifications];
    newSpecifications[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecifications }));
  };
  const addSpecificationField = () => {
    setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { name: "", value: "" }] }));
  };
  const removeSpecificationField = (index) => {
    if (formData.specifications.length <=1 && formData.specifications[0].name === "" && formData.specifications[0].value === "" ) return; // Boşsa sonuncuyu silme
    if (formData.specifications.length <= 1) { // Son bir eleman kaldıysa ve doluysa boşalt, silme
        setFormData(prev => ({ ...prev, specifications: [{name: "", value: ""}]}));
        return;
    }
    const newSpecifications = formData.specifications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, specifications: newSpecifications }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
        ...formData,
        price: Number(formData.price),
        discountPercentage: Number(formData.discountPercentage),
        stock: Number(formData.stock),
        warranty: Number(formData.warranty),
        // Images ve Specifications'ın boş elemanlarını filtrele
        images: formData.images.filter(img => img.url.trim() !== ""),
        specifications: formData.specifications.filter(spec => spec.name.trim() !== "" && spec.value.trim() !== "")
    };
    // Ana resim yoksa ve resimler varsa ilkini ana resim yap
    if (dataToSubmit.images.length > 0 && !dataToSubmit.images.some(img => img.isMain)) {
        dataToSubmit.images[0].isMain = true;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6 border rounded-lg shadow bg-base-200">
      {/* Temel Alanlar */}
      <div className="form-control">
        <label className="label"><span className="label-text">Ürün Başlığı*</span></label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ürün başlığı" className="input input-bordered w-full" required maxLength="100" />
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Açıklama*</span></label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tam ürün açıklaması" className="textarea textarea-bordered w-full h-32" required maxLength="2000"></textarea>
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Kısa Açıklama</span></label>
        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Özet ürün açıklaması" className="textarea textarea-bordered w-full h-20" maxLength="500"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-control">
            <label className="label"><span className="label-text">Fiyat*</span></label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className="input input-bordered w-full" required min="0" step="0.01" />
        </div>
        <div className="form-control">
            <label className="label"><span className="label-text">İndirim Oranı (%)</span></label>
            <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} placeholder="0" className="input input-bordered w-full" min="0" max="100" />
        </div>
        <div className="form-control">
            <label className="label"><span className="label-text">Stok*</span></label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" className="input input-bordered w-full" required min="0" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
            <label className="label"><span className="label-text">Marka*</span></label>
            <select name="brand" value={formData.brand} onChange={handleChange} className="select select-bordered w-full" required>
            <option value="" disabled>Marka Seçin</option>
            {brands.map(brand => <option key={brand._id} value={brand._id}>{brand.name}</option>)}
            </select>
        </div>
        <div className="form-control">
            <label className="label"><span className="label-text">Kategori*</span></label>
            <select name="category" value={formData.category} onChange={handleChange} className="select select-bordered w-full" required>
            <option value="" disabled>Kategori Seçin</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
            <label className="label"><span className="label-text">SKU*</span></label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Ürün kodu" className="input input-bordered w-full" required />
        </div>
        <div className="form-control">
            <label className="label"><span className="label-text">Garanti (Ay)</span></label>
            <input type="number" name="warranty" value={formData.warranty} onChange={handleChange} placeholder="24" className="input input-bordered w-full" min="0" />
        </div>
      </div>

      {/* Checkboxlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <label className="label cursor-pointer form-control w-max"><span className="label-text mr-2">Öne Çıkan</span><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="checkbox checkbox-primary" /></label>
        <label className="label cursor-pointer form-control w-max"><span className="label-text mr-2">Yeni Ürün</span><input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} className="checkbox checkbox-primary" /></label>
        <label className="label cursor-pointer form-control w-max"><span className="label-text mr-2">İndirimde</span><input type="checkbox" name="isSale" checked={formData.isSale} onChange={handleChange} className="checkbox checkbox-primary" /></label>
      </div>

      {/* Resimler */}
      <fieldset className="border p-4 rounded-md">
        <legend className="font-medium px-2">Ürün Resimleri</legend>
        {formData.images.map((img, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-end mb-3 p-2 border-b">
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs">Resim URL {index + 1}*</span></label>
              <input type="url" value={img.url} onChange={(e) => handleImageChange(index, 'url', e.target.value)} placeholder="https://..." className="input input-sm input-bordered w-full" required={index === 0 || img.url !== ""}/>
            </div>
            {/* <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs">Public ID (Cloudinary)</span></label>
                <input type="text" value={img.public_id} onChange={(e) => handleImageChange(index, 'public_id', e.target.value)} placeholder="Cloudinary ID" className="input input-sm input-bordered w-full" />
            </div> */}
            <label className="label cursor-pointer form-control items-center">
                <span className="label-text text-xs mr-2">Ana Resim?</span>
                <input type="checkbox" checked={img.isMain} onChange={(e) => handleImageChange(index, 'isMain', e.target.checked)} className="checkbox checkbox-xs checkbox-accent" />
            </label>
            {formData.images.length > 1 && (
              <button type="button" onClick={() => removeImageField(index)} className="btn btn-xs btn-error btn-outline">Sil</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addImageField} className="btn btn-sm btn-outline btn-accent mt-2">Yeni Resim Alanı Ekle</button>
      </fieldset>

      {/* Özellikler */}
      <fieldset className="border p-4 rounded-md">
        <legend className="font-medium px-2">Ürün Özellikleri</legend>
        {formData.specifications.map((spec, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end mb-3 p-2 border-b">
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs">Özellik Adı {index + 1}</span></label>
              <input type="text" value={spec.name} onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)} placeholder="Örn: Renk" className="input input-sm input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs">Özellik Değeri {index + 1}</span></label>
              <input type="text" value={spec.value} onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)} placeholder="Örn: Kırmızı" className="input input-sm input-bordered w-full" />
            </div>
             {(formData.specifications.length > 1 || (spec.name !== "" || spec.value !== "")) && ( // Sadece bir boş satır varsa silme butonu gösterme
                <button type="button" onClick={() => removeSpecificationField(index)} className="btn btn-xs btn-error btn-outline">Sil</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSpecificationField} className="btn btn-sm btn-outline btn-accent mt-2">Yeni Özellik Alanı Ekle</button>
      </fieldset>
      

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-ghost">İptal</button>
        )}
        <button type="submit" className="btn btn-primary">{buttonText}</button>
      </div>
    </form>
  );
};

export default ProductForm;