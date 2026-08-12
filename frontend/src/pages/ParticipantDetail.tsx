import { useState } from "react";

import { api } from "../api/client";

export function ParticipantDetail() {
  const [participantId, setParticipantId] = useState("P001");
  const [data, setData] = useState<any>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Participant Detail</h2>
      <div className="flex gap-2">
        <input className="rounded border px-2 py-1" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
        <button className="rounded bg-teal-700 px-3 py-1 text-white" onClick={() => api.compareParticipant(participantId).then(setData)}>
          Load Comparison
        </button>
      </div>
      {data && (
        <div className="rounded border p-3 text-sm">
          <div>Paired sessions: {data.pairs}</div>
          <div>Percent change: {data.percent_change ?? "N/A"}%</div>
          <div>Test: {data.stats?.test ?? "N/A"}</div>
          <div>p-value: {data.stats?.p_value ?? "N/A"}</div>
        </div>
      )}
    </div>
  );
}
