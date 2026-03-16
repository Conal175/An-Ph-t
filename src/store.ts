import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. CẤU HÌNH SUPABASE
// ==========================================
export const getSupabase = () => {
  const url = localStorage.getItem('supabase_url');
  const key = localStorage.getItem('supabase_anon_key');
  if (!url || !key) return null;
  return createClient(url, key);
};

// ==========================================
// 2. API CHO BẢNG PROJECTS (DỰ ÁN)
// ==========================================
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];
    
    // Bỏ .order() trong query để tránh lỗi văng app nếu DB của bạn đặt tên cột ngày tháng khác đi
    // Chúng ta sẽ lấy toàn bộ data về rồi dùng code Javascript để sắp xếp
    const { data, error } = await supabase.from('projects').select('*');
    
    if (error) {
      console.error("Lỗi Supabase:", error);
      // Bật Alert để nếu sai tên bảng/cột, nó sẽ báo ngay trên màn hình thay vì im lặng
      alert("Lỗi tải danh sách dự án từ Supabase: " + error.message);
      return [];
    }
    
    if (!data) return [];

    const projects = data.map(d => ({ 
      id: d.id, 
      name: d.name, 
      description: d.description, 
      // Hỗ trợ tự động nhận diện cả 2 kiểu tên cột ngày tháng phổ biến
      createdAt: d.created_at || d.createdAt || new Date().toISOString() 
    }));

    // Sắp xếp dự án mới nhất lên đầu bằng Javascript
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Lỗi code khi tải dự án:", err);
    return [];
  }
};

export const insertProject = async (project: Project): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  // Thử insert với chuẩn chung 'created_at'
  const { error } = await supabase.from('projects').insert([{
    id: project.id, 
    name: project.name, 
    description: project.description, 
    created_at: project.createdAt
  }]);
  
  if (error) {
    // Nếu lỗi do database cấu hình cột là 'createdAt', thử lại lần 2
    const fallback = await supabase.from('projects').insert([{
      id: project.id, 
      name: project.name, 
      description: project.description, 
      createdAt: project.createdAt
    }]);
    
    if (fallback.error) {
      alert("Lỗi tạo dự án trên DB: " + fallback.error.message);
      return false;
    }
  }
  return true;
};

export const removeProject = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  const { error } = await supabase.from('projects').delete().eq('id', id);
  
  if (error) {
    alert("Lỗi xóa dự án: " + error.message);
    return false;
  }
  return true;
};

// ==========================================
// 3. API CHO BẢNG PROJECT_DATA (JSON CHUNG)
// ==========================================
export const getProjectData = async (projectId: string, key: string): Promise<any> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('project_data').select('data_value').eq('project_id', projectId).eq('data_key', key).single();
  if (error || !data) return null;
  return data.data_value;
};

export const setProjectData = async (projectId: string, key: string, value: any): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('project_data').upsert({
    project_id: projectId, data_key: key, data_value: value, updated_at: new Date().toISOString()
  }, { onConflict: 'project_id, data_key' });
  return !error;
};

// ==========================================
// 4. API CHO BẢNG DAILY_LOGS (BÁO CÁO NGÀY)
// ==========================================
export interface DailyLog {
  id: string; projectId: string; day: number; month: number; year: number;
  adName: string; adLink?: string; spend: number; impressions: number; clicks: number;
  messages: number; orders: number; revenue: number; issues?: string; optimizations?: string;
}

export const fetchDailyLogs = async (projectId: string): Promise<DailyLog[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('daily_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
  if (error) return [];
  return data.map(d => ({
    id: d.id, projectId: d.project_id, day: d.day, month: d.month, year: d.year,
    adName: d.ad_name, adLink: d.ad_link, spend: Number(d.spend), impressions: Number(d.impressions),
    clicks: Number(d.clicks), messages: Number(d.messages), orders: Number(d.orders),
    revenue: Number(d.revenue), issues: d.issues, optimizations: d.optimizations
  }));
};

export const insertDailyLog = async (log: Omit<DailyLog, 'id'>): Promise<DailyLog | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('daily_logs').insert([{
    project_id: log.projectId, day: log.day, month: log.month, year: log.year,
    ad_name: log.adName, ad_link: log.adLink, spend: log.spend, impressions: log.impressions,
    clicks: log.clicks, messages: log.messages, orders: log.orders, revenue: log.revenue,
    issues: log.issues, optimizations: log.optimizations
  }]).select().single();
  if (error) return null;
  return {
    id: data.id, projectId: data.project_id, day: data.day, month: data.month, year: data.year,
    adName: data.ad_name, adLink: data.ad_link, spend: Number(data.spend), impressions: Number(data.impressions),
    clicks: Number(data.clicks), messages: Number(data.messages), orders: Number(data.orders),
    revenue: Number(data.revenue), issues: data.issues, optimizations: data.optimizations
  };
};

export const updateDailyLog = async (id: string, log: Partial<DailyLog>): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  const updates: any = {};
  if (log.adName !== undefined) updates.ad_name = log.adName;
  if (log.adLink !== undefined) updates.ad_link = log.adLink;
  if (log.spend !== undefined) updates.spend = log.spend;
  if (log.impressions !== undefined) updates.impressions = log.impressions;
  if (log.clicks !== undefined) updates.clicks = log.clicks;
  if (log.messages !== undefined) updates.messages = log.messages;
  if (log.orders !== undefined) updates.orders = log.orders;
  if (log.revenue !== undefined) updates.revenue = log.revenue;
  if (log.issues !== undefined) updates.issues = log.issues;
  if (log.optimizations !== undefined) updates.optimizations = log.optimizations;
  const { error } = await supabase.from('daily_logs').update(updates).eq('id', id);
  return !error;
};

export const deleteDailyLog = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('daily_logs').delete().eq('id', id);
  return !error;
};

// ==========================================
// 5. API CHO BẢNG ORDERS (QUẢN LÝ ĐƠN HÀNG)
// ==========================================
export interface Order {
  id: string;
  projectId: string;
  sheetName: string;
  orderDate: string;
  source: string;
  customerInfo: string;
  address: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  notes: string;
  shippingDate: string;
  trackingCode: string;
  status: string;
  shippingFee: number;
}

export const fetchOrders = async (projectId: string): Promise<Order[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('orders').select('*').eq('project_id', projectId).order('order_date', { ascending: false });
  if (error) return [];
  return data.map(d => ({
    id: d.id, projectId: d.project_id, sheetName: d.sheet_name || 'Bảng chung',
    orderDate: d.order_date || '', source: d.source || '', customerInfo: d.customer_info || '',
    address: d.address || '', productName: d.product_name || '', quantity: Number(d.quantity),
    price: Number(d.price), total: Number(d.total), notes: d.notes || '',
    shippingDate: d.shipping_date || '', trackingCode: d.tracking_code || '',
    status: d.status || '', shippingFee: Number(d.shipping_fee)
  }));
};

export const insertOrder = async (order: Omit<Order, 'id'>): Promise<Order | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('orders').insert([{
    project_id: order.projectId, sheet_name: order.sheetName || 'Bảng chung',
    order_date: order.orderDate || null, source: order.source, customer_info: order.customerInfo,
    address: order.address, product_name: order.productName, quantity: order.quantity,
    price: order.price, total: order.total, notes: order.notes, shipping_date: order.shippingDate || null,
    tracking_code: order.trackingCode, status: order.status, shipping_fee: order.shippingFee
  }]).select().single();

  if (error) { alert(`Lỗi thêm đơn: ${error.message}`); return null; }
  return {
    id: data.id, projectId: data.project_id, sheetName: data.sheet_name || 'Bảng chung',
    orderDate: data.order_date || '', source: data.source || '', customerInfo: data.customer_info || '',
    address: data.address || '', productName: data.product_name || '', quantity: Number(data.quantity),
    price: Number(data.price), total: Number(data.total), notes: data.notes || '',
    shippingDate: data.shipping_date || '', trackingCode: data.tracking_code || '',
    status: data.status || '', shippingFee: Number(data.shipping_fee)
  };
};

export const updateOrder = async (id: string, order: Partial<Order>): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  const updates: any = {};
  if (order.sheetName !== undefined) updates.sheet_name = order.sheetName;
  if (order.orderDate !== undefined) updates.order_date = order.orderDate || null;
  if (order.source !== undefined) updates.source = order.source;
  if (order.customerInfo !== undefined) updates.customer_info = order.customerInfo;
  if (order.address !== undefined) updates.address = order.address;
  if (order.productName !== undefined) updates.product_name = order.productName;
  if (order.quantity !== undefined) updates.quantity = order.quantity;
  if (order.price !== undefined) updates.price = order.price;
  if (order.total !== undefined) updates.total = order.total;
  if (order.notes !== undefined) updates.notes = order.notes;
  if (order.shippingDate !== undefined) updates.shipping_date = order.shippingDate || null;
  
  if (order.trackingCode !== undefined) updates.tracking_code = order.trackingCode; 
  
  if (order.status !== undefined) updates.status = order.status;
  if (order.shippingFee !== undefined) updates.shipping_fee = order.shippingFee;

  const { error } = await supabase.from('orders').update(updates).eq('id', id);
  if (error) {
    console.error("Lỗi khi cập nhật đơn hàng:", error);
    alert(`Lỗi cập nhật: ${error.message}`);
    return false;
  }
  return true;
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  return !error;
};

export const deleteOrdersBySheet = async (projectId: string, sheetName: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  let query = supabase.from('orders').delete().eq('project_id', projectId);
  
  if (sheetName !== 'ALL_SHEETS') {
    query = query.eq('sheet_name', sheetName);
  }
  
  const { error } = await query;
  if (error) { 
    alert(`Lỗi xóa bảng: ${error.message}`); 
    return false; 
  }
  return true;
};
