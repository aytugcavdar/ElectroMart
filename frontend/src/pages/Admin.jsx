import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { getBrands } from "../redux/brandSlice";
import { getCategories } from "../redux/categorySlice";
import { getProducts } from "../redux/productSlice";

import BrandManagement from "../components/admin/BrandManagement";
import CategoryManagement from "../components/admin/CategoryManagement";
import ProductManagement from "../components/admin/ProductManagement";

const Admin = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("brands");

  useEffect(() => {
    dispatch(getBrands());
    dispatch(getCategories());
    dispatch(getProducts());
  }, [dispatch]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "brands":
        return <BrandManagement />;
      case "categories":
        return <CategoryManagement />;
      case "products":
        return <ProductManagement />;
      default:
        return <p>Lütfen bir sekme seçin.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Yönetim Paneli</h1>

      <div role="tablist" className="tabs tabs-lifted tabs-lg mb-6">
        <button
          role="tab"
          className={`tab ${activeTab === "brands" ? "tab-active [--tab-bg:hsl(var(--p))] [--tab-border-color:hsl(var(--p))] text-primary-content" : ""}`}
          onClick={() => setActiveTab("brands")}
        >
          Markalar
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "categories" ? "tab-active [--tab-bg:hsl(var(--p))] [--tab-border-color:hsl(var(--p))] text-primary-content" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Kategoriler
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "products" ? "tab-active [--tab-bg:hsl(var(--p))] [--tab-border-color:hsl(var(--p))] text-primary-content" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Ürünler
        </button>
         {/* Köşe yuvarlama için boş bir tab daha ekleyebilirsiniz isterseniz */}
        <button role="tab" className="tab [--tab-border-color:transparent] flex-grow"></button>
      </div>

      <div className="admin-tab-content bg-base-100 p-6 rounded-b-box shadow-lg">
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default Admin;