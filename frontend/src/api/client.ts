export type ParticipantSummary = {
  participant_id: string;
  session_count: number;
  sqi_trend: number[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  participants: () => request<ParticipantSummary[]>("/api/participants"),
  compareParticipant: (participantId: string) => request(`/api/participants/${participantId}/compare`),
  getSession: (sessionId: string) => request(`/api/sessions/${sessionId}`),
  exportBySession: (sessionId: string) => `${API_BASE}/api/export/csv?session_id=${sessionId}`,
  exportByParticipant: (participantId: string) => `${API_BASE}/api/export/csv?participant_id=${participantId}`,
};
