import React, { useState, useEffect } from 'react';
import { Users, Save, Loader2, ArrowLeft } from 'lucide-react';
import { getProjectData, setProjectData } from '../store';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  projectId: string;
  onBack: () => void;
}

export function CustomerStrategy({ projectId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { checkPermission } = useAuth();
  const canEdit = checkPermission('strategy_customer', 'edit');

  const [data, setData] = useState({
    demographics: '',
    painPoints: '',
    desires: '',
    behavior: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const savedData = await getProjectData(projectId, 'customerStrategy');
      if (savedData) setData(savedData);
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    await setProjectData(projectId, 'customerStrategy', data);
    setIsSaving(false);
    alert('✅ Đã lưu Chân dung Khách hàng!');
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="w-6 h-6 text-purple-600" /> Chân Dung Khách Hàng</h2>
            <p className="text-sm text-gray-500 mt-1">Phân tích hành vi và tâm lý khách hàng mục tiêu</p>
          </div>
        </div>
        {canEdit && (
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 font-medium shadow-sm transition-colors disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Phân Tích
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-purple-900 mb-2">Nhân khẩu học (Demographics)</label>
          <textarea value={data.demographics} onChange={e => setData({...data, demographics: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50/50" placeholder="Độ tuổi, giới tính, thu nhập, nghề nghiệp, vị trí..." />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-purple-900 mb-2">Nỗi đau (Pain Points)</label>
          <textarea value={data.painPoints} onChange={e => setData({...data, painPoints: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50/50" placeholder="Khách hàng đang gặp khó khăn gì chưa giải quyết được?..." />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-purple-900 mb-2">Mong muốn (Desires)</label>
          <textarea value={data.desires} onChange={e => setData({...data, desires: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50/50" placeholder="Điều khách hàng khao khát đạt được sau khi mua hàng?..." />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-purple-900 mb-2">Hành vi mua (Buying Behavior)</label>
          <textarea value={data.behavior} onChange={e => setData({...data, behavior: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50/50" placeholder="Thường mua ở đâu? Ai quyết định? Thích đọc nội dung gì?..." />
        </div>
      </div>
    </div>
  );
}
