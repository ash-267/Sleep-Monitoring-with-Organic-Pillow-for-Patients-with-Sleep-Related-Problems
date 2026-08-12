import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { api, type ParticipantSummary } from "../api/client";

export function Dashboard() {
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);

  useEffect(() => {
    api.participants().then(setParticipants).catch(() => setParticipants([]));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {participants.map((p) => (
          <div key={p.participant_id} className="rounded border p-3">
            <div className="font-medium">{p.participant_id}</div>
            <div className="text-sm text-gray-600">Sessions: {p.session_count}</div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={p.sqi_trend.map((value, idx) => ({ idx, value }))}>
                  <Line type="monotone" dataKey="value" stroke="#0f766e" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
