"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/_components/ProductForm";
import { createProduct } from "@/app/_services/api/admin";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (productData) => {
    setLoading(true);
    try {
      const result = await createProduct(productData);
      if (result.success) {
        alert("✅ Product created successfully!");
        router.push("/products");
      } else {
        alert(result.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
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