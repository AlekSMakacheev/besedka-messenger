import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { formatLastSeen } from "../utils/formatDate";
import { theme } from "../styles/theme";
import { getUserColor } from "../utils/getUserColor";
import { Search, LogOut } from "lucide-react";

function Contacts({ onSelect, selectedUser, refreshKey, onlineUsers, username, onLogout }) {
  const { colors, spacing, radius } = theme;
  const [contacts, setContacts] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await apiFetch("/messages/contacts");
        const data = await res.json();
        setContacts(data);
      } catch (error) {
        console.error("Failed to load contacts:", error);
      }
    };
    loadContacts();
  }, [refreshKey]);

  const handleSearch = async () => {
    setSearchError("");
    setFoundUser(null);
    if (!searchUsername.trim()) return;
    if (searchUsername.trim() === username) {
      setSearchError("Это вы");
      return;
    }
    setSearching(true);
    try {
      const res = await apiFetch(`/users/search?username=${searchUsername.trim()}`);
      if (!res.ok) {
        setSearchError("Пользователь не найден");
        setSearching(false);
        return;
      }
      const data = await res.json();
      setFoundUser(data);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError("Ошибка поиска");
    }
    setSearching(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: colors.background }}>
      
      {/* Поиск */}
      <div style={{ padding: spacing.md, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", gap: spacing.xs }}>
          <input
            type="text"
            placeholder="Найти по username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            style={{ flex: 1, padding: "8px 12px", border: `1px solid ${colors.border}`, borderRadius: radius.small, outline: "none", fontSize: "13px", background: colors.backgroundChat }}
          />
          <button onClick={handleSearch} disabled={searching} style={{ padding: "8px 12px", background: colors.primary, color: "white", border: "none", borderRadius: radius.small, cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Search size={16} />
          </button>
        </div>

        {searchError && <div style={{ color: colors.danger, fontSize: "12px", marginTop: "6px" }}>{searchError}</div>}

        {/* Найденный пользователь */}
        {foundUser && (
          <div onClick={() => { onSelect(foundUser.username); setFoundUser(null); setSearchUsername(""); }} style={{ marginTop: spacing.sm, padding: spacing.sm, background: colors.primaryLight, borderRadius: radius.small, cursor: "pointer", display: "flex", alignItems: "center", gap: spacing.sm }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: getUserColor(foundUser.username), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {foundUser.username[0].toUpperCase()}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: colors.primaryDark }}>{foundUser.username} — написать</div>
          </div>
        )}
      </div>

      <h3 style={{ margin: `${spacing.md} ${spacing.md} ${spacing.sm}`, color: colors.textMain, fontSize: "16px" }}>Контакты</h3>

      {/* Список контактов */}
      <div style={{ flex: 1, overflowY: "auto", padding: `0 ${spacing.sm}` }}>
        {contacts.length === 0 && <div style={{ fontSize: "13px", color: colors.textSecondary, textAlign: "center", marginTop: "20px" }}>Нет контактов</div>}
        {contacts.map((contact) => (
          <div key={contact.username} onClick={() => onSelect(contact.username)} style={{ cursor: "pointer", padding: spacing.sm, borderRadius: radius.medium, marginBottom: "4px", backgroundColor: selectedUser === contact.username ? colors.primaryLight : "transparent", display: "flex", alignItems: "center", gap: spacing.sm }}>
            <div style={{ position: "relative", width: "44px", height: "44px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: getUserColor(contact.username), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>
                {contact.username[0].toUpperCase()}
              </div>
              {onlineUsers.includes(contact.username) && <div style={{ position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: "600", fontSize: "14px", color: colors.textMain }}>{contact.username}</div>
                <div style={{ fontSize: "11px", color: colors.textSecondary }}>{contact.lastMessageTime && new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div style={{ fontSize: "12px", color: colors.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>{contact.lastMessage || "Нет сообщений"}</div>
              <div style={{ fontSize: "11px", color: onlineUsers.includes(contact.username) ? colors.primary : colors.textSecondary, marginTop: "2px" }}>
                {onlineUsers.includes(contact.username) ? "● В сети" : `был(а) ${formatLastSeen(contact.lastSeenAt)}`}
              </div>
            </div>
            
            {contact.unreadCount > 0 && <div style={{ background: colors.primary, color: "white", borderRadius: "12px", minWidth: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", padding: "0 6px", fontWeight: "bold" }}>{contact.unreadCount}</div>}
          </div>
        ))}
      </div>

      {/* Кнопка Выйти */}
      <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}` }}>
        <button onClick={onLogout} style={{ width: "100%", padding: "10px", background: colors.dangerLight, color: colors.danger, border: "none", borderRadius: radius.small, cursor: "pointer", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </div>
  );
}

export default Contacts;