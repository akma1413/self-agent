'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PrinciplesPage() {
  const [principles, setPrinciples] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrinciples();
  }, [filter]);

  const fetchPrinciples = async () => {
    try {
      const data = await api.getPrinciples();
      if (filter === 'all') {
        setPrinciples(data);
      } else {
        setPrinciples(data.filter((p: any) => p.category === filter));
      }
    } catch (error) {
      console.error('Failed to fetch principles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'workflow':
        return 'info';
      case 'tool_preference':
        return 'success';
      case 'quality':
        return 'warning';
      case 'communication':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'workflow':
        return '워크플로우';
      case 'tool_preference':
        return '도구 선호도';
      case 'quality':
        return '품질';
      case 'communication':
        return '커뮤니케이션';
      default:
        return category;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <>
        <Header title="원칙" />
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">로딩 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="원칙" />
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                추출된 원칙
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                AI가 학습한 사용자의 작업 원칙과 선호도
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'workflow' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('workflow')}
            >
              워크플로우
            </Button>
            <Button
              variant={filter === 'tool_preference' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('tool_preference')}
            >
              도구 선호도
            </Button>
            <Button
              variant={filter === 'quality' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('quality')}
            >
              품질
            </Button>
            <Button
              variant={filter === 'communication' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('communication')}
            >
              커뮤니케이션
            </Button>
          </CardContent>
        </Card>

        {/* Principles List */}
        {principles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                아직 추출된 원칙이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <Card key={principle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">
                          {principle.title}
                        </CardTitle>
                        <Badge variant={getCategoryVariant(principle.category)}>
                          {getCategoryName(principle.category)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Confidence Score */}
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      신뢰도:
                    </span>
                    <span
                      className={`text-sm font-semibold ${getConfidenceColor(
                        principle.confidence
                      )}`}
                    >
                      {(principle.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Metadata */}
                  {principle.metadata && (
                    <div className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        추가 정보
                      </p>
                      <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                        {JSON.stringify(principle.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Evidence */}
                  {principle.evidence && principle.evidence.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        근거 ({principle.evidence.length})
                      </p>
                      <div className="space-y-2">
                        {principle.evidence.slice(0, 3).map((ev: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          >
                            {ev.text || JSON.stringify(ev)}
                          </div>
                        ))}
                        {principle.evidence.length > 3 && (
                          <p className="text-xs text-slate-500">
                            +{principle.evidence.length - 3}개 더 보기
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="mr-1 h-3 w-3" />
                      수정
                    </Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      if (confirm(`"${principle.content || principle.title}" 원칙을 삭제하시겠습니까?`)) {
                        try {
                          await api.deletePrinciple(principle.id);
                          setPrinciples(prev => prev.filter(p => p.id !== principle.id));
                        } catch (e) {
                          alert('삭제 중 오류가 발생했습니다.');
                        }
                      }
                    }}>
                      <Trash2 className="mr-1 h-3 w-3" />
                      삭제
                    </Button>
                  </div>

                  {/* Timestamp */}
                  <p className="mt-3 text-xs text-slate-500">
                    생성일: {new Date(principle.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
