'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

export default function PrinciplesPage() {
  const [principles, setPrinciples] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);

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
      <Header title="Principles" />
      <div className="p-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 font-serif">
            Principles
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            AI-learned decision-making principles from your behavior
          </p>
        </div>

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
                No principles learned yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {principles.map((principle) => (
              <Card key={principle.id} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {principle.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {principle.description}
                      </p>
                    </div>
                    <Badge variant={getCategoryVariant(principle.category)}>
                      {getCategoryName(principle.category)}
                    </Badge>
                  </div>

                  {/* Confidence Progress */}
                  <Progress
                    value={Math.round(principle.confidence * 100)}
                    className="mt-4"
                  />

                  {/* Evidence (Collapsible) */}
                  {principle.evidence && principle.evidence.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setExpandedEvidence(
                          expandedEvidence === principle.id ? null : principle.id
                        )}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {expandedEvidence === principle.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Evidence ({principle.evidence.length} instances)
                      </button>
                      {expandedEvidence === principle.id && (
                        <div className="mt-3 space-y-2">
                          {principle.evidence.map((ev: { text?: string }, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 border border-slate-200 text-sm text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            >
                              {ev.text || JSON.stringify(ev)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500">
                      Created: {new Date(principle.created_at).toLocaleDateString('en-US')}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if (confirm(`Delete "${principle.content || principle.title}"?`)) {
                          try {
                            await api.deletePrinciple(principle.id);
                            setPrinciples(prev => prev.filter(p => p.id !== principle.id));
                          } catch (e) {
                            alert('Failed to delete principle.');
                          }
                        }
                      }}>
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
