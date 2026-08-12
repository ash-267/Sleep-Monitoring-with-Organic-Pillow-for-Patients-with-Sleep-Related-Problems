import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function ExportPage() {
  const [sessionId, setSessionId] = useState("");
  const [participantId, setParticipantId] = useState("P001");

  const downloadCsv = async (query: Record<string, string>, filename: string) => {
    const params = new URLSearchParams(query);
    const response = await fetch(`${API_BASE}/api/export/csv?${params.toString()}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Export CSV</h2>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input className="w-full rounded border px-2 py-1" placeholder="Session UUID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          <button className="rounded bg-teal-700 px-3 py-1 text-white" onClick={() => downloadCsv({ session_id: sessionId }, "session-export.csv")}>
            Download Session CSV
          </button>
        </div>
        <div className="flex gap-2">
          <input className="w-full rounded border px-2 py-1" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
          <button className="rounded bg-slate-700 px-3 py-1 text-white" onClick={() => downloadCsv({ participant_id: participantId }, "participant-export.csv")}>
            Download Participant CSV
          </button>
        </div>
      </div>
    </div>
  );
}
