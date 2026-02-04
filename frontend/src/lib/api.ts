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
  getAgendas: () => fetchAPI<any[]>('/agendas'),
  getAgenda: (id: string) => fetchAPI<any>(`/agendas/${id}`),

  // Reports
  getReports: (status?: string) => fetchAPI<any[]>(`/reports${status ? `?status=${status}` : ''}`),
  getPendingReports: () => fetchAPI<any[]>('/reports/pending'),
  getReport: (id: string) => fetchAPI<any>(`/reports/${id}`),
  reviewReport: (id: string) => fetchAPI<any>(`/reports/${id}/review`, { method: 'POST' }),

  // Actions
  getActions: (status?: string) => fetchAPI<any[]>(`/actions${status ? `?status=${status}` : ''}`),
  getPendingActions: () => fetchAPI<any[]>('/actions/pending'),
  confirmAction: (id: string, comment?: string) =>
    fetchAPI<any>(`/actions/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),
  rejectAction: (id: string, comment?: string) =>
    fetchAPI<any>(`/actions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Principles
  getPrinciples: () => fetchAPI<any[]>('/principles'),

  // Process
  triggerProcess: () => fetchAPI<any>('/process/vibecoding/process', { method: 'POST' }),
  getWeeklySummary: () => fetchAPI<any>('/process/vibecoding/weekly-summary'),
};
