'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface StackItem {
  id: string;
  category: string;
  tool_name: string;
  version?: string;
  config?: Record<string, unknown>;
  notes?: string;
}

interface EditDialogProps {
  item: StackItem | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (item: Partial<StackItem>) => void;
}

function EditDialog({ item, isNew, onClose, onSave }: EditDialogProps) {
  const [formData, setFormData] = useState({
    category: item?.category || '',
    tool_name: item?.tool_name || '',
    version: item?.version || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-4 border-slate-900 dark:border-slate-100 overflow-hidden">
        {/* Decorative accent bar */}
        <div className="h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {isNew ? '새 스택 추가' : '스택 수정'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                카테고리
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: 터미널, 하네스, 오케스트레이터"
                disabled={!isNew}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                도구 이름
              </label>
              <input
                type="text"
                value={formData.tool_name}
                onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
                placeholder="예: Ghostty, Claude Code, OMC"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                버전 (선택)
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="예: 1.0.0"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                메모 (선택)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="추가 정보나 메모를 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors resize-none font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 border-2 border-slate-300 dark:border-slate-600 font-semibold"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 font-semibold shadow-lg"
            >
              {isNew ? '추가' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [stackItems, setStackItems] = useState<StackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<StackItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch stack items
  useEffect(() => {
    fetchStackItems();
  }, []);

  const fetchStackItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/v1/stack');
      if (!response.ok) throw new Error('스택 정보를 불러오는데 실패했습니다');
      const data = await response.json();
      setStackItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: StackItem) => {
    setEditingItem(item);
    setIsNewItem(false);
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsNewItem(true);
    setShowDialog(true);
  };

  const handleSave = async (formData: Partial<StackItem>) => {
    try {
      if (isNewItem) {
        // Create new item
        const response = await fetch('http://localhost:8000/api/v1/stack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('추가에 실패했습니다');
      } else if (editingItem) {
        // Update existing item
        const response = await fetch(`http://localhost:8000/api/v1/stack/${editingItem.category}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('수정에 실패했습니다');
      }

      setShowDialog(false);
      fetchStackItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다');
    }
  };

  const handleDelete = async (category: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/stack/${category}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('삭제에 실패했습니다');
      fetchStackItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다');
    }
  };

  return (
    <>
      <Header title="설정" />
      <div className="p-6 space-y-6">
        {/* Stack Configuration */}
        <Card className="border-4 border-slate-900 dark:border-slate-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <CardHeader className="border-b-4 border-slate-900 dark:border-slate-100 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 dark:bg-slate-100 rounded-lg">
                  <Layers className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">내 현재 스택</CardTitle>
              </div>
              <Button
                onClick={handleAdd}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 font-semibold shadow-lg gap-2"
              >
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            ) : stackItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Layers className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  아직 스택이 비어있습니다
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  + 추가 버튼을 눌러 첫 스택을 등록하세요
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stackItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative flex items-center justify-between p-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all hover:shadow-lg"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
                          {item.tool_name}
                        </span>
                        {item.version && (
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                            v{item.version}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.category)}
                        className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showDialog && (
        <EditDialog
          item={editingItem}
          isNew={isNewItem}
          onClose={() => setShowDialog(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
