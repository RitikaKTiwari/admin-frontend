"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiPrinter,
  FiUser,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiHome,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
} from "react-icons/fi";
import { getOrderDetails, updateOrderStatus, sendOrderStatusEmail } from "@/app/_services/api/admin";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await getOrderDetails(orderId);
      if (data) {
        setOrder(data);
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      alert("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Change order status to "${newStatus}"?`)) return;

    setUpdating(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        alert("✅ Order status updated!");
        loadOrderDetails();
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailSent(false);
    try {
      const result = await sendOrderStatusEmail(orderId);
      if (result.success) {
        setEmailSent(true);
        alert("✅ Email sent to customer!");
      } else {
        alert(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: FiClock,
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: FiCheckCircle,
        label: "Confirmed",
      },
      shipped: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: FiTruck,
        label: "Shipped",
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: FiCheckCircle,
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: FiXCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`;
  };

  // Status timeline steps
  const getStatusSteps = () => {
    const allStatuses = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = allStatuses.indexOf(order?.status);
    return allStatuses.map((status, index) => ({
      status,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The order you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/orders" className="inline-block mt-4 text-indigo-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const statusSteps = getStatusSteps();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.orderId || order._id.slice(-6)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Send Email Button */}
          {order.user?.email && (
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <FiSend className="w-4 h-4" />
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
          )}

          <span className={`px-4 py-1.5 text-sm font-medium rounded-full border flex items-center gap-2 ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FiPrinter className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Email Sent Confirmation */}
      {emailSent && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300 font-medium">
            Email sent to customer successfully!
          </p>
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Order Status</h3>
        <div className="flex items-center gap-2">
          {statusSteps.map((step, index) => (
            <div key={step.status} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                    step.completed
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.completed ? <FiCheckCircle className="w-5 h-5" /> : <span className="text-xs">{index + 1}</span>}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step.active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : step.completed
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </span>
              </div>
              {index < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 ${step.completed ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center gap-2">
              <FiPackage className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h2>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {order.items?.length || 0} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Price</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.title || item.product?.title || "Unknown"}
                              </p>
                              {item.product?.categoryName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.product.categoryName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                          {item.quantity || 1}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      Subtotal
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                      Shipping
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                      Free
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300 dark:border-gray-600">
                    <td colSpan="3" className="px-6 py-4 text-right text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-indigo-600">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer</h2>
            </div>
            <div className="p-6 space-y-4">
              {order.user ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{order.user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FiMail className="w-3 h-3" />
                        {order.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-gray-400" />
                      {order.paymentMethod || "COD"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Guest user</p>
              )}

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FiHome className="w-4 h-4" />
                    Shipping Address
                  </p>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="flex items-center gap-1">
                      <FiPhone className="w-3 h-3 text-gray-400" />
                      {order.shippingAddress.phone}
                    </p>
                    <p className="flex items-start gap-1">
                      <FiMapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                      <span>
                        {order.shippingAddress.address}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.pincode}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">Type: {order.shippingAddress.addressType || "Home"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Status</h2>
            </div>
            <div className="p-4 space-y-1.5">
              {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => {
                const isActive = order.status === status;
                const config = getStatusConfig(status);
                const Icon = config.icon;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating || isActive}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition flex items-center justify-between ${
                      isActive
                        ? `${config.color} cursor-default font-medium`
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="flex items-center gap-3 capitalize">
                      <Icon className="w-4 h-4" />
                      {status}
                    </span>
                    {isActive && (
                      <span className="text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full text-green-600 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
              {updating && (
                <div className="mt-3 text-sm text-indigo-600 flex items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Updating status...
                </div>
              )}
              {sendingEmail && (
                <div className="mt-3 text-sm text-indigo-600 flex items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Sending email...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}