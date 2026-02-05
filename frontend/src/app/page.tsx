'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckSquare, Play, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import type { Report } from '@/lib/types';

interface SummaryData {
  pendingReports: number;
  pendingActions: number;
  activePrinciples: number;
}

export default function Home() {
  const [summary, setSummary] = useState<SummaryData>({
    pendingReports: 0,
    pendingActions: 0,
    activePrinciples: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reports, actions, principles] = await Promise.all([
          api.getPendingReports(),
          api.getPendingActions(),
          api.getPrinciples(),
        ]);

        setSummary({
          pendingReports: reports.length,
          pendingActions: actions.length,
          activePrinciples: principles.length,
        });

        const allReports = await api.getReports();
        setRecentReports(allReports.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleTriggerProcess = async () => {
    try {
      await api.triggerProcess();
      alert('분석 프로세스가 시작되었습니다.');
    } catch (error) {
      console.error('Failed to trigger process:', error);
      alert('프로세스 시작에 실패했습니다.');
    }
  };

  const handleRunPipeline = async () => {
    try {
      await api.runPipeline(true);
      alert('파이프라인이 백그라운드에서 실행되었습니다.');
    } catch (error) {
      console.error('Failed to run pipeline:', error);
      alert('파이프라인 실행에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="대시보드" />
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">로딩 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 font-serif">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back. Here&apos;s what&apos;s happening.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            number="01"
            label="Reports"
            value={summary.pendingReports}
            trend={{ value: '+12%', direction: 'up' }}
          />
          <MetricCard
            number="02"
            label="Pending Actions"
            value={summary.pendingActions}
            trend={{ value: 'needs review', direction: 'neutral' }}
          />
          <MetricCard
            number="03"
            label="Principles"
            value={summary.activePrinciples}
            trend={{ value: '-2 this week', direction: 'down' }}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleTriggerProcess}>
                <Play className="mr-2 h-4 w-4" />
                분석 프로세스 시작
              </Button>
              <Button onClick={handleRunPipeline} variant="secondary">
                <Play className="mr-2 h-4 w-4" />
                파이프라인 실행
              </Button>
              <Link href="/reports">
                <Button variant="secondary">
                  <FileText className="mr-2 h-4 w-4" />
                  리포트 보기
                </Button>
              </Link>
              <Link href="/actions">
                <Button variant="secondary">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  액션 검토
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 리포트</CardTitle>
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                아직 리포트가 없습니다.
              </p>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="flex items-start justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-50">
                            {report.title}
                          </h4>
                          <Badge variant={report.status === 'pending' ? 'warning' : 'default'}>
                            {report.status === 'pending' ? '대기' : '검토완료'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {report.summary}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                          {new Date(report.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <TrendingUp className="ml-4 h-5 w-5 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
