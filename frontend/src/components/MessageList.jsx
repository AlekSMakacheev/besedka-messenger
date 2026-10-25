import MessageBubble from "./MessageBubble";

function MessageList({
  messages,
  searchQuery,
  searchResults,
  username,
  onEdit,
  onDelete,
  bottomRef,
}) {
  const list = searchQuery ? searchResults : messages;

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {list.map((msg) => {
        const isMe = msg.sender?.username === username;
        return (
          <MessageBubble
            key={msg.id || msg.tempId}
            msg={msg}
            isMe={isMe}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;