'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { ActionGuide } from '@/components/ActionGuide';

export default function ActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [confirmedAction, setConfirmedAction] = useState<any>(null);

  useEffect(() => {
    fetchActions();
  }, [filter]);

  const fetchActions = async () => {
    try {
      const data =
        filter === 'all' ? await api.getActions() : await api.getActions(filter);
      setActions(data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (actionId: string) => {
    try {
      await api.confirmAction(actionId, comment);
      // Show action guide instead of alert
      setConfirmedAction(selectedAction);
      setSelectedAction(null);
      setComment('');
      fetchActions();
    } catch (error) {
      console.error('Failed to confirm action:', error);
      alert('액션 확인에 실패했습니다.');
    }
  };

  const handleReject = async (actionId: string) => {
    try {
      await api.rejectAction(actionId, comment);
      alert('액션이 거부되었습니다.');
      setSelectedAction(null);
      setComment('');
      fetchActions();
    } catch (error) {
      console.error('Failed to reject action:', error);
      alert('액션 거부에 실패했습니다.');
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return priority;
    }
  };

  const getActionTypeVariant = (type: string) => {
    switch (type) {
      case 'update_agenda':
        return 'info';
      case 'create_principle':
        return 'success';
      case 'update_principle':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionTypeName = (type: string) => {
    switch (type) {
      case 'update_agenda':
        return '아젠다 업데이트';
      case 'create_principle':
        return '원칙 생성';
      case 'update_principle':
        return '원칙 업데이트';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <>
        <Header title="액션" />
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">로딩 중...</div>
        </div>
      </>
    );
  }

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <>
      <Header title="Actions" />
      <div className="p-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 font-serif">
            Actions
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review and execute recommended actions
          </p>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={filter}
          onTabChange={setFilter}
        />

        {/* Actions List */}
        {actions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                액션이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {action.title}
                        </h3>
                        <Badge variant={getActionTypeVariant(action.action_type)}>
                          {getActionTypeName(action.action_type)}
                        </Badge>
                        <Badge variant={getPriorityVariant(action.priority)}>
                          {getPriorityName(action.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {action.description}
                      </p>

                      {/* Payload */}
                      {action.payload && (
                        <div className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            실행 내용
                          </p>
                          <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                            {JSON.stringify(action.payload, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            action.status === 'pending'
                              ? 'warning'
                              : action.status === 'confirmed'
                              ? 'success'
                              : 'danger'
                          }
                        >
                          {action.status === 'pending'
                            ? '대기 중'
                            : action.status === 'confirmed'
                            ? '확인됨'
                            : '거부됨'}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(action.created_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {action.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedAction(action)}
                          variant="primary"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          확인
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAction(action);
                          }}
                          variant="danger"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          거부
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Detail Drawer */}
      <Drawer
        isOpen={!!selectedAction}
        onClose={() => {
          setSelectedAction(null);
          setComment('');
        }}
        title="Action Details"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => handleReject(selectedAction?.id)}
            >
              Reject
            </Button>
            <Button onClick={() => handleConfirm(selectedAction?.id)}>
              Confirm
            </Button>
          </>
        }
      >
        {selectedAction && (
          <div className="space-y-6">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Title</label>
              <p className="mt-1 text-base font-medium text-slate-900 dark:text-slate-50">
                {selectedAction.title}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Description</label>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {selectedAction.description}
              </p>
            </div>
            {selectedAction.payload && (
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Execution Guide</label>
                <div className="mt-2 space-y-2">
                  {selectedAction.payload.steps?.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {idx + 1}.
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-2">
                Comment (optional)
              </label>
              <textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                rows={3}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Action Guide Modal */}
      {confirmedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>{confirmedAction.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionGuide
                guide={confirmedAction.payload || {}}
                onComplete={() => {
                  setConfirmedAction(null);
                }}
                onReportIssue={() => {
                  alert('문제 신고 기능은 곧 추가됩니다.');
                  setConfirmedAction(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
