import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { api } from "../api/client";

export function SessionCompare() {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<any>(null);

  const hrData = session?.sensor_readings?.map((r: any, i: number) => ({ i, hr: r.heart_rate ?? 0, motion: Math.sqrt(r.motion_x ** 2 + r.motion_y ** 2 + r.motion_z ** 2) })) ?? [];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Session Compare</h2>
      <div className="flex gap-2">
        <input className="w-full rounded border px-2 py-1" placeholder="Session UUID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        <button className="rounded bg-teal-700 px-3 py-1 text-white" onClick={() => api.getSession(sessionId).then(setSession)}>
          Load Session
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded border p-2">
          <div className="text-sm font-medium">Heart Rate Trend</div>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={hrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="i" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hr" stroke="#2563eb" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56 rounded border p-2">
          <div className="text-sm font-medium">Movement Events Timeline</div>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={hrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="i" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="motion" stroke="#dc2626" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56 rounded border p-2">
          <div className="text-sm font-medium">Cervical Pressure Heatmap-Style Bars</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={session?.sensor_readings?.slice(0, 80)?.map((r: any, i: number) => ({ i, pressure: r.pressure_cervical_zone ?? r.pressure_1 })) ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="i" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pressure" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded border p-3">
          <div className="text-sm font-medium">SQI Comparison</div>
          <div className="text-2xl font-bold">{session?.derived_metrics?.sqi_score ?? "N/A"}</div>
        </div>
      </div>
    </div>
  );
}
