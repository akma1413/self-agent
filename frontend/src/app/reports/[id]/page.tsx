'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Archive } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const reportData = await api.getReport(params.id);
        setReport(reportData);

        // Fetch related actions
        const allActions = await api.getActions();
        const relatedActions = allActions.filter(
          (action: any) => action.report_id === params.id
        );
        setActions(relatedActions);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleReview = async () => {
    try {
      await api.reviewReport(params.id);
      setReport({ ...report, status: 'reviewed' });
      alert('리포트를 검토 완료했습니다.');
    } catch (error) {
      console.error('Failed to review report:', error);
      alert('검토 처리에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="리포트 상세" />
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">로딩 중...</div>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Header title="리포트 상세" />
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">
            리포트를 찾을 수 없습니다.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="리포트 상세" />
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        </Link>

        {/* Report Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">{report.report_type}</Badge>
                  <Badge
                    variant={report.status === 'pending' ? 'warning' : 'success'}
                  >
                    {report.status === 'pending' ? '대기 중' : '검토 완료'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {report.status === 'pending' && (
                  <Button onClick={handleReview}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    검토 완료
                  </Button>
                )}
                <Button variant="secondary">
                  <Archive className="mr-2 h-4 w-4" />
                  보관
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>요약</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300">
              {report.summary}
            </p>
          </CardContent>
        </Card>

        {/* Analysis */}
        {report.analysis && (
          <Card>
            <CardHeader>
              <CardTitle>상세 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                  {JSON.stringify(report.analysis, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Actions */}
        {actions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>관련 액션 ({actions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actions.map((action) => (
                  <Link key={action.id} href={`/actions`}>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-50">
                          {action.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {action.description}
                        </p>
                      </div>
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
                          ? '대기'
                          : action.status === 'confirmed'
                          ? '확인됨'
                          : '거부됨'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>메타데이터</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">
                  생성일
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-50">
                  {new Date(report.created_at).toLocaleString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">
                  업데이트
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-50">
                  {new Date(report.updated_at).toLocaleString('ko-KR')}
                </dd>
              </div>
              {report.agenda_id && (
                <div>
                  <dt className="font-medium text-slate-600 dark:text-slate-400">
                    관련 아젠다
                  </dt>
                  <dd className="mt-1 text-slate-900 dark:text-slate-50">
                    {report.agenda_id}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
