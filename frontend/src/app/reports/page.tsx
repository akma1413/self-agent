'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = filter === 'all'
          ? await api.getReports()
          : await api.getReports(filter);
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [filter]);

  const getReportTypeVariant = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'info';
      case 'trend':
        return 'success';
      case 'tool_review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case 'weekly':
        return '주간 리포트';
      case 'trend':
        return '트렌드 분석';
      case 'tool_review':
        return '도구 리뷰';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <>
        <Header title="리포트" />
        <div className="flex h-screen items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">로딩 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="리포트" />
      <div className="p-6 space-y-6">
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
              variant={filter === 'pending' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              대기 중
            </Button>
            <Button
              variant={filter === 'reviewed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('reviewed')}
            >
              검토 완료
            </Button>
            <Button
              variant={filter === 'archived' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('archived')}
            >
              보관됨
            </Button>
          </CardContent>
        </Card>

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                리포트가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">
                        {report.title}
                      </CardTitle>
                      <Badge variant={getReportTypeVariant(report.report_type)}>
                        {getReportTypeName(report.report_type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                      {report.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(report.created_at).toLocaleDateString('ko-KR')}
                      </div>
                      <Badge
                        variant={report.status === 'pending' ? 'warning' : 'default'}
                        className="text-xs"
                      >
                        {report.status === 'pending' ? '대기' : '검토완료'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
