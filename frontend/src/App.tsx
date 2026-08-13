import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { ExportPage } from "./pages/Export";
import { ParticipantDetail } from "./pages/ParticipantDetail";
import { SessionCompare } from "./pages/SessionCompare";

const tabs = ["Dashboard", "Participant Detail", "Session Compare", "Export"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Dashboard");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white shadow-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                <svg className="h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                RestNTravel Comparator
              </h1>
            </div>
            <div className="hidden md:flex space-x-1 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
              {tabs.map((t) => (
                <button 
                  key={t} 
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    tab === t ? "bg-white text-indigo-900 shadow-md transform scale-[1.02]" : "text-indigo-100 hover:bg-white/10 hover:text-white"
                  }`} 
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile nav (visible only on small screens) */}
      <div className="md:hidden bg-indigo-900 px-4 pb-4 border-b border-indigo-800 shadow-md overflow-x-auto whitespace-nowrap">
        <div className="flex space-x-2">
          {tabs.map((t) => (
            <button 
              key={t} 
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t ? "bg-white text-indigo-900" : "text-indigo-100 bg-white/5"
              }`} 
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 fade-in animate-in">
        <div className="relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          
          {tab === "Dashboard" && <Dashboard />}
          {tab === "Participant Detail" && <ParticipantDetail />}
          {tab === "Session Compare" && <SessionCompare />}
          {tab === "Export" && <ExportPage />}
        </div>
      </main>
    </div>
  );
}
