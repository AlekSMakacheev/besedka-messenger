import { useState } from "react";
import { theme } from "../styles/theme";
import { LogIn } from "lucide-react";

function Login({ onLogin }) {       
  const { colors, radius, spacing } = theme;
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const url = isRegister ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(text || "Ошибка");
        setLoading(false);
        return;
      }

      if (isRegister) {
        const loginRes = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const token = await loginRes.text();
        onLogin(username, token);
      } else {
        onLogin(username, text);
      }
    } catch (err) {
      console.error(err)
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: colors.backgroundChat
      }}
    >
      <form onSubmit={handleSubmit} style={{ background: colors.background, padding: spacing.xl, borderRadius: radius.large, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", width: "100%", maxWidth: "340px", border: `1px solid ${colors.border}` }}>
        
        <div style={{ padding: "16px", textAlign: "center", marginBottom: spacing.xl }}>
          <div style={{ width: "60px", height: "60px", background: colors.primaryLight, color: colors.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <LogIn size={30} />
          </div>
          <h2 style={{ color: colors.textMain, margin: 0, fontSize: "22px" }}>{isRegister ? "Регистрация" : "Вход"}</h2>
        </div>

        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px 14px", marginBottom: spacing.md, border: `1px solid ${colors.border}`, borderRadius: radius.small, fontSize: "14px", outline: "none", background: colors.backgroundChat, boxSizing: "border-box" }} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 14px", marginBottom: spacing.md, border: `1px solid ${colors.border}`, borderRadius: radius.small, fontSize: "14px", outline: "none", background: colors.backgroundChat, boxSizing: "border-box" }} />

        {error && <div style={{ color: colors.danger, fontSize: "13px", marginBottom: spacing.md, textAlign: "center", background: colors.dangerLight, padding: "8px", borderRadius: radius.small }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: colors.primary, color: "white", border: "none", borderRadius: radius.small, cursor: "pointer", fontSize: "15px", fontWeight: "bold", transition: "background 0.2s" }}>
          {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
        </button>

        <div style={{ marginTop: spacing.lg, textAlign: "center", fontSize: "13px", color: colors.textSecondary }}>
          {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
          <span onClick={() => { setIsRegister(!isRegister); setError(""); }} style={{ color: colors.primary, cursor: "pointer", fontWeight: "bold" }}>
            {isRegister ? "Войти" : "Зарегистрироваться"}
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;