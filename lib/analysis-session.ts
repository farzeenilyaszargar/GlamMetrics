const ANALYSIS_IMAGE_KEY = "glammetrics_pending_analysis_image";
const ANALYSIS_SOURCE_KEY = "glammetrics_pending_analysis_source";

export type AnalysisSource = "camera" | "upload";

export function setPendingAnalysisImage(imageDataUrl: string, source: AnalysisSource) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ANALYSIS_IMAGE_KEY, imageDataUrl);
  window.sessionStorage.setItem(ANALYSIS_SOURCE_KEY, source);
}

export function getPendingAnalysisImage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ANALYSIS_IMAGE_KEY);
}

export function getPendingAnalysisSource(): AnalysisSource | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(ANALYSIS_SOURCE_KEY);
  if (raw === "camera" || raw === "upload") return raw;
  return null;
}

export function clearPendingAnalysisImage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ANALYSIS_IMAGE_KEY);
  window.sessionStorage.removeItem(ANALYSIS_SOURCE_KEY);
}
