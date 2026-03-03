"use client";
import { useState, useEffect } from "react";
import Protected from "@/components/Protected";
import { toast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchAppointments, createAppointment, updateAppointment } from "@/hooks/useStorage";

const SPECIALTIES = ["General Physician","Cardiologist","Neurologist","Orthopedic","Dermatologist","ENT Specialist","Pulmonologist","Gastroenterologist","Endocrinologist","Psychiatrist"];

export default function AppointmentsPage() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchAppointments(token).then(setAppointments);
  }, [token]);

  const book = async () => {
    if (!date || !time) { toast("Please select date and time"); return; }
    if (!token) return;
    setLoading(true);
    try {
      const entry = {
        doctor: doctor || "TBD",
        specialty,
        date,
        time,
        notes,
        status: "upcoming",
      };
      const newAppt = await createAppointment(token, entry);
      setAppointments(prev => [newAppt, ...prev]);
      setDate(""); setTime(""); setNotes(""); setDoctor("");
      toast("Appointment booked!");
    } catch {
      toast("Failed to book appointment");
    }
    setLoading(false);
  };

  const cancel = async (id: number) => {
    if (!token) return;
    try {
      await updateAppointment(token, id, { status: "cancelled" });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
      toast("Appointment cancelled");
    } catch {
      toast("Failed to cancel");
    }
  };

  return (
    <Protected>
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem 1rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>Appointments</h1>
        <div style={{ background: "var(--card)", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Book New Appointment</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}
              style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}>
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="Doctor name (optional)"
              style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={3}
              style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", resize: "none" }} />
            <button onClick={book} disabled={loading}
              style={{ padding: "0.85rem", borderRadius: 10, background: "linear-gradient(135deg,#042f2e,#0d9488)", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Your Appointments</h2>
        {appointments.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No appointments yet.</p>
        ) : appointments.map((a: any) => (
          <div key={a.id} style={{ background: "var(--card)", borderRadius: 12, padding: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{a.specialty} - {a.doctor}</div>
              <div style={{ opacity: 0.7, fontSize: ".9rem" }}>{a.date} at {a.time}</div>
              {a.notes && <div style={{ opacity: 0.6, fontSize: ".85rem" }}>{a.notes}</div>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: ".8rem", background: a.status === "upcoming" ? "#0d948820" : "#ef444420", color: a.status === "upcoming" ? "#0d9488" : "#ef4444" }}>
                {a.status}
              </span>
              {a.status === "upcoming" && (
                <button onClick={() => cancel(a.id)}
                  style={{ padding: "0.25rem 0.75rem", borderRadius: 8, background: "#ef444420", color: "#ef4444", border: "none", cursor: "pointer", fontSize: ".85rem" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Protected>
  );
}
