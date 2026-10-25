import { theme } from "../styles/theme";

function MessageInput({ text, setText, onSend, onTyping, onStopTyping }) {
  const { colors, radius, spacing } = theme;

  return (
    <div
      style={{
        display: "flex",
        padding: spacing.md,
        borderTop: `1px solid ${colors.border}`,
        gap: spacing.sm,
        background: colors.background,
        alignItems: "center",
      }}
    >
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
            onStopTyping();
          }
        }}
        placeholder="Напишите сообщение..."
        style={{
          flex: 1,
          padding: "12px 18px",
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          outline: "none",
          fontSize: "14px",
          background: colors.backgroundChat,
          color: colors.textMain,
          transition: "border 0.2s",
        }}
        onFocus={(e) => (e.target.style.border = `1px solid ${colors.primary}`)}
        onBlur={(e) => (e.target.style.border = `1px solid ${colors.border}`)}
      />

      <button
        onClick={onSend}
        style={{
          width: "46px",
          height: "46px",
          borderRadius: radius.round,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          padding: 0,
          paddingLeft: "4px", 
          backgroundColor: colors.primary, 
          color: "#ffffff", 
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(15, 118, 110, 0.4)",
          transition: "transform 0.1s, filter 0.2s",
          appearance: "none",
          WebkitAppearance: "none", 
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ➤
      </button>
    </div>
  );
}

export default MessageInput;