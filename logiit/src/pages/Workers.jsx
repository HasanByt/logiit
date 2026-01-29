import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Workers() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const invite = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Nicht eingeloggt");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-worker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, full_name: fullName }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");

      setMsg(`✅ Invite erstellt für ${email}`);
      setEmail("");
      setFullName("");
    } catch (e) {
      setErr(e?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Mitarbeiter einladen</h2>

      <form onSubmit={invite} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" type="email" required />
        <button disabled={loading}>{loading ? "..." : "Einladen"}</button>
      </form>

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
