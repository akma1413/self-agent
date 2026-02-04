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

        {/* Analysis - Structured UI */}
        {report.analysis && (
          <>
            {/* Verdict Card */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                      판정 결과
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          report.analysis.verdict === 'ADOPT'
                            ? 'success'
                            : report.analysis.verdict === 'CONSIDER'
                            ? 'warning'
                            : 'danger'
                        }
                        className="text-lg px-4 py-1"
                      >
                        {report.analysis.verdict || 'N/A'}
                      </Badge>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        신뢰도: {report.analysis.confidence || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difference Section */}
            {report.analysis.difference_from_current && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📊</span>
                    <span>현재 시스템과의 차이</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.analysis.difference_from_current.what_changes && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                        변경 사항
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.analysis.difference_from_current.what_changes}
                      </p>
                    </div>
                  )}
                  {report.analysis.difference_from_current.breaking_changes && (
                    <div>
                      <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                        ⚠️ Breaking Changes
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                        {report.analysis.difference_from_current.breaking_changes.map(
                          (item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {report.analysis.difference_from_current.compatible && (
                    <div>
                      <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                        ✓ 호환 가능
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                        {report.analysis.difference_from_current.compatible.map(
                          (item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Benefits Section */}
            {report.analysis.benefits && report.analysis.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>✅</span>
                    <span>반영 시 이점</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.analysis.benefits.map((benefit: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                      >
                        <Badge
                          variant={
                            benefit.impact === 'HIGH'
                              ? 'danger'
                              : benefit.impact === 'MEDIUM'
                              ? 'warning'
                              : 'info'
                          }
                          className="mt-0.5"
                        >
                          {benefit.impact || 'N/A'}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-slate-900 dark:text-slate-50 font-medium">
                            {benefit.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Migration Guide */}
            {report.analysis.migration_guide && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🚀</span>
                    <span>마이그레이션 가이드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm">
                    {report.analysis.migration_guide.estimated_time && (
                      <div>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          예상 시간:
                        </span>
                        <span className="ml-2 text-slate-900 dark:text-slate-50">
                          {report.analysis.migration_guide.estimated_time}
                        </span>
                      </div>
                    )}
                    {report.analysis.migration_guide.difficulty && (
                      <div>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          난이도:
                        </span>
                        <span className="ml-2">
                          <Badge
                            variant={
                              report.analysis.migration_guide.difficulty === 'HIGH'
                                ? 'danger'
                                : report.analysis.migration_guide.difficulty === 'MEDIUM'
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {report.analysis.migration_guide.difficulty}
                          </Badge>
                        </span>
                      </div>
                    )}
                  </div>

                  {report.analysis.migration_guide.steps &&
                    report.analysis.migration_guide.steps.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-3">
                          단계별 가이드
                        </h4>
                        <ol className="space-y-2">
                          {report.analysis.migration_guide.steps.map(
                            (step: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex gap-3 text-slate-700 dark:text-slate-300"
                              >
                                <span className="font-bold text-slate-900 dark:text-slate-50">
                                  {idx + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            )
                          )}
                        </ol>
                      </div>
                    )}

                  {report.analysis.migration_guide.rollback && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-2">
                        🔄 롤백 방법
                      </h4>
                      <p className="text-amber-800 dark:text-amber-300 text-sm">
                        {report.analysis.migration_guide.rollback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Usage Guide */}
            {report.analysis.usage_guide && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📖</span>
                    <span>사용법</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.analysis.usage_guide.getting_started && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                        시작하기
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.analysis.usage_guide.getting_started}
                      </p>
                    </div>
                  )}

                  {report.analysis.usage_guide.key_features &&
                    report.analysis.usage_guide.key_features.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                          주요 기능
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                          {report.analysis.usage_guide.key_features.map(
                            (feature: string, idx: number) => (
                              <li key={idx}>{feature}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {report.analysis.usage_guide.tips &&
                    report.analysis.usage_guide.tips.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                          💡 팁
                        </h4>
                        <ul className="space-y-2">
                          {report.analysis.usage_guide.tips.map(
                            (tip: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex gap-2 text-slate-700 dark:text-slate-300"
                              >
                                <span className="text-slate-400">•</span>
                                <span>{tip}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Decision Factors */}
            {report.analysis.decision_factors && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💡</span>
                    <span>판단 기준</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.analysis.decision_factors.adopt_if &&
                    report.analysis.decision_factors.adopt_if.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                          ✓ 채택 권장 조건
                        </h4>
                        <ul className="space-y-1">
                          {report.analysis.decision_factors.adopt_if.map(
                            (condition: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex gap-2 text-slate-700 dark:text-slate-300"
                              >
                                <span className="text-green-500">✓</span>
                                <span>{condition}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {report.analysis.decision_factors.skip_if &&
                    report.analysis.decision_factors.skip_if.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                          ✗ 스킵 권장 조건
                        </h4>
                        <ul className="space-y-1">
                          {report.analysis.decision_factors.skip_if.map(
                            (condition: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex gap-2 text-slate-700 dark:text-slate-300"
                              >
                                <span className="text-red-500">✗</span>
                                <span>{condition}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-8 bg-red-500 hover:bg-red-600 text-white"
                    onClick={async () => {
                      if (confirm('이 리포트를 스킵하시겠습니까?')) {
                        try {
                          await api.archiveReport(params.id);
                          router.push('/reports');
                        } catch (e) {
                          alert('스킵 처리 중 오류가 발생했습니다.');
                        }
                      }
                    }}
                  >
                    <span className="mr-2">❌</span>
                    스킵
                  </Button>
                  <Button
                    size="lg"
                    className="px-8 bg-green-500 hover:bg-green-600"
                    onClick={async () => {
                      if (confirm('이 리포트를 채택하시겠습니까?')) {
                        try {
                          await api.reviewReport(params.id);
                          router.push('/reports');
                        } catch (e) {
                          alert('채택 처리 중 오류가 발생했습니다.');
                        }
                      }
                    }}
                  >
                    <span className="mr-2">✅</span>
                    채택
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
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
