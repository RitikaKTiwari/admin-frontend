"use client";

import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp, 
  FiPieChart, 
  FiAlertTriangle, 
  FiDownload, 
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  getDashboardStats, 
  getSalesReport, 
  getSalesByCategory, 
  getTopProducts, 
  getLowStockProducts,
  exportSalesReport 
} from '@/app/_services/api/admin';
import { usePopup } from '@/app/_context/PopupContext';

export default function DashboardPage() {
  // Tabs and general state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { showPopup } = usePopup();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Advanced Analytics state
  const [salesReport, setSalesReportData] = useState(null);
  const [salesByCategory, setSalesByCategoryData] = useState([]);
  const [topProducts, setTopProductsData] = useState([]);
  const [lowStock, setLowStockData] = useState({ products: [], pagination: {} });

  // Filters state
  const [groupBy, setGroupBy] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stockThreshold, setStockThreshold] = useState(15);

  // CSV Export Dates
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadAdvancedAnalytics();
  }, [groupBy, startDate, endDate, stockThreshold]);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();
      if (data) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadAdvancedAnalytics = async () => {
    setRefreshing(true);
    try {
      const [report, categories, top, stock] = await Promise.all([
        getSalesReport(startDate, endDate, groupBy),
        getSalesByCategory(),
        getTopProducts(5),
        getLowStockProducts(stockThreshold, 1, 10)
      ]);

      if (report) setSalesReportData(report);
      if (categories) setSalesByCategoryData(categories);
      if (top) setTopProductsData(top);
      if (stock) setLowStockData(stock);
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleExportCSV = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      await exportSalesReport(exportStart, exportEnd);
    } catch (error) {
      await showPopup('Failed to export sales report CSV.', { type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate SVG Line Chart coordinates for Sales Report
  const renderSalesChart = () => {
    if (!salesReport || !salesReport.report || salesReport.report.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500">No sales data matches the filters</p>
        </div>
      );
    }

    const dataPoints = salesReport.report;
    const maxVal = Math.max(...dataPoints.map(d => d.revenue), 1000);
    const width = 800;
    const height = 240;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Generate path points
    const points = dataPoints.map((d, i) => {
      const x = paddingLeft + (i / Math.max(dataPoints.length - 1, 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.revenue / maxVal) * chartHeight;
      return { x, y, val: d.revenue, label: d.date };
    });

    const pathD = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-64">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={index}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" className="dark:stroke-gray-700" strokeDasharray="4 4" />
                <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium">
                  ₹{gridVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {points.length > 0 && (
            <path d={areaD} fill="url(#areaGrad)" />
          )}

          {/* Path Line */}
          {points.length > 0 && (
            <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Data Points / Interaction dots */}
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" className="cursor-pointer transition hover:r-6 hover:fill-indigo-600" />
              {/* Simple hovering label */}
              <rect x={p.x - 30} y={p.y - 25} width="60" height="18" rx="3" fill="#1f2937" className="opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none" />
              <text x={p.x} y={p.y - 13} textAnchor="middle" className="text-[9px] fill-white opacity-0 group-hover:opacity-100 font-bold pointer-events-none">
                ₹{Math.round(p.val)}
              </text>
            </g>
          ))}

          {/* X Axis Labels */}
          {points.filter((_, i) => dataPoints.length < 15 || i % Math.round(dataPoints.length / 7) === 0).map((p, idx) => (
            <text key={idx} x={p.x} y={paddingTop + chartHeight + 20} textAnchor="middle" className="text-[9px] fill-gray-400 dark:fill-gray-500 font-medium">
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Advanced Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time business performance summaries, product rankings, category metrics, and CSV reporting.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={loadAdvancedAnalytics}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap -mb-px space-x-6">
          {[
            { id: 'overview', label: 'Overview', icon: FiShoppingBag },
            { id: 'trends', label: 'Sales Trends', icon: FiTrendingUp },
            { id: 'categories', label: 'Category Performance', icon: FiPieChart },
            { id: 'products', label: 'Top Products', icon: FiPackage },
            { id: 'inventory', label: 'Inventory Alerts', icon: FiAlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-semibold text-sm transition ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Revenue</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  ₹{stats?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl">
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Orders</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <FiShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Products Catalog</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <FiPackage className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Registered Users</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 lg:col-span-2 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Customer Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-3">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-gray-500">
                          No recent orders available
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <td className="py-4 text-sm font-semibold text-gray-900 dark:text-white">
                            {order.orderId || order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-4 text-sm">
                            <p className="font-medium text-gray-800 dark:text-gray-200">{order.user?.name || 'Guest'}</p>
                            <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                          </td>
                          <td className="py-4 text-sm font-bold text-right text-gray-900 dark:text-white">
                            ₹{order.totalAmount?.toFixed(2)}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                              order.status === 'cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                              'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Export Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm h-fit">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <FiDownload className="h-5 w-5" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Center</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Extract your sales records directly to spreadsheet-ready `.csv` tables.
              </p>

              <form onSubmit={handleExportCSV} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">From Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input 
                      type="date" 
                      value={exportStart}
                      onChange={(e) => setExportStart(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">To Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input 
                      type="date" 
                      value={exportEnd}
                      onChange={(e) => setExportEnd(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={exporting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow transition flex items-center justify-center space-x-2"
                >
                  <FiDownload className="h-4 w-4" />
                  <span>{exporting ? 'Generating Report...' : 'Download Sales CSV'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. SALES TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6 animate-fadeIn">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-4 border-b border-gray-100 dark:border-gray-700/60">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Timeline</h3>
              <p className="text-xs text-gray-400">Filter periods and granularity to study trends.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Group By selector */}
              <select 
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="day">Group By: Daily</option>
                <option value="week">Group By: Weekly</option>
                <option value="month">Group By: Monthly</option>
              </select>

              {/* Date pickers */}
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SVG Sales Chart */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
            {renderSalesChart()}
          </div>

          {/* Period totals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Period Revenue</p>
              <p className="text-xl font-black text-indigo-600 mt-1">₹{salesReport?.summary?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Period Orders</p>
              <p className="text-xl font-black text-gray-800 dark:text-gray-200 mt-1">{salesReport?.summary?.totalOrders || 0}</p>
            </div>
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Items Sold</p>
              <p className="text-xl font-black text-gray-800 dark:text-gray-200 mt-1">{salesReport?.summary?.totalItems || 0}</p>
            </div>
            <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Avg Order Value</p>
              <p className="text-xl font-black text-green-600 mt-1">₹{salesReport?.summary?.averageOrderValue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORY PERFORMANCE TAB */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Sales Distribution</h3>
            <p className="text-xs text-gray-400">Total metrics generated per inventory category.</p>
          </div>

          <div className="space-y-6">
            {salesByCategory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No categories stats available</div>
            ) : (
              salesByCategory.map((cat, idx) => {
                const totalRevenue = salesByCategory.reduce((sum, item) => sum + item.revenue, 0);
                const percent = totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{cat.category}</span>
                        <span className="text-xs text-gray-400 ml-2">({cat.ordersCount} orders, {cat.quantitySold} units)</span>
                      </div>
                      <span className="font-bold text-indigo-600">₹{cat.revenue.toLocaleString('en-IN')} ({percent.toFixed(1)}%)</span>
                    </div>
                    {/* Custom progress bar */}
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. TOP PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Catalog Items</h3>
            <p className="text-xs text-gray-400">Ranked by quantities ordered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No product sales records found</div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={prod.productId} className="border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="h-8 w-8 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-sm">
                        #{idx + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-medium">
                        {prod.categoryName}
                      </span>
                    </div>

                    <div className="flex items-start space-x-4">
                      <img 
                        src={prod.image || 'https://via.placeholder.com/100'} 
                        alt={prod.title} 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                      />
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
                          {prod.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Price per unit: ₹{prod.price}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 mt-5 pt-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity Sold</p>
                      <p className="text-lg font-extrabold text-gray-800 dark:text-gray-200 mt-1">{prod.totalQuantitySold}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Revenue</p>
                      <p className="text-lg font-extrabold text-green-600 mt-1">₹{prod.totalRevenue}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. INVENTORY ALERTS TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Low Stock Warning List</h3>
              <p className="text-xs text-gray-400">Inventory levels requiring restocking soon.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Threshold:</span>
              <input 
                type="number" 
                value={stockThreshold}
                onChange={(e) => setStockThreshold(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-20 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Price</th>
                  <th className="pb-3 text-center">Remaining Stock</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {lowStock.products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      🎉 All product inventory levels are healthy!
                    </td>
                  </tr>
                ) : (
                  lowStock.products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="py-4 flex items-center space-x-3">
                        <img 
                          src={prod.image || 'https://via.placeholder.com/50'} 
                          alt={prod.title} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                        />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{prod.title}</p>
                          <p className="text-[10px] text-gray-400">{prod.brand || 'No Brand'}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {prod.categoryName}
                      </td>
                      <td className="py-4 text-sm font-bold text-center text-gray-800 dark:text-gray-200">
                        ₹{prod.price}
                      </td>
                      <td className="py-4 text-sm font-black text-center">
                        <span className={prod.stock === 0 ? 'text-red-600' : 'text-yellow-600'}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          prod.stock === 0 
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                        }`}>
                          {prod.stock === 0 ? 'Out of Stock' : 'Critical Low'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}