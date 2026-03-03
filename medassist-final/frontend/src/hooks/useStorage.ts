export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHistory(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${API}/api/history/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function fetchStats(token: string) {
  try {
    const res = await fetch(`${API}/api/history/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function fetchAppointments(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${API}/api/appointments/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function createAppointment(token: string, data: any) {
  const res = await fetch(`${API}/api/appointments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create appointment");
  return res.json();
}

export async function updateAppointment(token: string, id: number, data: any) {
  const res = await fetch(`${API}/api/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export async function fetchProfile(token: string) {
  try {
    const res = await fetch(`${API}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function saveProfile(token: string, data: any) {
  let res = await fetch(`${API}/api/users/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (res.status === 404 || res.status === 405) {
    res = await fetch(`${API}/api/users/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

// Medications stay local (not in backend)
export interface MedEntry { id: string; name: string; dose: string; freq: string; time: string; }
const MED_KEY = "medassist_meds";
export function getMeds(userId: string | number): MedEntry[] {
  try {
    const all = JSON.parse(localStorage.getItem(MED_KEY) || "{}");
    return all[String(userId)] || [];
  } catch { return []; }
}
export function saveMed(userId: string | number, med: MedEntry) {
  try {
    const all = JSON.parse(localStorage.getItem(MED_KEY) || "{}");
    all[String(userId)] = [med, ...(all[String(userId)] || [])];
    localStorage.setItem(MED_KEY, JSON.stringify(all));
  } catch {}
}
export function deleteMed(userId: string | number, id: string) {
  try {
    const all = JSON.parse(localStorage.getItem(MED_KEY) || "{}");
    all[String(userId)] = (all[String(userId)] || []).filter((m: MedEntry) => m.id !== id);
    localStorage.setItem(MED_KEY, JSON.stringify(all));
  } catch {}
}