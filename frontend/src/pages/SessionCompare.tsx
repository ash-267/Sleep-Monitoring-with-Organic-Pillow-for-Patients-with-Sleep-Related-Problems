import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, Legend } from "recharts";
import { api } from "../api/client";
import { DisclaimerBanner } from "../components/DisclaimerBanner";

export function SessionCompare() {
  const [baselineId, setBaselineId] = useState("");
  const [interventionId, setInterventionId] = useState("");
  const [baselineData, setBaselineData] = useState<any>(null);
  const [interventionData, setInterventionData] = useState<any>(null);

  const loadData = async () => {
    if (baselineId) api.getSession(baselineId).then(setBaselineData);
    if (interventionId) api.getSession(interventionId).then(setInterventionData);
  };

  const renderSessionCharts = (session: any, title: string, color: string) => {
    if (!session) return <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No {title} Data</div>;

    const sensorData = session?.sensor_readings?.map((r: any, i: number) => ({ 
      i, 
      hr: r.heart_rate ?? 0, 
      motion: Math.sqrt(r.motion_x ** 2 + r.motion_y ** 2 + r.motion_z ** 2),
      pressure_general: (r.pressure_1 + r.pressure_2) / 2,
      pressure_cervical: r.pressure_cervical_zone ?? 0
    })) ?? [];

    const stagedData = session?.derived_metrics?.estimated_stage_summary || {};

    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-2xl border bg-white shadow-sm flex justify-between items-center ${title === 'Intervention' ? 'border-indigo-200 bg-indigo-50/10' : 'border-gray-200'}`}>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title} Session</h3>
            <p className="text-sm text-gray-500">ID: {session.session_id.substring(0,8)}...</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${title === 'Intervention' ? 'text-indigo-600' : 'text-gray-700'}`}>
              {session?.derived_metrics?.sqi_score ?? "N/A"}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">SQI Score</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            Heart Rate Trend
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorData}>
                <defs>
                  <linearGradient id={`colorHr${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="i" hide />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Area type="monotone" dataKey="hr" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#colorHr${title})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
              Pressure Distribution map
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium border border-amber-100">Cervical vs General</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensorData.slice(0, 100)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="i" hide />
                <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '10px', border: '1px solid #f3f4f6'}} />
                <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="pressure_general" name="General Head" stackId="a" fill="#D1D5DB" />
                <Bar dataKey="pressure_cervical" name="Cervical Zone" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Session Comparison <span className="text-lg font-medium text-gray-500 ml-2">Objective Analytics</span></h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Baseline Session UUID</label>
            <input 
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 bg-gray-50/50" 
              placeholder="e.g. 123e4567-e89b-12d3..." 
              value={baselineId} 
              onChange={(e) => setBaselineId(e.target.value)} 
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Intervention Session UUID</label>
            <input 
              className="w-full rounded-xl border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 bg-indigo-50/30" 
              placeholder="e.g. 123e4567-e89b-12d3..." 
              value={interventionId} 
              onChange={(e) => setInterventionId(e.target.value)} 
            />
          </div>
          <div className="flex items-end">
            <button 
              className="w-full md:w-auto rounded-xl bg-gray-900 px-8 py-2.5 font-semibold text-white shadow-md hover:bg-gray-800 transition duration-300" 
              onClick={loadData}
            >
              Analyze Pairs
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          {renderSessionCharts(baselineData, "Baseline", "#9ca3af")}
        </div>
        <div>
          {renderSessionCharts(interventionData, "Intervention", "#4f46e5")}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
