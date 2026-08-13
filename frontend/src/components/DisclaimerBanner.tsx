export function DisclaimerBanner() {
  return (
    <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-800 shadow-sm flex items-start space-x-3 transition duration-300 hover:bg-blue-50">
      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="font-semibold mb-1">Academic & Research Limitation Notice</p>
        <p className="text-blue-700/80 leading-relaxed">
          Stage estimations and metrics presented are derived from surrogate commercial-grade sensors (HRV, motion, 
          respiration proxies) and should not be interpreted as diagnostic or clinical-grade. Accuracy ceiling is established at 
          Cohen's κ 0.4–0.7 when validated against gold-standard polysomnography.
        </p>
      </div>
    </div>
  );
}
