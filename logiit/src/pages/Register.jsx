import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // 1) Signup -> User ist danach direkt eingeloggt (weil Confirm email aus)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // 2) RPC: Company + Profile anlegen (admin)
      const { error: rpcError } = await supabase.rpc("create_company_and_profile", {
        company_name: companyName,
        full_name: fullName,
      });
      if (rpcError) throw rpcError;

      // 3) Weiter
      navigate("/dashboard");
    } catch (e) {
      setErr(e?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h2>Logiit – Firma registrieren</h2>

      <form onSubmit={handleRegister} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Firmenname"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          placeholder="Dein Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          type="password"
          placeholder="Passwort (min. 8 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button disabled={loading}>
          {loading ? "Erstelle Account…" : "Registrieren"}
        </button>

        {err && <p style={{ color: "crimson" }}>❌ {err}</p>}
      </form>

      <p style={{ marginTop: 16 }}>
        Schon registriert? <Link to="/login">Zum Login</Link>
      </p>
    </div>
  );
}
