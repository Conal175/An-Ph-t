import React, { useState, useEffect } from 'react';
import { 
  Folder, Link as LinkIcon, Plus, Edit2, Trash2, 
  ExternalLink, Loader2, Check, X, Save, 
  Image as ImageIcon, FileText, Video, HardDrive, Palette
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

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'drive' | 'canva' | 'image' | 'video' | 'doc' | 'other';
  description: string;
}

export function MediaResources({ projectId }: Props) {
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { checkPermission } = useAuth();
  const canEdit = checkPermission('media', 'edit');
  const canDelete = checkPermission('media', 'delete');

  // ================= STATE FANPAGE =================
  const [showAddFanpage, setShowAddFanpage] = useState(false);
  const [newFanpage, setNewFanpage] = useState<Omit<Fanpage, 'id'>>({ name: '', link: '', status: 'Hoạt động', notes: '' });
  const [editingFanpageId, setEditingFanpageId] = useState<string | null>(null);
  const [editFanpageData, setEditFanpageData] = useState<Partial<Fanpage>>({});

  // ================= STATE MEDIA =================
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [newMedia, setNewMedia] = useState<Omit<MediaItem, 'id'>>({ title: '', url: '', type: 'drive', description: '' });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    const [storedFanpages, storedMedia] = await Promise.all([
      getProjectData(projectId, 'fanpages'),
      getProjectData(projectId, 'mediaItems')
    ]);
    if (storedFanpages) setFanpages(storedFanpages);
    if (storedMedia) setMediaItems(storedMedia);
    setLoading(false);
  };

  // ================= XỬ LÝ FANPAGE =================
  const handleAddFanpage = async () => {
    if (!newFanpage.name.trim() || !canEdit) return;
    setIsSaving(true);
    const updatedList = [...fanpages, { id: uuid(), ...newFanpage }];
    await setProjectData(projectId, 'fanpages', updatedList);
    setFanpages(updatedList);
    setNewFanpage({ name: '', link: '', status: 'Hoạt động', notes: '' });
    setShowAddFanpage(false);
    setIsSaving(false);
  };

  const saveEditFanpage = async () => {
    if (!editingFanpageId || !canEdit || !editFanpageData.name?.trim()) return;
    setIsSaving(true);
    const updatedList = fanpages.map(page => page.id === editingFanpageId ? { ...page, ...editFanpageData } as Fanpage : page);
    await setProjectData(projectId, 'fanpages', updatedList);
    setFanpages(updatedList);
    setEditingFanpageId(null);
    setIsSaving(false);
  };

  const handleDeleteFanpage = async (id: string) => {
    if (!canDelete) return;
    if (confirm('Bạn có chắc muốn xóa Fanpage này khỏi danh sách?')) {
      const updatedList = fanpages.filter(p => p.id !== id);
      await setProjectData(projectId, 'fanpages', updatedList);
      setFanpages(updatedList);
    }
  };

  // ================= XỬ LÝ MEDIA =================
  const handleAddMedia = async () => {
    if (!newMedia.title.trim() || !newMedia.url.trim() || !canEdit) return;
    setIsSaving(true);
    const updatedList = [{ id: uuid(), ...newMedia }, ...mediaItems];
    await setProjectData(projectId, 'mediaItems', updatedList);
    setMediaItems(updatedList);
    setNewMedia({ title: '', url: '', type: 'drive', description: '' });
    setShowAddMedia(false);
    setIsSaving(false);
  };

  const handleDeleteMedia = async (id: string) => {
    if (!canDelete) return;
    if (confirm('Bạn có chắc muốn xóa tài nguyên Media này?')) {
      const updatedList = mediaItems.filter(p => p.id !== id);
      await setProjectData(projectId, 'mediaItems', updatedList);
      setMediaItems(updatedList);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'drive': return <HardDrive className="w-5 h-5 text-green-600" />;
      case 'canva': return <Palette className="w-5 h-5 text-cyan-600" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'video': return <Video className="w-5 h-5 text-red-600" />;
      case 'doc': return <FileText className="w-5 h-5 text-amber-600" />;
      default: return <LinkIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Folder className="w-7 h-7 text-indigo-600" /> Tài Nguyên & Media
          </h2>
          <p className="text-gray-500 mt-1">Quản lý Fanpage, kho ảnh, video và tài liệu dự án</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* =========================================================================
            PHẦN 1: QUẢN LÝ FANPAGE / CHECKLIST KÊNH
        ========================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-500" /> Checklist Fanpage
            </h3>
            {canEdit && !showAddFanpage && (
              <button onClick={() => setShowAddFanpage(true)} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors">
                <Plus className="w-4 h-4" /> Kênh Mới
              </button>
            )}
          </div>

          {/* FORM THÊM FANPAGE */}
          {showAddFanpage && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-5 animate-in fade-in">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tên Fanpage *</label>
                  <input type="text" autoFocus value={newFanpage.name} onChange={e => setNewFanpage({...newFanpage, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Link Fanpage</label>
                  <input type="text" value={newFanpage.link} onChange={e => setNewFanpage({...newFanpage, link: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select value={newFanpage.status} onChange={e => setNewFanpage({...newFanpage, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="Hoạt động">Hoạt động tốt</option>
                      <option value="Bị hạn chế">Bị hạn chế</option>
                      <option value="Hủy đăng">Bị hủy đăng</option>
                      <option value="Nuôi mới">Đang nuôi mới</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Ghi chú</label>
                    <input type="text" value={newFanpage.notes} onChange={e => setNewFanpage({...newFanpage, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowAddFanpage(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-colors">Hủy</button>
                <button onClick={handleAddFanpage} disabled={isSaving || !newFanpage.name.trim()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Kênh
                </button>
              </div>
            </div>
          )}

          {/* DANH SÁCH FANPAGE */}
          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '600px' }}>
            {fanpages.length === 0 && !showAddFanpage ? (
              <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Chưa có Fanpage nào được thêm.</div>
            ) : fanpages.map((page) => {
              const isEditing = editingFanpageId === page.id;

              return (
                <div key={page.id} className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-yellow-50/30 border-yellow-300' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                  {isEditing ? (
                    // CHẾ ĐỘ SỬA (INLINE EDIT)
                    <div className="space-y-3 animate-in fade-in text-sm">
                      <input autoFocus type="text" value={editFanpageData.name || ''} onChange={e => setEditFanpageData({...editFanpageData, name: e.target.value})} className="w-full border-b border-gray-300 px-1 py-1 focus:border-blue-500 outline-none font-bold text-gray-800 bg-transparent" placeholder="Tên Fanpage" />
                      <input type="text" value={editFanpageData.link || ''} onChange={e => setEditFanpageData({...editFanpageData, link: e.target.value})} className="w-full border border-gray-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none bg-white" placeholder="Đường dẫn (URL)" />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <select value={editFanpageData.status || ''} onChange={e => setEditFanpageData({...editFanpageData, status: e.target.value})} className="w-full border border-gray-200 rounded px-2 py-1.5 outline-none bg-white">
                          <option value="Hoạt động">Hoạt động tốt</option>
                          <option value="Bị hạn chế">Bị hạn chế</option>
                          <option value="Hủy đăng">Bị hủy đăng</option>
                          <option value="Nuôi mới">Đang nuôi mới</option>
                        </select>
                        <input type="text" value={editFanpageData.notes || ''} onChange={e => setEditFanpageData({...editFanpageData, notes: e.target.value})} className="w-full border border-gray-200 rounded px-2 py-1.5 outline-none bg-white" placeholder="Ghi chú" />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setEditingFanpageId(null)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center gap-1"><X className="w-3.5 h-3.5"/> Hủy</button>
                        <button onClick={saveEditFanpage} disabled={isSaving} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-1 disabled:opacity-50"><Check className="w-3.5 h-3.5"/> Lưu</button>
                      </div>
                    </div>
                  ) : (
                    // CHẾ ĐỘ XEM
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 text-base truncate">{page.name}</h4>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border shrink-0 ${
                              page.status === 'Hoạt động' ? 'bg-green-50 text-green-700 border-green-200' : 
                              page.status?.includes('hạn chế') || page.status?.includes('Hủy') ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {page.status || 'Hoạt động'}
                            </span>
                          </div>
                          {page.link && (
                            <a href={page.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate max-w-full">
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" /> Mở trang
                            </a>
                          )}
                        </div>
                        
                        {(canEdit || canDelete) && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {canEdit && <button onClick={() => { setEditingFanpageId(page.id); setEditFanpageData({...page}); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>}
                            {canDelete && <button onClick={() => handleDeleteFanpage(page.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        )}
                      </div>
                      {page.notes && <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 mt-1"><span className="font-semibold text-gray-600">Note:</span> {page.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            PHẦN 2: QUẢN LÝ TÀI NGUYÊN MEDIA (DRIVE, CANVA, VIDEO, ẢNH)
        ========================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-500" /> Kho Tài Nguyên Media
            </h3>
            {canEdit && !showAddMedia && (
              <button onClick={() => setShowAddMedia(true)} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors">
                <Plus className="w-4 h-4" /> Thêm File/Link
              </button>
            )}
          </div>

          {/* FORM THÊM MEDIA */}
          {showAddMedia && (
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 mb-5 animate-in fade-in">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-medium text-gray-700 mb-1">Tên tài liệu / Thư mục *</label>
                    <input type="text" autoFocus value={newMedia.title} onChange={e => setNewMedia({...newMedia, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Thư mục Ảnh QC Tháng 3" />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Loại File</label>
                    <select value={newMedia.type} onChange={e => setNewMedia({...newMedia, type: e.target.value as any})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                      <option value="drive">Google Drive</option>
                      <option value="canva">Thiết kế Canva</option>
                      <option value="video">Video / TikTok</option>
                      <option value="image">Hình ảnh</option>
                      <option value="doc">Tài liệu (Doc/Excel)</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Đường dẫn (URL) *</label>
                  <input type="text" value={newMedia.url} onChange={e => setNewMedia({...newMedia, url: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                  <input type="text" value={newMedia.description} onChange={e => setNewMedia({...newMedia, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Chứa ảnh gốc, video thô..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowAddMedia(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-colors">Hủy</button>
                <button onClick={handleAddMedia} disabled={isSaving || !newMedia.title.trim() || !newMedia.url.trim()} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Tài Nguyên
                </button>
              </div>
            </div>
          )}

          {/* DANH SÁCH TÀI NGUYÊN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1" style={{ maxHeight: '600px' }}>
            {mediaItems.length === 0 && !showAddMedia ? (
              <div className="col-span-2 py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Chưa có tài liệu Media nào.</div>
            ) : mediaItems.map((item) => (
              <div key={item.id} className="group p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full relative">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                    {getMediaIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-bold text-gray-800 text-sm truncate" title={item.title}>{item.title}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-0.5">{item.type}</p>
                  </div>
                </div>
                
                {item.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>}
                
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Truy cập ngay <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Nút xóa (Hiện khi hover) */}
                {canDelete && (
                  <button onClick={() => handleDeleteMedia(item.id)} className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Xóa tài nguyên">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
