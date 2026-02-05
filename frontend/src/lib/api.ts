import type {
  Action,
  Agenda,
  Principle,
  ProcessResult,
  Report,
  WeeklySummary,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Agendas
  getAgendas: () => fetchAPI<Agenda[]>('/agendas'),
  getAgenda: (id: string) => fetchAPI<Agenda>(`/agendas/${id}`),

  // Reports
  getReports: (status?: string) =>
    fetchAPI<Report[]>(`/reports${status ? `?status=${status}` : ''}`),
  getPendingReports: () => fetchAPI<Report[]>('/reports/pending'),
  getReport: (id: string) => fetchAPI<Report>(`/reports/${id}`),
  reviewReport: (id: string) =>
    fetchAPI<Report>(`/reports/${id}/review`, { method: 'POST' }),
  archiveReport: (id: string) =>
    fetchAPI<Report>(`/reports/${id}/archive`, { method: 'POST' }),

  // Actions
  getActions: (status?: string) =>
    fetchAPI<Action[]>(`/actions${status ? `?status=${status}` : ''}`),
  getPendingActions: () => fetchAPI<Action[]>('/actions/pending'),
  confirmAction: (id: string, comment?: string) =>
    fetchAPI<Action>(`/actions/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),
  rejectAction: (id: string, comment?: string) =>
    fetchAPI<Action>(`/actions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Principles
  getPrinciples: () => fetchAPI<Principle[]>('/principles'),
  getPrinciple: (id: string) => fetchAPI<Principle>(`/principles/${id}`),
  updatePrinciple: (id: string, data: { content?: string; category?: string; confidence_score?: number }) =>
    fetchAPI<Principle>(`/principles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deletePrinciple: (id: string) =>
    fetchAPI<ProcessResult>(`/principles/${id}`, { method: 'DELETE' }),

  // Process
  triggerProcess: () =>
    fetchAPI<ProcessResult>('/process/vibecoding/process', { method: 'POST' }),
  getWeeklySummary: () =>
    fetchAPI<WeeklySummary>('/process/vibecoding/weekly-summary'),
};
