import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setErr("");

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        setErr("Keine Session gefunden. Bitte neu einloggen.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) setErr(error.message);
      else setProfile(data);
    };

    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <p>
        <Link to="/orders">→ Aufträge verwalten</Link>
      </p>

      <h1>Dashboard</h1>

      {err && <p style={{ color: "crimson" }}>❌ {err}</p>}

      {profile ? (
        <>
          <p>✅ Eingeloggt als: <b>{profile.full_name}</b></p>
          <p>Rolle: <b>{profile.role}</b></p>
          <p>Company ID: <code>{profile.company_id}</code></p>
        </>
      ) : (
        <p>Lade Profil…</p>
      )}

      <button style={{ marginTop: 12 }} onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  );
}
