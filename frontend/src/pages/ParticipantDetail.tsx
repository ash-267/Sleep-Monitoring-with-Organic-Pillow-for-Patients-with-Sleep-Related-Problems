import { useState } from "react";
import { api } from "../api/client";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ParticipantDetail() {
  const [participantId, setParticipantId] = useState("P001");
  const [data, setData] = useState<any>(null);

  const handleLoad = () => {
    api.compareParticipant(participantId).then(setData);
  };

  const chartData = data ? [
    {
      name: "SQI (Objective)",
      Baseline: (data.baseline_sqi.reduce((a:any,b:any)=>a+b,0) / (data.baseline_sqi.length || 1)).toFixed(1),
      Intervention: (data.intervention_sqi.reduce((a:any,b:any)=>a+b,0) / (data.intervention_sqi.length || 1)).toFixed(1),
    },
    {
      name: "Neck Pain (Subjective)",
      Baseline: data.baseline_outcomes ? data.baseline_outcomes[0] || 0 : 0,
      Intervention: data.intervention_outcomes ? data.intervention_outcomes[0] || 0 : 0,
    }
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">Participant Analysis</h2>
        <div className="flex gap-3 max-w-md">
          <input 
            className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 bg-gray-50/50 transition duration-300 hover:bg-white" 
            value={participantId} 
            onChange={(e) => setParticipantId(e.target.value)} 
          />
          <button 
            className="rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg transition-all duration-300 transform active:scale-95" 
            onClick={handleLoad}
          >
            Compare
          </button>
        </div>
      </div>

      {data && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Statistical Comparison</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100">
                <div className="text-sm text-indigo-600 font-semibold mb-1">Paired Sessions</div>
                <div className="text-3xl font-black text-indigo-900">{data.pairs}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                <div className="text-sm text-emerald-600 font-semibold mb-1">Improvement</div>
                <div className="text-3xl font-black text-emerald-900">{data.percent_change > 0 ? '+' : ''}{data.percent_change ?? "N/A"}%</div>
              </div>
            </div>
            
            <div className="space-y-3 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Test Used</span>
                <span className="font-semibold text-gray-900 bg-gray-200 px-2 py-0.5 rounded-lg">{data.stats?.test ?? "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">P-Value</span>
                <span className={`font-semibold ${data.stats?.p_value < 0.05 ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {data.stats?.p_value !== null ? parseFloat(data.stats.p_value).toFixed(4) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">95% CI</span>
                <span className="font-semibold text-gray-900">
                  {data.stats?.ci_95 ? `[${data.stats.ci_95[0]}, ${data.stats.ci_95[1]}]` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
             <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Outcomes: Baseline vs Intervention</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 500}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                    <Bar dataKey="Baseline" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Intervention" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}
      <DisclaimerBanner />
    </div>
  );
}
