import { useState } from "react";

import { api } from "../api/client";

export function ExportPage() {
  const [sessionId, setSessionId] = useState("");
  const [participantId, setParticipantId] = useState("P001");

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Export CSV</h2>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input className="w-full rounded border px-2 py-1" placeholder="Session UUID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          <a className="rounded bg-teal-700 px-3 py-1 text-white" href={api.exportBySession(sessionId)}>
            Download Session CSV
          </a>
        </div>
        <div className="flex gap-2">
          <input className="w-full rounded border px-2 py-1" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
          <a className="rounded bg-slate-700 px-3 py-1 text-white" href={api.exportByParticipant(participantId)}>
            Download Participant CSV
          </a>
        </div>
      </div>
    </div>
  );
}
