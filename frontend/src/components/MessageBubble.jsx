import { theme } from "../styles/theme";
import { Pencil, Trash2 } from "lucide-react";

function MessageBubble({ msg, isMe, onEdit, onDelete }) {
  const { colors, radius, spacing } = theme;

  return (
    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: spacing.sm }}>
      <div
        style={{
          background: isMe ? colors.bubbleMyGradient : colors.bubbleOther,
          color: isMe ? colors.textOnPrimary : colors.textMain,
          padding: "10px 14px",
          borderRadius: radius.large,
          borderBottomRightRadius: isMe ? "4px" : radius.large,
          borderBottomLeftRadius: isMe ? radius.large : "4px",
          maxWidth: "70%",
          wordBreak: "break-word",
          boxShadow: isMe ? colors.bubbleMyShadow : "0 1px 2px rgba(0,0,0,0.05)",
          border: isMe ? "1px solid #e9d5ff" : "none",
        }}
      >
        
        {msg.content} 
        
        {msg.edited && <span style={{ fontSize: "10px", opacity: 0.8, marginLeft: "6px" }}>(edited)</span>}

        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px" }}>
          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && <span>{msg.read ? "✓✓" : "✓"}</span>}
        </div>

        {isMe && (
          <div style={{ display: "flex", gap: "8px", marginTop: "6px", justifyContent: "flex-end" }}>
            <button onClick={() => onEdit(msg)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textOnPrimary, opacity: 0.7, padding: 0 }}>
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.danger, opacity: 0.9, padding: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;