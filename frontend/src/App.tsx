import { useState } from "react";

import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { Dashboard } from "./pages/Dashboard";
import { ExportPage } from "./pages/Export";
import { ParticipantDetail } from "./pages/ParticipantDetail";
import { SessionCompare } from "./pages/SessionCompare";

const tabs = ["Dashboard", "ParticipantDetail", "SessionCompare", "Export"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Dashboard");

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">RestNTravel Sleep Comparator</h1>
      <DisclaimerBanner />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} className={`rounded px-3 py-1 ${tab === t ? "bg-teal-700 text-white" : "bg-slate-200"}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Dashboard" && <Dashboard />}
      {tab === "ParticipantDetail" && <ParticipantDetail />}
      {tab === "SessionCompare" && <SessionCompare />}
      {tab === "Export" && <ExportPage />}
    </div>
  );
}
