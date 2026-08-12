export function DisclaimerBanner() {
  return (
    <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      Sleep stage estimates are derived from surrogate sensors (HRV, motion, respiration proxies) and are NOT
      clinical-grade. Accuracy ceiling: Cohen&apos;s κ 0.4–0.7 vs polysomnography.
    </div>
  );
}
