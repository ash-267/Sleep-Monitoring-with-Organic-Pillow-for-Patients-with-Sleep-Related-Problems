import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function ExportPage() {
  const [sessionId, setSessionId] = useState("");
  const [participantId, setParticipantId] = useState("P001");
  const [isExporting, setIsExporting] = useState(false);

  const downloadCsv = async (query: Record<string, string>, filename: string) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams(query);
      const response = await fetch(`${API_BASE}/api/export/csv?${params.toString()}`);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Research Data Export</h2>
        <p className="mt-2 text-gray-500">Export raw sensor telemetry, derived staging metrics, and summary statistics bundled for academic manuscript preparation (CSV format).</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">Export Full Participant Cohort</h3>
          <p className="text-sm text-gray-500 mb-4">Export all baseline and intervention sessions associated with a single participant.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 bg-gray-50 hover:bg-white transition" 
              placeholder="e.g. P001" 
              value={participantId} 
              onChange={(e) => setParticipantId(e.target.value)} 
            />
            <button 
              disabled={isExporting || !participantId}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition" 
              onClick={() => downloadCsv({ participant_id: participantId }, `export_${participantId}_full.csv`)}
            >
              {isExporting ? "Bundling..." : "Download Cohort CSV"}
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">Export Single Session</h3>
          <p className="text-sm text-gray-500 mb-4">Export high-resolution time-series data for a specific session UUID.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 px-4 py-2 bg-gray-50 hover:bg-white transition" 
              placeholder="Session UUID" 
              value={sessionId} 
              onChange={(e) => setSessionId(e.target.value)} 
            />
            <button 
              disabled={isExporting || !sessionId}
              className="rounded-xl bg-gray-800 px-6 py-2.5 font-semibold text-white shadow hover:bg-gray-700 disabled:opacity-50 transition" 
              onClick={() => downloadCsv({ session_id: sessionId }, `export_session_${sessionId.substring(0,8)}.csv`)}
            >
              {isExporting ? "Bundling..." : "Download Session CSV"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100 flex items-start space-x-3">
        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Note for peer-review:</strong> Extracted CSVs contain merged sensor frames and derived metrics aligned to identical timestamps. Non-present optional sensors (e.g., MAX30102) will output as empty columns to maintain structural integrity for R/SPSS ingestion.
        </p>
      </div>
    </div>
  );
}
