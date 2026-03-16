import React, { useState, useEffect } from 'react';
import { Package, Save, Loader2, ArrowLeft } from 'lucide-react';
import { getProjectData, setProjectData } from '../store';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  projectId: string;
  onBack: () => void;
}

export function ProductStrategy({ projectId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { checkPermission } = useAuth();
  const canEdit = checkPermission('strategy_product', 'edit');

  const [data, setData] = useState({
    coreValue: '',
    usp: '',
    pricing: '',
    positioning: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const savedData = await getProjectData(projectId, 'productStrategy');
      if (savedData) setData(savedData);
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    await setProjectData(projectId, 'productStrategy', data);
    setIsSaving(false);
    alert('✅ Đã lưu Chiến lược Sản phẩm!');
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Package className="w-6 h-6 text-amber-600" /> Chi Tiết Sản Phẩm</h2>
            <p className="text-sm text-gray-500 mt-1">Định vị và giá trị cốt lõi của sản phẩm</p>
          </div>
        </div>
        {canEdit && (
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-xl hover:bg-amber-700 font-medium shadow-sm transition-colors disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Chiến Lược
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-gray-800 mb-2">Giá trị cốt lõi (Core Value)</label>
          <textarea value={data.coreValue} onChange={e => setData({...data, coreValue: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-gray-50/50" placeholder="Sản phẩm giải quyết vấn đề cốt lõi gì cho khách hàng?..." />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-gray-800 mb-2">Điểm bán hàng độc nhất (USP)</label>
          <textarea value={data.usp} onChange={e => setData({...data, usp: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-gray-50/50" placeholder="Điểm khác biệt hoàn toàn so với đối thủ?..." />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-gray-800 mb-2">Chiến lược giá (Pricing)</label>
          <textarea value={data.pricing} onChange={e => setData({...data, pricing: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-gray-50/50" placeholder="Phân khúc giá, chính sách khuyến mãi, quà tặng..." />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-bold text-gray-800 mb-2">Định vị thương hiệu (Positioning)</label>
          <textarea value={data.positioning} onChange={e => setData({...data, positioning: e.target.value})} disabled={!canEdit} rows={5} className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-gray-50/50" placeholder="Khách hàng sẽ nhớ đến sản phẩm với hình ảnh nào?..." />
        </div>
      </div>
    </div>
  );
}
