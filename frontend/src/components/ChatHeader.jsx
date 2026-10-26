import { theme } from "../styles/theme";
import { getUserColor } from "../utils/getUserColor";
import { Search, Trash2, ChevronLeft } from "lucide-react";

function ChatHeader({ receiver, typingUser, searchQuery, onSearch, onDeleteDialog, onBack, isMobile }) {
  const { colors, spacing, radius } = theme;

  return (
    <div style={{ borderBottom: `1px solid ${colors.border}`, padding: `${spacing.sm} ${spacing.md}`, display: "flex", alignItems: "center", gap: spacing.sm, background: colors.background }}>
      
      {/* Кнопка назад (видна только на телефоне) */}
      {isMobile && onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: colors.textMain }}>
          <ChevronLeft size={24} />
        </button>
      )}

      <div style={{ width: "36px", height: "36px", borderRadius: radius.round, background: getUserColor(receiver), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
        {receiver[0].toUpperCase()}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontWeight: "600", fontSize: "15px", color: colors.textMain }}>{receiver}</div>
        {typingUser === receiver && (
          <div style={{ fontSize: "11px", color: colors.primary }}>печатает...</div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Прячем поиск на мобильных, чтобы не было тесно */}
        {!isMobile && (
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} color={colors.textSecondary} style={{ position: "absolute", left: "10px" }} />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              style={{ padding: "6px 12px 6px 30px", borderRadius: "20px", border: `1px solid ${colors.border}`, outline: "none", fontSize: "12px", width: "130px", background: colors.backgroundChat }}
            />
          </div>
        )}

        <button onClick={onDeleteDialog} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: colors.danger }}>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;