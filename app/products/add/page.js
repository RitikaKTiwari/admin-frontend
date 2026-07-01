"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/_components/ProductForm";
import { createProduct } from "@/app/_services/api/admin";
import { usePopup } from "@/app/_context/PopupContext";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showPopup } = usePopup();

  const handleSubmit = async (productData) => {
    setLoading(true);
    try {
      const result = await createProduct(productData);
      if (result.success) {
        await showPopup("Product created successfully!", { type: 'success' });
        router.push("/products");
      } else {
        await showPopup(result.message || "Failed to create product", { type: 'error' });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      await showPopup("Failed to create product", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pass a default empty object for add page
  const initialData = {
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    categoryName: "",
    image: "",
    stock: "",
    brand: "",
    isFeatured: false,
  };

  return (
    <ProductForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={loading}
      submitButtonText="Create Product"
      title="Add Product"
    />
  );
}