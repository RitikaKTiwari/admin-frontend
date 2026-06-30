"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiFilter } from "react-icons/fi";
import Table from "@/app/_components/Table";
import { getAdminOrders, updateOrderStatus } from "@/app/_services/api/admin";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [displayPage, setDisplayPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders(1, 1000, statusFilter);
      if (data) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const orderDay = new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          orderDate.getDate(),
        );

        switch (dateFilter) {
          case "today":
            return orderDay.getTime() === today.getTime();
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, dateFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    setDisplayPage(1);
  }, [dateFilter, statusFilter]);

  const getPaginatedData = () => {
    const start = (displayPage - 1) * 10;
    const end = start + 10;
    return filteredOrders.slice(start, end);
  };

  const getPagination = () => {
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / 10);
    return {
      page: displayPage,
      limit: 10,
      total: total,
      totalPages: totalPages,
    };
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        alert("Order status updated!");
        loadOrders();
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDateFilterLabel = (filter) => {
    const labels = {
      all: "📅 All Orders",
      today: "📆 Today",
      week: "📊 Last 7 Days",
      month: "📈 Last 30 Days",
    };
    return labels[filter] || labels.all;
  };

  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-indigo-600">
          {item.orderId || item._id.slice(-6)}
        </span>
      ),
    },
    {
      key: "user",
      label: "Customer",
      sortable: true,
      render: (item) => item.user?.name || "Guest",
    },
    {
      key: "totalItems",
      label: "Items",
      sortable: true,
      render: (item) => item.totalItems || item.items?.length || 0,
    },
    {
      key: "totalAmount",
      label: "Total",
      sortable: true,
      render: (item) => `₹${item.totalAmount?.toFixed(2) || "0.00"}`,
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => (
        <select
          value={item.status || "pending"}
          onChange={(e) => handleStatusChange(item._id, e.target.value)}
          className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(item.status)}`}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      icon: <FiEye className="w-4 h-4" />,
      className: "text-indigo-600 hover:bg-indigo-50",
      onClick: (item) => router.push(`/orders/${item._id}`),
    },
  ];

  const getOrderCounts = (orders, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d.toDateString() === today.toDateString();
        }).length;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orders.filter((o) => new Date(o.createdAt) >= weekAgo).length;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orders.filter((o) => new Date(o.createdAt) >= monthAgo).length;
      default:
        return orders.length;
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          <FiFilter className="w-4 h-4" />
          <span>Filters</span>
          {(dateFilter !== "all" || statusFilter !== "all") && (
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Date:
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "today", "week", "month"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-3 py-1 text-sm rounded-full transition ${
                      dateFilter === filter
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {getDateFilterLabel(filter)}
                    <span className="ml-1 text-xs opacity-70">
                      ({getOrderCounts(orders, filter)})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {(dateFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setDateFilter("all");
                  setStatusFilter("all");
                }}
                className="text-sm text-red-500 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{filteredOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold">
            {getOrderCounts(filteredOrders, "today")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">
            {filteredOrders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold">
            {filteredOrders.filter((o) => o.status === "delivered").length}
          </p>
        </div>
      </div>

      <Table
        data={getPaginatedData()}
        columns={columns}
        pagination={getPagination()}
        onPageChange={setDisplayPage}
        loading={loading}
        emptyMessage="No orders found"
        actions={actions}
      />
    </>
  );
}
