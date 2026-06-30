// admin-frontend/_services/api/admin.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ============================================
// 1. ADMIN AUTH
// ============================================

// Admin Login
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("admin", JSON.stringify(data.data.admin));
      localStorage.setItem("isAdmin", "true");
    }

    return data;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};

// Admin Logout
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin");
  localStorage.removeItem("isAdmin");
  window.location.href = "/login";
};

// Check if admin is logged in
export const isAdminLoggedIn = () => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("adminToken");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return !!(token && isAdmin);
};

// Get current admin
export const getCurrentAdmin = () => {
  if (typeof window === "undefined") return null;
  const admin = localStorage.getItem("admin");
  return admin ? JSON.parse(admin) : null;
};

// ============================================
// 2. DASHBOARD
// ============================================

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

// ============================================
// 3. PRODUCT MANAGEMENT
// ============================================

// Get all products
export const getAdminProducts = async (page = 1, limit = 10, search = "") => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    // ✅ Build URL with search parameter
    const url = new URL(`${API_URL}/admin/products`);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);

    // ✅ IMPORTANT: Add search to URL if it exists
    if (search) {
      url.searchParams.append("search", search);
    }

    console.log("🔍 Sending request to:", url.toString()); // Debug

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], pagination: {} };
  }
};

// Create product
export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// ============================================
// 4. ORDER MANAGEMENT
// ===========================================

// Get all orders
export const getAdminOrders = async (page = 1, limit = 10, status = "all") => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(
      `${API_URL}/admin/orders?page=${page}&limit=${limit}&status=${status}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [], pagination: {} };
  }
};

// Get order details
export const getOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Send order status email
export const sendOrderStatusEmail = async (orderId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(
      `${API_URL}/admin/orders/${orderId}/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// ============================================
// 5. USER MANAGEMENT
// ============================================

// Get all users
export const getAdminUsers = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(
      `${API_URL}/admin/users?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], pagination: {} };
  }
};

// ============================================
// CATEGORY MANAGEMENT (Add these functions)
// ============================================

export const getCategories = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(`${API_URL}/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// ============================================
// 6. ANALYTICS & REPORTING
// ============================================

export const getSalesReport = async (
  startDate = "",
  endDate = "",
  groupBy = "day",
) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    let url = `${API_URL}/admin/analytics/sales-report?groupBy=${groupBy}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return null;
  }
};

export const getSalesByCategory = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(
      `${API_URL}/admin/analytics/sales-by-category`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching sales by category:", error);
    return [];
  }
};

export const getTopProducts = async (limit = 5) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(
      `${API_URL}/admin/analytics/top-products?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching top products:", error);
    return [];
  }
};

export const getLowStockProducts = async (
  threshold = 10,
  page = 1,
  limit = 10,
) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    const response = await fetch(
      `${API_URL}/admin/analytics/low-stock?threshold=${threshold}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return { products: [], pagination: {} };
  }
};

export const exportSalesReport = async (startDate = "", endDate = "") => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not authorized");

    let url = `${API_URL}/admin/analytics/export-sales`;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to download CSV");

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    const startStr = startDate ? startDate : "start";
    const endStr = endDate ? endDate : "end";
    link.setAttribute("download", `sales_report_${startStr}_to_${endStr}.csv`);

    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error exporting sales report:", error);
    throw error;
  }
};
