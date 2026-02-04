'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Bell, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <Header title="설정" />
      <div className="p-6 space-y-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle>API 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  API URL
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:8000"
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <Button variant="primary">저장</Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle>데이터베이스</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  데이터베이스 연결 상태 및 통계
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      전체 리포트
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                      0
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      전체 액션
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                      0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle>알림 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  새 리포트 알림 받기
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  대기 중인 액션 알림 받기
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  주간 요약 이메일 받기
                </span>
              </label>
              <Button variant="primary">저장</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle>시스템 정보</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">
                  버전
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-50">1.0.0</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">
                  환경
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-50">
                  Development
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">
                  마지막 업데이트
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-50">
                  {new Date().toLocaleDateString('ko-KR')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
