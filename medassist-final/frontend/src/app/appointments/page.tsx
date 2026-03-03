"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { toast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchAppointments, createAppointment, updateAppointment,  from "@/hooks/useStorage";

const SPECIALTIES = ["General Physician","Cardiologist","Neurologist","Orthopedic","Dermatologist","ENT Specialist","Pulmonologist","Gastroenterologist","Endocrinologist","Psychiatrist"];
const DOCTORS = {
  "General Physician": ["Dr. Arjun Sharma","Dr. Priya Nair","Dr. Ravi Kumar"],
  "Cardiologist": ["Dr. Suresh Mehta","Dr. Anjali Reddy"],
  "Neurologist": ["Dr. Kiran Patel","Dr. Sunita Rao"],
  "Orthopedic": ["Dr. Vikram Singh","Dr. Meera Pillai"],
  "Dermatologist": ["Dr. Asha Iyer","Dr. Rahul Gupta"],
};
const TIME_SLOTS = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const load = () => { if (user) setAppointments(fetchAppointments(user.id)); };
  useEffect(() => { load(); }, [user]);

  const book = () => {
    if (!date || !time) { toast("⚠️ Please select date and time slot"); return; }
    const entry: AppointmentEntry = {
      id: crypto.randomUUID(),
      doctor: doctor || "TBD",
      specialty, date, time, notes,
      status: "scheduled",
    };
    createAppointment(user!.id, entry);
    setBookedSlots(p => [...p, time]);
    load();
    setShowForm(false);
    setSpecialty(""); setDoctor(""); setDate(""); setTime(""); setNotes("");
    toast("✅ Appointment booked!");
  };

  const cancel = (id: string) => { updateAppointment(user!.id, id, "cancelled"); load(); toast("🗑️ Appointment cancelled"); };
  const complete = (id: string) => { updateAppointment(user!.id, id, "completed"); load(); toast("✅ Marked as completed"); };

  const statusColor = (s: AppointmentEntry["status"]) => s === "scheduled" ? "bt" : s === "completed" ? "bg" : "ba";
  const docs = (DOCTORS as any)[specialty] || [];

  return (
    <Protected>
      <div className="wrap" style={{ paddingTop: 36 }}>
        <div className="sec"><h2>📅 Book <span>Appointments</span></h2><p>Schedule consultations with healthcare professionals</p></div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button className="btn btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? "✕ Cancel" : "+ Book Appointment"}</button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 28, borderColor: "rgba(13,148,136,.25)" }}>
            <h3 style={{ fontSize: ".93rem", fontWeight: 600, color: "var(--th)", marginBottom: 20 }}>New Appointment</h3>

            <div className="g2">
              <div className="fld">
                <label className="L">Specialty</label>
                <select value={specialty} onChange={e => { setSpecialty(e.target.value); setDoctor(""); }}>
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="fld">
                <label className="L">Doctor</label>
                <select value={doctor} onChange={e => setDoctor(e.target.value)}>
                  <option value="">{specialty ? "Select doctor" : "Select specialty first"}</option>
                  {docs.map((d: string) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="fld">
                <label className="L">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="fld">
                <label className="L">Notes</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for visit..." />
              </div>
            </div>

            {/* Time slots */}
            <div className="fld">
              <label className="L">Available Time Slots</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {TIME_SLOTS.map(slot => (
                  <button key={slot} className={`slot-btn ${time === slot ? "booked" : ""}`}
                    onClick={() => setTime(slot)}>
                    {time === slot ? "✓ " : ""}{slot}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={book}>Confirm Booking →</button>
          </div>
        )}

        {/* Appointments list */}
        {appointments.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--tm)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📅</div>
            <p>No appointments yet.<br />Click <strong>+ Book Appointment</strong> to schedule one.</p>
          </div>
        ) : (
          appointments.map(a => (
            <div key={a.id} className="hi" style={{ cursor: "default" }}>
              <div>
                <div className="hid">{a.date}{a.time ? ` · ${a.time}` : ""}</div>
                <div className="hit">👨‍⚕️ {a.doctor}</div>
                <div className="his">{a.specialty}{a.notes ? ` · ${a.notes}` : ""}</div>
              </div>
              <div className="hir">
                <span className={`bdg ${statusColor(a.status)}`} style={{ textTransform: "capitalize" }}>{a.status}</span>
                {a.status === "scheduled" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => complete(a.id)} style={{ background: "none", border: "none", fontSize: ".72rem", color: "var(--grn)", cursor: "pointer" }}>✅</button>
                    <button onClick={() => cancel(a.id)}   style={{ background: "none", border: "none", fontSize: ".72rem", color: "var(--red)", cursor: "pointer" }}>🗑️</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Protected>
  );
}
