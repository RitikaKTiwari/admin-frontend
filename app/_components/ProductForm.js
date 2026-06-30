"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { getCategories } from "@/app/_services/api/admin";

export default function ProductForm({
  initialData = {
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
  },
  onSubmit,
  isLoading = false,
  submitButtonText = "Save Product",
  title = "Product",
}) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price || "",
    originalPrice: initialData.originalPrice || "",
    category: initialData.category || "",
    categoryName: initialData.categoryName || "",
    image: initialData.image || "",
    stock: initialData.stock || "",
    brand: initialData.brand || "",
    isFeatured: initialData.isFeatured || false,
  });

  const [errors, setErrors] = useState({});

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Update when initialData changes (for edit mode)
  useEffect(() => {
    setFormData({
      title: initialData.title || "",
      description: initialData.description || "",
      price: initialData.price || "",
      originalPrice: initialData.originalPrice || "",
      category: initialData.category || "",
      categoryName: initialData.categoryName || "",
      image: initialData.image || "",
      stock: initialData.stock || "",
      brand: initialData.brand || "",
      isFeatured: initialData.isFeatured || false,
    });
  }, [initialData]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    const selectedCategory = categories.find((c) => c._id === selectedCategoryId);

    setFormData((prev) => ({
      ...prev,
      category: selectedCategoryId,
      categoryName: selectedCategory?.name || "",
    }));

    if (errors.categoryName) {
      setErrors((prev) => ({ ...prev, categoryName: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (
      formData.originalPrice &&
      parseFloat(formData.originalPrice) <= parseFloat(formData.price)
    ) {
      newErrors.originalPrice = "Original price must be greater than price";
    }
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = document.querySelector(".border-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Prepare data for submission
    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      category: formData.category,
      categoryName: formData.categoryName.trim(),
      image: formData.image.trim(),
      stock: parseInt(formData.stock) || 0,
      brand: formData.brand.trim(),
      isFeatured: formData.isFeatured,
    };

    onSubmit(productData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/products"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title === "Add Product" ? "Create a new product" : "Update product information"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter product title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter product description"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price <span className="text-red-500">*</span> (₹)
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.price ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="99.99"
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.originalPrice ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="149.99"
              />
              {errors.originalPrice && (
                <p className="mt-1 text-sm text-red-500">{errors.originalPrice}</p>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="text-gray-400">Loading categories...</span>
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="10"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Brand name"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.image ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="https://example.com/product-image.jpg"
              />
              {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
            </div>

            {/* Featured Product */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Featured Product</span>
                  <span className="text-gray-500 text-xs ml-1">(Display on homepage)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview:</p>
              <img
                src={formData.image}
                alt="Product preview"
                className="max-h-48 rounded-lg object-contain"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x200?text=Invalid+Image+URL";
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  {submitButtonText}
                </>
              )}
            </button>
            <Link
              href="/products"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}