const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeSymptoms(token: string, data: {
  symptoms: string[];
  severity: string;
  duration_days: number;
  temperature?: number;
  additional_notes?: string;
}) {
  const res = await fetch(`${API}/api/symptoms/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}