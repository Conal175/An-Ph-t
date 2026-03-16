import React, { useState, useEffect } from 'react';
import { Swords, Save, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getProjectData, setProjectData } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuid } from 'uuid';

interface Props {
  projectId: string;
  onBack: () => void;
}

interface Competitor {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
  ourAdvantage: string;
}

export function CompetitorStrategy({ projectId, onBack }: Props) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { checkPermission } = useAuth();
  const canEdit = checkPermission('competitors', 'edit');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const savedData = await getProjectData(projectId, 'competitorStrategy');
      if (savedData && Array.isArray(savedData)) {
        setCompetitors(savedData);
      } else if (savedData === null) {
        // Mặc định 1 form trống nếu chưa có data
        setCompetitors([{ id: uuid(), name: '', strengths: '', weaknesses: '', ourAdvantage: '' }]);
      }
      setLoading(false);
    };
    loadData();
  }, [projectId]);

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    await setProjectData(projectId, 'competitorStrategy', competitors);
    setIsSaving(false);
    alert('✅ Đã lưu thông tin Phân tích Đối thủ!');
  };

  const addCompetitor = () => {
    setCompetitors([{ id: uuid(), name: '', strengths: '', weaknesses: '', ourAdvantage: '' }, ...competitors]);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Swords className="w-6 h-6 text-red-600" /> Tình Báo Đối Thủ</h2>
            <p className="text-sm text-gray-500 mt-1">Phân tích điểm mạnh, điểm yếu và lợi thế cạnh tranh</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <button onClick={addCompetitor} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-colors">
              <Plus className="w-4 h-4" /> Thêm Đối Thủ
            </button>
          )}
          {canEdit && (
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 font-medium shadow-sm transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Phân Tích
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {competitors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
            Chưa có dữ liệu đối thủ. Hãy thêm đối thủ đầu tiên.
          </div>
        ) : competitors.map((comp, index) => (
          <div key={comp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-red-50/50 border-b border-red-100 p-4 flex items-center justify-between">
              <div className="flex-1 max-w-sm">
                <input 
                  type="text" 
                  value={comp.name} 
                  onChange={e => updateCompetitor(comp.id, 'name', e.target.value)} 
                  disabled={!canEdit}
                  placeholder={`Tên đối thủ cạnh tranh #${index + 1}...`}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-bold text-gray-800 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              {canEdit && <button onClick={() => removeCompetitor(comp.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>}
            </div>
            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm mạnh (Strengths)</label>
                <textarea value={comp.strengths} onChange={e => updateCompetitor(comp.id, 'strengths', e.target.value)} disabled={!canEdit} rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-gray-50/50 resize-none" placeholder="Họ đang làm rất tốt điều gì?..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm yếu (Weaknesses)</label>
                <textarea value={comp.weaknesses} onChange={e => updateCompetitor(comp.id, 'weaknesses', e.target.value)} disabled={!canEdit} rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-gray-50/50 resize-none" placeholder="Họ đang bị khách hàng chê ở điểm nào?..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-700 mb-2">Lợi thế của chúng ta</label>
                <textarea value={comp.ourAdvantage} onChange={e => updateCompetitor(comp.id, 'ourAdvantage', e.target.value)} disabled={!canEdit} rows={4} className="w-full border border-red-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-red-50/30 resize-none" placeholder="Cách chúng ta đánh bại đối thủ này?..." />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
