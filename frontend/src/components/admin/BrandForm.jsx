import React, { useState, useEffect } from "react";

const BrandForm = ({ onSubmit, initialData = {}, buttonText = "Kaydet", onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "", // URL veya dosya adı için metin girişi
    website: "",
    foundedYear: "",
    featured: false,
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        logo: initialData.logo || "",
        website: initialData.website || "",
        foundedYear: initialData.foundedYear || "",
        featured: initialData.featured || false,
      });
    } else {
        // Eğer yeni kayıt ise formu sıfırla
        setFormData({
            name: "",
            description: "",
            logo: "",
            website: "",
            foundedYear: "",
            featured: false,
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

  const handleFileChange = (e) => {
    // Basit dosya adı gösterimi. Gerçek yükleme backend'de ve Redux action'da ele alınmalı.
    // Şimdilik sadece dosya adını veya bir placeholder'ı saklayabiliriz.
    // Cloudinary vs. kullanılıyorsa, burada yükleme mantığı ve URL'in alınması gerekir.
    const file = e.target.files[0];
    if (file) {
        setFormData(prev => ({ ...prev, logo: file.name })); // veya URL
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (dataToSubmit.foundedYear === "") {
        delete dataToSubmit.foundedYear; // Boşsa gönderme veya null yap
    } else {
        dataToSubmit.foundedYear = Number(dataToSubmit.foundedYear);
    }
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6 border rounded-lg shadow bg-base-200">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Marka Adı*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Marka adı"
          className="input input-bordered w-full"
          required
          maxLength="50"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Açıklama*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Marka açıklaması"
          className="textarea textarea-bordered w-full h-24"
          required
          maxLength="500"
        ></textarea>
      </div>
      
      {/* Logo için basit metin girişi veya dosya seçimi */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Logo URL'i veya Dosya Adı</span>
        </label>
        <input
          type="text" // veya type="file" ve ona göre handleFileChange
          name="logo"
          value={formData.logo}
          onChange={handleChange} // Eğer text ise handleChange, file ise handleFileChange
          placeholder="Örn: /no-logo.png veya https://..."
          className="input input-bordered w-full"
        />
        {/* <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs" /> */}
      </div>


      <div className="form-control">
        <label className="label">
          <span className="label-text">Web Sitesi</span>
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.marka.com"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Kuruluş Yılı</span>
        </label>
        <input
          type="number"
          name="foundedYear"
          value={formData.foundedYear}
          onChange={handleChange}
          placeholder="Örn: 1990"
          className="input input-bordered w-full"
          min="1800"
          max={new Date().getFullYear()}
        />
      </div>

      <div className="form-control">
        <label className="label cursor-pointer w-max">
          <span className="label-text mr-4">Öne Çıkan Marka mı?</span>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-ghost">
            İptal
            </button>
        )}
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default BrandForm;