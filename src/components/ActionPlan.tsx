import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, Plus, Edit3, Trash2, UserPlus, 
  Calendar, Loader2, CheckCircle2, Circle, Clock, LayoutList 
} from 'lucide-react';
import { getProjectData, setProjectData } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuid } from 'uuid';
import type { Project, ActionPhase, ActionSubPhase, ActionTask } from '../types';

interface Props {
  project: Project;
}

export default function ActionPlan({ project }: Props) {
  const [phases, setPhases] = useState<ActionPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [expandedSubPhases, setExpandedSubPhases] = useState<string[]>([]);

  const { checkPermission } = useAuth();
  const canEdit = checkPermission('action_plan', 'edit');
  const canDelete = checkPermission('action_plan', 'delete');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getProjectData(project.id, 'actionPlan');
      if (data && Array.isArray(data)) {
        setPhases(data);
        // Tự động mở rộng tất cả các giai đoạn khi tải xong
        setExpandedPhases(data.map((p: ActionPhase) => p.id));
        setExpandedSubPhases(data.flatMap((p: ActionPhase) => p.subPhases?.map((sp: ActionSubPhase) => sp.id) || []));
      }
      setLoading(false);
    };
    loadData();
  }, [project.id]);

  const savePhases = async (newData: ActionPhase[]) => {
    setPhases(newData);
    await setProjectData(project.id, 'actionPlan', newData);
  };

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSubPhase = (id: string) => {
    setExpandedSubPhases(prev => 
      prev.includes(id) ? prev.filter(spId => spId !== id) : [...prev, id]
    );
  };

  // ================= THAO TÁC VỚI GIAI ĐOẠN (PHASE) =================
  const handleAddPhase = () => {
    if (!canEdit) return;
    const name = prompt('Nhập tên Giai đoạn mới (VD: Giai đoạn 1: Chuẩn bị):');
    if (name && name.trim()) {
      const newPhase: ActionPhase = { id: uuid(), name: name.trim(), subPhases: [] };
      const newData = [...phases, newPhase];
      savePhases(newData);
      setExpandedPhases([...expandedPhases, newPhase.id]);
    }
  };

  const handleEditPhase = (id: string, currentName: string) => {
    if (!canEdit) return;
    const name = prompt('Sửa tên Giai đoạn:', currentName);
    if (name && name.trim()) {
      savePhases(phases.map(p => p.id === id ? { ...p, name: name.trim() } : p));
    }
  };

  const handleDeletePhase = (id: string) => {
    if (!canDelete) return;
    if (confirm('Xóa Giai đoạn này sẽ xóa toàn bộ công việc bên trong. Bạn chắc chắn chứ?')) {
      savePhases(phases.filter(p => p.id !== id));
    }
  };

  // ================= THAO TÁC VỚI HẠNG MỤC (SUB-PHASE) =================
  const handleAddSubPhase = (phaseId: string) => {
    if (!canEdit) return;
    const name = prompt('Nhập tên Hạng mục công việc (VD: Quay dựng Video):');
    if (name && name.trim()) {
      const newSubPhase: ActionSubPhase = { id: uuid(), name: name.trim(), tasks: [] };
      const newData = phases.map(p => {
        if (p.id === phaseId) {
          return { ...p, subPhases: [...(p.subPhases || []), newSubPhase] };
        }
        return p;
      });
      savePhases(newData);
      setExpandedSubPhases([...expandedSubPhases, newSubPhase.id]);
      if (!expandedPhases.includes(phaseId)) setExpandedPhases([...expandedPhases, phaseId]);
    }
  };

  const handleEditSubPhase = (phaseId: string, subId: string, currentName: string) => {
    if (!canEdit) return;
    const name = prompt('Sửa tên Hạng mục:', currentName);
    if (name && name.trim()) {
      savePhases(phases.map(p => p.id === phaseId ? {
        ...p,
        subPhases: p.subPhases.map(sp => sp.id === subId ? { ...sp, name: name.trim() } : sp)
      } : p));
    }
  };

  const handleDeleteSubPhase = (phaseId: string, subId: string) => {
    if (!canDelete) return;
    if (confirm('Xóa Hạng mục này sẽ xóa các công việc bên trong. Tiếp tục?')) {
      savePhases(phases.map(p => p.id === phaseId ? {
        ...p,
        subPhases: p.subPhases.filter(sp => sp.id !== subId)
      } : p));
    }
  };

  // ================= THAO TÁC VỚI CÔNG VIỆC (TASK) =================
  const handleAddTask = (phaseId: string, subId: string) => {
    if (!canEdit) return;
    const name = prompt('Nhập tên Công việc cụ thể:');
    if (name && name.trim()) {
      const newTask: ActionTask = { id: uuid(), name: name.trim(), status: 'pending' };
      savePhases(phases.map(p => p.id === phaseId ? {
        ...p,
        subPhases: p.subPhases.map(sp => sp.id === subId ? { ...sp, tasks: [...(sp.tasks || []), newTask] } : sp)
      } : p));
    }
  };

  const handleEditTask = (phaseId: string, subId: string, taskId: string, task: ActionTask) => {
    if (!canEdit) return;
    const name = prompt('Sửa tên Công việc:', task.name);
    if (name && name.trim()) {
      updateTask(phaseId, subId, taskId, { name: name.trim() });
    }
  };

  const updateTask = (phaseId: string, subId: string, taskId: string, updates: Partial<ActionTask>) => {
    if (!canEdit) return;
    savePhases(phases.map(p => p.id === phaseId ? {
      ...p,
      subPhases: p.subPhases.map(sp => sp.id === subId ? {
        ...sp,
        tasks: sp.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      } : sp)
    } : p));
  };

  const handleDeleteTask = (phaseId: string, subId: string, taskId: string) => {
    if (!canDelete) return;
    if (confirm('Bạn muốn xóa công việc này?')) {
      savePhases(phases.map(p => p.id === phaseId ? {
        ...p,
        subPhases: p.subPhases.map(sp => sp.id === subId ? {
          ...sp,
          tasks: sp.tasks.filter(t => t.id !== taskId)
        } : sp)
      } : p));
    }
  };

  const toggleTaskStatus = (phaseId: string, subId: string, taskId: string, currentStatus: string) => {
    if (!canEdit) return;
    const newStatus = currentStatus === 'completed' ? 'pending' : currentStatus === 'pending' ? 'in_progress' : 'completed';
    updateTask(phaseId, subId, taskId, { status: newStatus as any });
  };

  const assignTask = (phaseId: string, subId: string, taskId: string, currentAssignee?: string) => {
    if (!canEdit) return;
    const assignee = prompt('Giao việc cho ai?', currentAssignee || '');
    if (assignee !== null) {
      updateTask(phaseId, subId, taskId, { assignee: assignee.trim() });
    }
  };

  const setTaskDate = (phaseId: string, subId: string, taskId: string, isEnd: boolean = false) => {
    if (!canEdit) return;
    const dateStr = prompt(`Nhập ${isEnd ? 'Deadline' : 'Ngày bắt đầu'} (DD/MM/YYYY):`);
    if (dateStr !== null) {
      updateTask(phaseId, subId, taskId, isEnd ? { endDate: dateStr.trim() } : { startDate: dateStr.trim() });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p>Đang tải Kế hoạch hành động...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutList className="w-7 h-7 text-indigo-600" /> Action Plan
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kế hoạch triển khai & Phân công công việc</p>
        </div>
        {canEdit && (
          <button 
            onClick={handleAddPhase} 
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Thêm Giai Đoạn
          </button>
        )}
      </div>

      {phases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <LayoutList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">Dự án chưa có kế hoạch hành động</h3>
          <p className="text-gray-500 mt-1 mb-4">Hãy bắt đầu bằng cách tạo một giai đoạn triển khai mới.</p>
          {canEdit && (
            <button onClick={handleAddPhase} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors font-medium">
              <Plus className="w-4 h-4" /> Tạo Giai Đoạn Đầu Tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all">
              {/* HEADER GIAI ĐOẠN (PHASE) */}
              <div 
                className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-indigo-100/50 transition-colors"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedPhases.includes(phase.id) ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5 text-indigo-600" />}
                  <h3 className="text-lg font-bold text-indigo-900">{phase.name}</h3>
                </div>
                
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button onClick={(e) => { e.stopPropagation(); handleAddSubPhase(phase.id); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Hạng mục
                    </button>
                  )}
                  {canEdit && <button onClick={(e) => { e.stopPropagation(); handleEditPhase(phase.id, phase.name); }} className="p-1.5 text-indigo-600 hover:bg-indigo-200 rounded-lg"><Edit3 className="w-4 h-4" /></button>}
                  {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeletePhase(phase.id); }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>

              {/* DANH SÁCH HẠNG MỤC (SUB-PHASE) */}
              {expandedPhases.includes(phase.id) && (
                <div className="p-4 space-y-4">
                  {(!phase.subPhases || phase.subPhases.length === 0) ? (
                    <p className="text-sm text-gray-500 italic text-center py-2">Chưa có hạng mục công việc nào.</p>
                  ) : phase.subPhases.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div 
                        className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSubPhase(sub.id)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedSubPhases.includes(sub.id) ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                          <h4 className="font-semibold text-gray-800">{sub.name}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <button onClick={(e) => { e.stopPropagation(); handleAddTask(phase.id, sub.id); }} className="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" /> Việc mới
                            </button>
                          )}
                          {canEdit && <button onClick={(e) => { e.stopPropagation(); handleEditSubPhase(phase.id, sub.id, sub.name); }} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>}
                          {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteSubPhase(phase.id, sub.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </div>

                      {/* DANH SÁCH CÔNG VIỆC (TASK) */}
                      {expandedSubPhases.includes(sub.id) && (
                        <div className="bg-white divide-y divide-gray-100">
                          {(!sub.tasks || sub.tasks.length === 0) ? (
                            <p className="text-xs text-gray-400 italic px-4 py-3">Chưa có đầu việc chi tiết.</p>
                          ) : sub.tasks.map((task) => (
                            <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                              
                              <div className="flex items-start gap-3 flex-1">
                                <button 
                                  onClick={() => toggleTaskStatus(phase.id, sub.id, task.id, task.status)}
                                  className="mt-0.5 shrink-0 transition-colors"
                                >
                                  {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                                   task.status === 'in_progress' ? <Clock className="w-5 h-5 text-amber-500" /> :
                                   <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />}
                                </button>
                                
                                <div>
                                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                    {task.name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                                    {/* Nút Phân công */}
                                    <button 
                                      onClick={() => assignTask(phase.id, sub.id, task.id, task.assignee)}
                                      className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${task.assignee ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md' : ''}`}
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                      {task.assignee || 'Giao việc'}
                                    </button>
                                    
                                    {/* Nút Deadline */}
                                    <button 
                                      onClick={() => setTaskDate(phase.id, sub.id, task.id, true)}
                                      className={`flex items-center gap-1 hover:text-red-600 transition-colors ${task.endDate ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md' : ''}`}
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      {task.endDate || 'Deadline'}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                {canEdit && <button onClick={() => handleEditTask(phase.id, sub.id, task.id, task)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>}
                                {canDelete && <button onClick={() => handleDeleteTask(phase.id, sub.id, task.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
