'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Check,
  Terminal,
  BookOpen,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';

interface ActionGuideProps {
  guide: {
    command?: string;
    install_command?: string;
    post_steps?: string[];
    post_install?: string[];
    rollback?: string;
    rollback_command?: string;
    docs_url?: string;
    documentation_url?: string;
    estimated_time?: string;
    difficulty?: string;
  };
  onComplete: () => void;
  onReportIssue: () => void;
}

export function ActionGuide({ guide, onComplete, onReportIssue }: ActionGuideProps) {
  const [copied, setCopied] = useState(false);

  // Normalize field names from payload
  const command = guide.command || guide.install_command || '';
  const postSteps = guide.post_steps || guide.post_install || [];
  const rollback = guide.rollback || guide.rollback_command || '';
  const docsUrl = guide.docs_url || guide.documentation_url || '';

  const copyCommand = async () => {
    if (command) {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDifficultyVariant = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getDifficultyName = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
      default:
        return difficulty || '보통';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            액션 확인됨
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            다음 단계를 수행하세요
          </p>
        </div>
      </div>

      {/* Meta Information */}
      {(guide.estimated_time || guide.difficulty) && (
        <div className="flex gap-3">
          {guide.estimated_time && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {guide.estimated_time}
              </span>
            </div>
          )}
          {guide.difficulty && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <Zap className="h-4 w-4 text-slate-500" />
              <Badge variant={getDifficultyVariant(guide.difficulty)}>
                {getDifficultyName(guide.difficulty)}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Main Guide Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="space-y-6 p-6">
          {/* Command Section */}
          {command && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  1. 터미널에서 실행
                </h3>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <code className="flex-1 overflow-x-auto text-sm font-mono text-slate-900 dark:text-slate-100">
                    {command}
                  </code>
                  <Button
                    size="sm"
                    variant={copied ? 'ghost' : 'secondary'}
                    onClick={copyCommand}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        복사
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Post Steps Section */}
          {postSteps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                2. 설치 후
              </h3>
              <ul className="space-y-2">
                {postSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      •
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Documentation Link */}
          {docsUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                공식 문서:
              </span>
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                {docsUrl}
              </a>
            </div>
          )}

          {/* Rollback Section */}
          {rollback && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  ↩️ 문제 시 롤백
                </h3>
              </div>
              <code className="block overflow-x-auto text-sm font-mono text-amber-900 dark:text-amber-200">
                {rollback}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={onComplete}
          className="flex-1"
        >
          <Check className="mr-2 h-4 w-4" />
          완료 표시
        </Button>
        <Button
          variant="danger"
          onClick={onReportIssue}
          className="flex-1"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          문제 발생 신고
        </Button>
      </div>
    </div>
  );
}
