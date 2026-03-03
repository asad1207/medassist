"use client";

export interface HistoryEntry {
  id: string;
  date: string;
  symptoms: string[];
  severity: string;
  duration: string;
  risk: "mild" | "moderate" | "emergency";
  risk_score: number;
  recommendation: string;
}

const KEY = "medassist_history";

export function getHistory(userId: string): HistoryEntry[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    return all[userId] || [];
  } catch { return []; }
}

export function saveHistoryEntry(userId: string, entry: HistoryEntry) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    all[userId] = [entry, ...(all[userId] || [])].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

export interface MedEntry { id: string; name: string; dose: string; freq: string; time: string; }
const MED_KEY = "medassist_meds";
export function getMeds(userId: string): MedEntry[] {
  try { const all = JSON.parse(localStorage.getItem(MED_KEY) || "{}"); return all[userId] || []; } catch { return []; }
}
export function saveMed(userId: string, med: MedEntry) {
  try { const all = JSON.parse(localStorage.getItem(MED_KEY) || "{}"); all[userId] = [med, ...(all[userId] || [])]; localStorage.setItem(MED_KEY, JSON.stringify(all)); } catch {}
}
export function deleteMed(userId: string, id: string) {
  try { const all = JSON.parse(localStorage.getItem(MED_KEY) || "{}"); all[userId] = (all[userId] || []).filter((m: MedEntry) => m.id !== id); localStorage.setItem(MED_KEY, JSON.stringify(all)); } catch {}
}

export interface AppointmentEntry { id: string; doctor: string; specialty: string; date: string; time: string; notes: string; status: "scheduled" | "completed" | "cancelled"; }
const APT_KEY = "medassist_appointments";
export function getAppointments(userId: string): AppointmentEntry[] {
  try { const all = JSON.parse(localStorage.getItem(APT_KEY) || "{}"); return all[userId] || []; } catch { return []; }
}
export function saveAppointment(userId: string, a: AppointmentEntry) {
  try { const all = JSON.parse(localStorage.getItem(APT_KEY) || "{}"); all[userId] = [a, ...(all[userId] || [])]; localStorage.setItem(APT_KEY, JSON.stringify(all)); } catch {}
}
export function updateAppointmentStatus(userId: string, id: string, status: AppointmentEntry["status"]) {
  try { const all = JSON.parse(localStorage.getItem(APT_KEY) || "{}"); all[userId] = (all[userId] || []).map((a: AppointmentEntry) => a.id === id ? { ...a, status } : a); localStorage.setItem(APT_KEY, JSON.stringify(all)); } catch {}
}
