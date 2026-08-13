import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis, CartesianGrid } from "recharts";
import { type ParticipantSummary, api } from "../api/client";

export function Dashboard() {
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.participants()
      .then(setParticipants)
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Cohort Overview</h2>
        <p className="mt-2 text-gray-500">Real-time sleep quality index (SQI) trends across all active research participants.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {participants.length === 0 && <div className="text-gray-400">No participants registered yet.</div>}
          
          {participants.map((p) => (
            <div 
              key={p.participant_id} 
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-1">Participant</div>
                  <div className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{p.participant_id}</div>
                </div>
                <div className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                  {p.session_count} Sessions
                </div>
              </div>
              
              <div className="text-sm font-semibold text-gray-500 mb-2">Recent SQI Trend</div>
              
              <div className="h-24 bg-gray-50/50 rounded-xl p-2 border border-gray-100 group-hover:bg-white transition-colors">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={p.sqi_trend.map((value, idx) => ({ idx, value }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
