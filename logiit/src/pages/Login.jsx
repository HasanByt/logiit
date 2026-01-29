import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/dashboard");
  };

  const handleForgot = async () => {
    setErr("");
    setMsg("");
    if (!email) return setErr("Bitte zuerst E-Mail eingeben.");

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setErr(error.message);
    else setMsg("✅ Passwort-Reset Mail wurde gesendet (wenn SMTP später aktiv ist).");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>{loading ? "..." : "Login"}</button>
        <button type="button" onClick={handleForgot}>Passwort vergessen</button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {msg && <p style={{ color: "green" }}>{msg}</p>}
      </form>

      <p style={{ marginTop: 16 }}>
        Noch keine Firma? <Link to="/register">Registrieren</Link>
      </p>
    </div>
  );
}
