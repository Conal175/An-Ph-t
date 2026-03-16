import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, ShoppingBag, DollarSign, 
  Activity, Package, AlertCircle, Calendar, Loader2 
} from 'lucide-react';
import { fetchDailyLogs, fetchOrders, DailyLog, Order } from '../store';

interface Props {
  project: {
    id: string;
    name: string;
    description?: string;
  };
}

export function Dashboard({ project }: Props) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const [logsData, ordersData] = await Promise.all([
        fetchDailyLogs(project.id),
        fetchOrders(project.id)
      ]);
      setLogs(logsData);
      setOrders(ordersData);
      setLoading(false);
    };
    loadDashboardData();
  }, [project.id]);

  // Lọc dữ liệu theo tháng đang chọn
  const currentMonthLogs = logs.filter(l => l.month === selectedMonth && l.year === selectedYear);
  const currentMonthOrders = orders.filter(o => {
    if (!o.orderDate) return false;
    const d = new Date(o.orderDate);
    return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Tính toán Chỉ số Quảng Cáo (Ads)
  const totalSpend = currentMonthLogs.reduce((sum, l) => sum + (l.spend || 0), 0);
  const totalImpressions = currentMonthLogs.reduce((sum, l) => sum + (l.impressions || 0), 0);
  const totalClicks = currentMonthLogs.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalMessages = currentMonthLogs.reduce((sum, l) => sum + (l.messages || 0), 0);
  
  const cpa = totalMessages > 0 ? totalSpend / totalMessages : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Tính toán Chỉ số Đơn Hàng (Orders)
  const totalRevenue = currentMonthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = currentMonthOrders.length;
  
  const successOrders = currentMonthOrders.filter(o => o.status.toLowerCase().includes('thành công') || o.status.toLowerCase().includes('đã nhận')).length;
  const returningOrders = currentMonthOrders.filter(o => o.status.toLowerCase().includes('hoàn') || o.status.toLowerCase().includes('hủy')).length;
  const pendingOrders = totalOrdersCount - successOrders - returningOrders;

  const successRate = totalOrdersCount > 0 ? (successOrders / totalOrdersCount) * 100 : 0;
  const returnRate = totalOrdersCount > 0 ? (returningOrders / totalOrdersCount) * 100 : 0;

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p>Đang tổng hợp dữ liệu tổng quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" /> Tổng Quan Dự Án
          </h2>
          <p className="text-gray-500 mt-1">{project.name}</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <Calendar className="w-5 h-5 text-gray-500 ml-2" />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer pr-2"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Thẻ KPI Chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-green-100 font-medium">Doanh Thu Tạm Tính</p>
            <div className="p-2 bg-white/20 rounded-lg"><DollarSign className="w-5 h-5" /></div>
          </div>
          <h3 className="text-2xl font-bold">{formatMoney(totalRevenue)}</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-blue-100 font-medium">Chi Phí Quảng Cáo</p>
            <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <h3 className="text-2xl font-bold">{formatMoney(totalSpend)}</h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 font-medium">Tổng Đơn Hàng</p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalOrdersCount} <span className="text-sm font-normal text-gray-500">đơn</span></h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 font-medium">CPA (Chi phí / Tin nhắn)</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-5 h-5" /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{formatMoney(cpa)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột Trái: Thống Kê Đơn Hàng */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-indigo-500" /> Tỉ Lệ Chuyển Phát
          </h3>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-green-700">Thành công / Đã nhận ({successOrders})</span>
                <span className="font-bold text-green-700">{successRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${successRate}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-blue-700">Đang xử lý / Đang giao ({pendingOrders})</span>
                <span className="font-bold text-blue-700">{totalOrdersCount > 0 ? ((pendingOrders / totalOrdersCount) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (pendingOrders / totalOrdersCount) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-red-700">Hủy / Hoàn hàng ({returningOrders})</span>
                <span className="font-bold text-red-700">{returnRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${returnRate}%` }}></div>
              </div>
            </div>
          </div>
          
          {returnRate > 15 && (
            <div className="mt-6 bg-red-50 text-red-700 p-3 rounded-xl text-sm flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p><strong>Cảnh báo:</strong> Tỉ lệ hoàn/hủy đang ở mức cao ({returnRate.toFixed(1)}%). Cần kiểm tra lại chất lượng sản phẩm hoặc khâu chăm sóc khách hàng.</p>
            </div>
          )}
        </div>

        {/* Cột Phải: Thống Kê Quảng Cáo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-500" /> Hiệu Quả Quảng Cáo (Ads)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Tổng Lượt Hiển Thị</p>
              <p className="text-xl font-bold text-gray-800">{new Intl.NumberFormat('vi-VN').format(totalImpressions)}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Tổng Lượt Clicks</p>
              <p className="text-xl font-bold text-gray-800">{new Intl.NumberFormat('vi-VN').format(totalClicks)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Tin Nhắn Mới</p>
              <p className="text-xl font-bold text-blue-600">{new Intl.NumberFormat('vi-VN').format(totalMessages)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">CTR (Tỉ lệ click)</p>
              <p className="text-xl font-bold text-purple-600">{ctr.toFixed(2)}%</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Tỉ lệ chốt đơn (Tin nhắn → Đơn):</span>
              <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                {totalMessages > 0 ? ((totalOrdersCount / totalMessages) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
