"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/app/_components/ProductForm";
import { getAdminProducts, updateProduct } from "@/app/_services/api/admin";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts(1, 1000);
      if (data && data.products) {
        const product = data.products.find((p) => p._id === productId);
        if (product) {
          setInitialData({
            title: product.title || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            originalPrice: product.originalPrice?.toString() || "",
            category: product.category?._id || product.category || "",
            categoryName: product.categoryName || "",
            image: product.image || "",
            stock: product.stock?.toString() || "",
            brand: product.brand || "",
            isFeatured: product.isFeatured || false,
          });
        } else {
          alert("Product not found");
          router.push("/products");
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
      alert("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productData) => {
    setSaving(true);
    try {
      const result = await updateProduct(productId, productData);
      if (result.success) {
        alert("Product updated successfully!");
        router.push("/products");
      } else {
        alert(result.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <ProductForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={saving}
      submitButtonText="Update Product"
      title="Edit Product"
    />
  );
}