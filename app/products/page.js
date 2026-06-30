"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Table from '@/app/_components/Table';
import { getAdminProducts, deleteProduct } from '@/app/_services/api/admin';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts(currentPage, 10, debouncedSearch);
      if (data) {
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.title}"?`)) return;
    
    try {
      const result = await deleteProduct(product._id);
      if (result.success) {
        alert('Product deleted!');
        loadProducts();
      }
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (item) => (
        <Image
          src={item.image || 'https://via.placeholder.com/50'}
          alt={item.title}
          width={48}
          height={48}
          className="w-12 h-12 object-cover rounded"
          unoptimized={!item.image?.startsWith('/')}
        />
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Price',
      render: (item) => `₹${item.price?.toFixed(2) || '0.00'}`,
      sortable: true,
    },
    {
      key: 'categoryName',
      label: 'Category',
      render: (item) => item.categoryName || '-',
      sortable: true,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.stock > 10 ? 'bg-green-100 text-green-800' :
          item.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.stock || 0}
        </span>
      ),
      sortable: true,
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <FiEdit2 className="w-4 h-4" />,
      className: 'text-blue-600 hover:bg-blue-50',
      onClick: (item) => router.push(`/products/edit/${item._id}`),
    },
    {
      label: 'Delete',
      icon: <FiTrash2 className="w-4 h-4" />,
      className: 'text-red-600 hover:bg-red-50',
      onClick: (item) => handleDelete(item),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/products/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <Table
        data={products}
        columns={columns}
        pagination={pagination}
        onPageChange={setCurrentPage}
        searchable={true}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by product name..."
        actions={actions}
        loading={loading}
        emptyMessage="No products found"
      />
    </>
  );
}