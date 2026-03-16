import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Folder, FileVideo, FileImage, FileText, 
  Link as LinkIcon, Plus, Edit2, Trash2, ExternalLink, Loader2, Check, X 
} from 'lucide-react';
import { getProjectData, setProjectData } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuid } from 'uuid';

interface Props {
  projectId: string;
}

interface Fanpage {
  id: string;
  name: string;
  link: string;
  status: string;
  notes: string;
}

export function MediaResources({ projectId }: Props) {
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { checkPermission } = useAuth();
  const canEdit = checkPermission('media', 'edit');
  const canDelete = checkPermission('media', 'delete');

  // Thêm Fanpage mới
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFanpage, setNewFanpage] = useState<Omit<Fanpage, 'id'>>({
    name: '', link: '', status: 'Hoạt động', notes: ''
  });

  // Chỉnh sửa Fanpage trực tiếp
  const [editingFanpageId, setEditingFanpageId] = useState<string | null>(null);
  const [editFanpageData, setEditFanpageData] = useState<Partial<Fanpage>>({});

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    const storedFanpages = await getProjectData(projectId, 'fanpages');
    if (storedFanpages) {
      setFanpages(storedFanpages);
    }
    setLoading(false);
  };

  const syncToDatabase = async (updatedFanpages: Fanpage[]) => {
    setIsSaving(true);
    await setProjectData(projectId, 'fanpages', updatedFanpages);
    setFanpages(updatedFanpages);
    setIsSaving(false);
  };

  // ================= XỬ LÝ THÊM MỚI =================
  const handleAddFanpage = async () => {
    if (!newFanpage.name.trim() || !canEdit) return;
    const newEntry: Fanpage = { id: uuid(), ...newFanpage };
    const updatedList = [...fanpages, newEntry];
    
    await syncToDatabase(updatedList);
    
    setNewFanpage({ name: '', link: '', status: 'Hoạt động', notes: '' });
    setShowAddForm(false);
  };

  // ================= XỬ LÝ SỬA TRỰC TIẾP =================
  const startEditFanpage = (page: Fanpage) => {
    if (!canEdit) return;
    setEditingFanpageId(page.id);
    setEditFanpageData({ ...page });
  };

  const cancelEditFanpage = () => {
    setEditingFanpageId(null);
    setEditFanpageData({});
  };

  const saveEditFanpage = async () => {
    if (!editingFanpageId || !canEdit || !editFanpageData.name?.trim()) return;
    
    const updatedList = fanpages.map(page => 
      page.id === editingFanpageId ? { ...page, ...editFanpageData } as Fanpage : page
    );

    await syncToDatabase(updatedList);
    setEditingFanpageId(null);
  };

  // ================= XỬ LÝ XÓA =================
  const handleDeleteFanpage = async (id: string) => {
    if (!canDelete) return;
    if (confirm('Bạn có chắc muốn xóa Fanpage này khỏi danh sách?')) {
      const updatedList = fanpages.filter(p => p.id !== id);
      await syncToDatabase(updatedList);
    }
  };

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-indigo-600" /> Tài Nguyên & Media
          </h2>
          <p className="text-gray-500 mt-1">Quản lý Fanpage, hình ảnh, video chiến dịch</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* KHU VỰC FANPAGE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-500" /> Danh sách Fanpage / Kênh
            </h3>
            {canEdit && !showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Thêm Kênh
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 mb-6 animate-in fade-in zoom-in-95">
              <h4 className="font-bold text-blue-900 mb-4">Thêm Fanpage / Kênh Mới</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Fanpage *</label>
                  <input type="text" autoFocus value={newFanpage.name} onChange={e => setNewFanpage({...newFanpage, name: e.target.value})} placeholder="VD: Siêu Bơm Năng Lượng AP" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Link)</label>
                  <input type="text" value={newFanpage.link} onChange={e => setNewFanpage({...newFanpage, link: e.target.value})} placeholder="https://facebook.com/..." className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={newFanpage.status} onChange={e => setNewFanpage({...newFanpage, status: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="Hoạt động">Hoạt động tốt</option>
                    <option value="Bị hạn chế">Bị hạn chế</option>
                    <option value="Hủy đăng">Bị hủy đăng</option>
                    <option value="Nuôi mới">Đang nuôi mới</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <input type="text" value={newFanpage.notes} onChange={e => setNewFanpage({...newFanpage, notes: e.target.value})} placeholder="Tình trạng via, quản trị viên..." className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-blue-100">
                <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors">Hủy</button>
                <button onClick={handleAddFanpage} disabled={isSaving || !newFanpage.name.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Fanpage
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fanpages.length === 0 && !showAddForm ? (
              <div className="col-span-2 py-10 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                Chưa có dữ liệu Fanpage nào.
              </div>
            ) : fanpages.map((page) => {
              const isEditing = editingFanpageId === page.id;

              return (
                <div key={page.id} className={`p-5 rounded-xl border transition-colors ${isEditing ? 'bg-yellow-50/50 border-yellow-300 shadow-md' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}>
                  {isEditing ? (
                    // ================= GIAO DIỆN KHI ĐANG SỬA =================
                    <div className="space-y-4 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tên Fanpage</label>
                        <input autoFocus type="text" value={editFanpageData.name || ''} onChange={e => setEditFanpageData({...editFanpageData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Đường dẫn (Link)</label>
                        <input type="text" value={editFanpageData.link || ''} onChange={e => setEditFanpageData({...editFanpageData, link: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Trạng thái</label>
                          <select value={editFanpageData.status || ''} onChange={e => setEditFanpageData({...editFanpageData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="Hoạt động">Hoạt động tốt</option>
                            <option value="Bị hạn chế">Bị hạn chế</option>
                            <option value="Hủy đăng">Bị hủy đăng</option>
                            <option value="Nuôi mới">Đang nuôi mới</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Ghi chú</label>
                          <input type="text" value={editFanpageData.notes || ''} onChange={e => setEditFanpageData({...editFanpageData, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                        <button onClick={cancelEditFanpage} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"><X className="w-4 h-4"/> Hủy</button>
                        <button onClick={saveEditFanpage} disabled={isSaving || !editFanpageData.name?.trim()} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4"/>} Lưu lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ================= GIAO DIỆN XEM BÌNH THƯỜNG =================
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-bold text-gray-800 text-base">{page.name}</h4>
                            <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                              page.status === 'Hoạt động' ? 'bg-green-50 text-green-700 border-green-200' : 
                              page.status?.includes('hạn chế') || page.status?.includes('Hủy') ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {page.status || 'Hoạt động'}
                            </span>
                          </div>
                          {page.link && (
                            <a href={page.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-full">
                              <LinkIcon className="w-3.5 h-3.5" /> Mở trang
                            </a>
                          )}
                        </div>
                        
                        {/* CỘT THAO TÁC */}
                        {(canEdit || canDelete) && (
                          <div className="flex items-center gap-1 shrink-0">
                            {canEdit && (
                              <button onClick={() => startEditFanpage(page)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa thông tin">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => handleDeleteFanpage(page.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa Fanpage">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {page.notes && (
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg"><span className="font-medium text-gray-600">Ghi chú:</span> {page.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CÁC PHẦN MEDIA KHÁC (Tài liệu, Video, Hình ảnh...) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-60">
           <div className="text-center py-12">
             <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <h3 className="text-lg font-bold text-gray-700">Kho tài liệu Media (Sắp ra mắt)</h3>
             <p className="text-gray-500">Khu vực lưu trữ Drive, Hình ảnh, Video quảng cáo chung của dự án.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
