import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCompanyId = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) throw new Error("Keine Session gefunden.");

    const { data, error } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    setCompanyId(data.company_id);
  };

  const loadOrders = async () => {
    setErr("");
    const { data, error } = await supabase
      .from("orders")
      .select("id, title, description, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    else setOrders(data);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadCompanyId();
        await loadOrders();
      } catch (e) {
        setErr(e?.message ?? "Unbekannter Fehler");
      }
    })();
  }, []);

  const createOrder = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!companyId) throw new Error("Company ID noch nicht geladen.");

      const { error } = await supabase.from("orders").insert({
        title,
        description,
        company_id: companyId,
      });

      if (error) throw error;

      setTitle("");
      setDescription("");
      await loadOrders();
    } catch (e) {
      setErr(e?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Aufträge</h2>

      <form onSubmit={createOrder} style={{ marginBottom: 24 }}>
        <h4>Neuen Auftrag anlegen</h4>

        <input
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <textarea
          placeholder="Beschreibung"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <br />

        <button disabled={loading || !companyId}>
          {loading ? "Speichern..." : "Auftrag erstellen"}
        </button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>

      <h4>Deine Aufträge</h4>
      {orders.length === 0 && <p>Noch keine Aufträge</p>}

      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            <b>{o.title}</b> {!o.is_active && "(inaktiv)"}
            <br />
            <small>{o.description}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
