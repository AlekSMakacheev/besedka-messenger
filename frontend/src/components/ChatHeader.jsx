import { theme } from "../styles/theme";
import { getUserColor } from "../utils/getUserColor";
import { Search, Trash2 } from "lucide-react"; // Иконки

function ChatHeader({ receiver, typingUser, searchQuery, onSearch, onDeleteDialog }) {
  const { colors, spacing, radius } = theme;

  return (
    <div style={{ borderBottom: `1px solid ${colors.border}`, padding: `${spacing.md} ${spacing.lg}`, display: "flex", alignItems: "center", gap: spacing.md, background: colors.background }}>
      
      {/* Аватар и имя */}
      <div style={{ width: "40px", height: "40px", borderRadius: radius.round, background: getUserColor(receiver), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        {receiver[0].toUpperCase()}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: "600", fontSize: "16px", color: colors.textMain }}>{receiver}</div>
        {typingUser === receiver && (
          <div style={{ fontSize: "12px", color: colors.primary, fontWeight: "500" }}>печатает...</div>
        )}
      </div>

      {/* Поиск и удаление */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: spacing.sm }}>
        
        {/* Блок поиска с иконкой */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={16} color={colors.textSecondary} style={{ position: "absolute", left: "12px" }} />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            style={{ padding: "8px 14px 8px 34px", borderRadius: "20px", border: `1px solid ${colors.border}`, outline: "none", fontSize: "13px", width: "160px", background: colors.backgroundChat }}
          />
        </div>

        <button
          onClick={onDeleteDialog}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.small,
            color: colors.danger,
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = colors.dangerLight)} // Подсветка при наведении
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
          title="Очистить чат">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;