import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const styles = {
  section: {
    padding: "64px 24px",
  },
  container: {
    maxWidth: 1120,
    margin: "0 auto",
  },
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
  },
  heroText: {
    flex: "1 1 420px",
  },
  h1: {
    fontSize: 48,
    lineHeight: 1.1,
    margin: "0 0 16px",
    fontWeight: 800,
  },
  pLead: {
    fontSize: 18,
    color: "#4b5563",
    margin: "0 0 24px",
  },
  ctas: { display: "flex", gap: 12, flexWrap: "wrap" },
  btnPrimary: {
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  btnSecondary: {
    background: "#eef2ff",
    color: "#1e3a8a",
    border: "1px solid #c7d2fe",
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  heroArt: {
    flex: "1 1 360px",
    minWidth: 280,
    background: "linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    background: "white",
    border: "1px solid #d8dbe2ff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  },
  cardTitle: { fontSize: 18, margin: "8px 0 6px", fontWeight: 700 },
  cardText: { color: "#4b5563", margin: 0 },
  kicker: { color: "#2563eb", fontWeight: 700, letterSpacing: 1, fontSize: 13 },
  h2: { fontSize: 28, margin: "8px 0 16px", fontWeight: 800 },
  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 },
  listItem: { display: "flex", alignItems: "flex-start", gap: 12 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#eef2ff",
    color: "#1e3a8a",
    fontWeight: 800,
  },
  footer: {
    padding: "24px 24px 40px",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
};

function Landing() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSimular = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/simulacion");
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ ...styles.section, paddingTop: 80 }}>
        <div style={styles.container}>
          <div style={styles.hero}>
            <div style={styles.heroText}>
              <div style={styles.kicker}>Créditos en línea</div>
              <h1 style={styles.h1}>Obtén tu préstamo en minutos</h1>
              <p style={styles.pLead}>
                Solicita crédito rápido, seguro y sin papeleo. Todo 100% online,
                con tasas transparentes y respuesta inmediata.
              </p>
              <div style={styles.ctas}>
                <Link to="/register" style={styles.btnPrimary}>
                  Solicitar ahora
                </Link>
                <a href="#simular" style={styles.btnSecondary} onClick={handleSimular}>
                  Simular préstamo
                </a>
              </div>
            </div>

            {/* Simple illustration */}
            <div style={styles.heroArt} aria-hidden>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ ...styles.badge, background: "#dcfce7", color: "#166534" }}>✓</div>
                <div>
                  <div style={{ fontWeight: 700, color:"#000000ff"}}>Aprobación al instante</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>
                    Modelo de scoring inteligente y validación digital.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ ...styles.badge }}>💳</div>
                <div>
                  <div style={{ fontWeight: 700, color:"#000000ff" }}>Desembolso a tu cuenta</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Transferencia directa a tu cuenta, disponible 24/7.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ ...styles.badge, background: "#fff7ed", color: "#9a3412" }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 700, color:"#000000ff" }}>Proceso 100% digital</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Desde la simulación hasta la firma digital avanzada.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Cómo funciona */}
<section
  style={{
    ...styles.section,
    position: "relative",
    overflow: "hidden",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "#fff",
  }}
>
  {/* Overlay para legibilidad */}
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
    }}
  />

  <div style={{ ...styles.container, position: "relative" }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ ...styles.kicker, color: "#e5e7eb" }}>¿Cómo funciona?</div>
      <h2 style={{ ...styles.h2, color: "#ffffff" }}>Tu crédito en 3 pasos</h2>
    </div>

    <div style={styles.grid}>
      {/* Card 1 */}
      <div
        style={{
          ...styles.card,
          background: "rgba(17, 24, 39, 0.55)", // gris-azul oscuro translúcido
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          color: "#fff",
        }}
      >
        <div style={{ ...styles.badge, width: 40, height: 40, background: "rgba(255,255,255,0.15)", color: "#fff" }}>
          1
        </div>
        <div style={{ ...styles.cardTitle, color:"#ffffff" }}>Simula y solicita</div>
        <p style={{ ...styles.cardText, color:"#e5e7eb" }}>
          Elige monto y plazo, crea tu cuenta y completa tus datos en minutos.
        </p>
      </div>

      {/* Card 2 */}
      <div
        style={{
          ...styles.card,
          background: "rgba(17, 24, 39, 0.55)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          color: "#fff",
        }}
      >
        <div style={{ ...styles.badge, width: 40, height: 40, background: "rgba(255,255,255,0.15)", color: "#fff" }}>
          2
        </div>
        <div style={{ ...styles.cardTitle, color:"#ffffff" }}>Aprobación y firma digital</div>
        <p style={{ ...styles.cardText, color:"#e5e7eb" }}>
          Evaluación automática con scoring y validación biométrica o ClaveÚnica. Firma digital avanzada.
        </p>
      </div>

      {/* Card 3 */}
      <div
        style={{
          ...styles.card,
          background: "rgba(17, 24, 39, 0.55)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          color: "#fff",
        }}
      >
        <div style={{ ...styles.badge, width: 40, height: 40, background: "rgba(255,255,255,0.15)", color: "#fff" }}>
          3
        </div>
        <div style={{ ...styles.cardTitle, color:"#ffffff" }}>Desembolso 24/7</div>
        <p style={{ ...styles.cardText, color:"#e5e7eb" }}>
          Activamos tu préstamo y transferimos el dinero directo a tu cuenta.
        </p>
      </div>
    </div>

    {/* Microgarantías (opcional) */}
    <div style={{ marginTop: 16, color: "#e5e7eb", fontSize: 14, textAlign: "center" }}>
      Tasas transparentes • Sin filas ni papeleo • Todo 100% online
    </div>
  </div>
</section>


      {/* Beneficios */}
    <section style={{ ...styles.section}}>
    <div style={styles.container}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={styles.kicker}>Beneficios</div>
        <h2 style={styles.h2}>Todo lo que esperas de un crédito digital</h2>
        </div>

        <div style={styles.grid}>
        {[
            { icon: "🧮", title: "Simulación clara", text: "Calcula tu cuota y el costo total antes de aceptar." },
            { icon: "⚙️", title: "Proceso guiado", text: "Formulario simple y validaciones en línea." },
            { icon: "🛡️", title: "Evaluación segura", text: "Scoring + reglas de riesgo para decisiones justas." },
            { icon: "✍️", title: "Firma certificada", text: "ClaveÚnica o biometría; respaldo legal completo." },
            { icon: "💳", title: "Desembolso inmediato", text: "Transferencia a tu cuenta, disponible 24/7." },
            { icon: "💠", title: "Pagos fáciles", text: "Transbank/Servipag y recordatorios automáticos." },
            { icon: "🔒", title: "Privacidad y seguridad", text: "Datos cifrados y resguardo de documentos." },
            { icon: "🕐", title: "Soporte cuando lo necesitas", text: "Canales digitales para ayudarte en cada paso." },
        ].map((b, i) => (
            <div key={i} style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...styles.badge, width: 44, height: 44 }}>{b.icon}</div>
                <div>
                <div style={{ ...styles.cardTitle, color:"#000000ff"}}>{b.title}</div>
                <p style={styles.cardText}>{b.text}</p>
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>
    </section>


{/* Confianza / Seguridad */}
<section
  aria-labelledby="seguridad-title"
  style={{
    ...styles.section,
    position: "relative",
    overflow: "hidden",
    paddingTop: (styles.section?.paddingTop ?? 0) + 24,
    paddingBottom: (styles.section?.paddingBottom ?? 0) + 24,
    color: "#fff", // texto blanco
  }}
>
  {/* Imagen en blanco y negro */}
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "url('https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470')",
      backgroundSize: "auto",
      backgroundPosition: "center",
      filter: "grayscale(70%)", // blanco y negro
    }}
  />

  {/* Overlay oscuro para contraste */}
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.45)", // ajusta opacidad según gusto
    }}
  />

  {/* Contenido */}
  <div style={{ ...styles.container, position: "relative" }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div
        style={{
          ...styles.kicker, color: "#ffffff"
        }}
      >
        Confianza
      </div>
      <h2
        id="seguridad-title"
        style={{
          ...styles.h2,
          color: "#ffffff",
          
        }}
      >
        Tu seguridad es primero
      </h2>
    </div>

    <ul style={{ ...styles.list }}>
      <li
        style={{
          ...styles.listItem,
         
        }}
      >
        <span
          aria-hidden="true"
          style={{ ...styles.badge, background: "#dcfce7", color: "#166534" }}
        >
          🛡️
        </span>
        <span>
          <strong>Seguridad integral.</strong> Cifrado y buenas prácticas para proteger tus datos en cada paso.
        </span>
      </li>
      <li
        style={{
          ...styles.listItem,
          
        }}
      >
        <span
          aria-hidden="true"
          style={{ ...styles.badge, background: "#eef2ff", color: "#3730a3" }}
        >
          🔐
        </span>
        <span>
          <strong>Identidad y firma digital.</strong> Autenticación con biometría o ClaveÚnica y firma certificada con validez legal.
        </span>
      </li>
      <li
        style={{
          ...styles.listItem,
         
        }}
      >
        <span
          aria-hidden="true"
          style={{ ...styles.badge, background: "#f0f9ff", color: "#075985" }}
        >
          📄
        </span>
        <span>
          <strong>Transparencia y control.</strong> Tasas claras y acceso a contratos y comprobantes desde tu bandeja y correo.
        </span>
      </li>
      <li
        style={{
          ...styles.listItem,
        
        }}
      >
        <span
          aria-hidden="true"
          style={{ ...styles.badge, background: "#fef9c3", color: "#854d0e" }}
        >
          🧪
        </span>
        <span>
          <strong>Demo segura.</strong> Simulación educativa sin impacto financiero real ni uso de datos sensibles.
        </span>
      </li>
    </ul>
  </div>
</section>

      {/* Llamado final */}
      <section style={{ ...styles.section, }}>
        <div style={{ ...styles.container, textAlign: "center" }}>
          <h2 style={{ ...styles.h2, marginBottom: 8 }}>Simula tu préstamo ahora</h2>
          <p style={{ color: "#4b5563", marginBottom: 20 }}>
            Conoce tus opciones en minutos. Es rápido, seguro y 100% online.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={styles.btnPrimary}>
              Comenzar
            </Link>
            <Link to="/login" style={styles.btnSecondary}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div>
            © {new Date().getFullYear()} Créditos Financieros — Proyecto académico. 
            <span style={{ color: "#6661c1ff" }}> Sin fines comerciales.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
