import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../services/api";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

function Chat({
  receiver,
  onContactUpdate,
  wsClient,
  username,
  onBack,
  isMobile
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const bottomRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const lastTypingSendRef = useRef(0);
  const typingTimeoutRef = useRef(null);

  const sendTypingEvent = (isTyping) => {
    if (!receiver || !wsClient || !wsClient.connected) return;
    wsClient.publish({
      destination: "/app/typing",
      body: JSON.stringify({ sender: username, receiver, typing: isTyping }),
    });
  };

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingSendRef.current > 2000) {
      lastTypingSendRef.current = now;
      sendTypingEvent(true);
    }
    clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      sendTypingEvent(false);
    }, 3000);
  };

  const handleEditMessage = (msg) => {
    const newContent = window.prompt("Edit message:", msg.content);
    if (newContent && newContent.trim() !== msg.content) {
      apiFetch(`/messages/${msg.id}`, {
        method: "PUT",
        body: JSON.stringify({ content: newContent.trim() }),
      }).catch(err => console.error("Failed to edit message:", err));
    }
  };

  const handleDeleteMessage = (id) => {
    if (window.confirm("Delete this message?")) {
      apiFetch(`/messages/${id}`, {
        method: "DELETE",
      }).catch(err => console.error("Failed to delete message:", err));
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim() || !receiver) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await apiFetch(`/messages/search?q=${encodeURIComponent(query)}&with=${receiver}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleDeleteDialog = async () => {
    if (!receiver) return;
    if (window.confirm(`Delete all messages with ${receiver}?`)) {
      try {
        await apiFetch(`/messages/dialog/${receiver}`, {
          method: "DELETE",
        });
        setMessages([]);
        onContactUpdate?.();
      } catch (error) {
        console.error("Failed to delete dialog:", error);
      }
    }
  };

  const markMessagesAsRead = async () => {
    if (!receiver) return;
    try {
      await apiFetch(`/messages/read/${receiver}`, {
        method: "POST",
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender?.username === receiver ? { ...msg, read: true } : msg
        )
      );
      onContactUpdate?.();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Загрузка истории сообщений
  useEffect(() => {
    if (!receiver) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/messages/chat?user=${receiver}`);
        const data = await res.json();
        setMessages(data);
        await markMessagesAsRead();
        onContactUpdate?.();
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [receiver]);

  // WebSocket соединение
  useEffect(() => {
    if (!wsClient || !wsClient.connected) return;

    const subChat = wsClient.subscribe(`/topic/chat/${username}`, (msg) => {
      const data = JSON.parse(msg.body);

      if (data.type === "DELETE") {
        setMessages((prev) => prev.filter((m) => m.id !== data.id));
        return;
      }

      const message = data;
      setMessages((prev) => {
        const exists = prev.find(
          (m) =>
            (m.id && m.id === message.id) ||
            (m.tempId && m.tempId === message.tempId)
        );

        if (exists) {
          return prev.map((m) =>
            (m.id && m.id === message.id) ||
            (m.tempId && m.tempId === message.tempId)
              ? message
              : m
          );
        } else {
          return [...prev, message];
        }
      });

      if (message.sender?.username === receiver) {
        markMessagesAsRead();
      } else {
        onContactUpdate?.();
      }
    });

    const subRead = wsClient.subscribe(`/topic/chat/read/${username}`, (msg) => {
      const notification = JSON.parse(msg.body);
      if (notification.reader === receiver) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?.username === username && m.receiver?.username === receiver
              ? { ...m, read: true }
              : m
          )
        );
      }
    });

    const subTyping = wsClient.subscribe(`/topic/typing/${username}`, (msg) => {
      const data = JSON.parse(msg.body);
      if (data.sender === receiver && data.typing) {
        setTypingUser(data.sender);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else if (data.sender === receiver && !data.typing) {
        setTypingUser(null);
      }
    });

    return () => {
      subChat.unsubscribe();
      subRead.unsubscribe();
      subTyping.unsubscribe();
    };
  }, [wsClient, username, receiver, onContactUpdate]);

  // Очистка таймеров
  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Автоскролл
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!receiver || !text || !wsClient || !wsClient.connected) return;

    const tempId = Date.now();

    const newMessage = {
      tempId,
      content: text,
      sender: { username },
      receiver: { username: receiver },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    wsClient.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({
        content: text,
        receiver: { username: receiver },
        tempId,
      }),
    });

    setText("");
    clearTimeout(typingDebounceRef.current);
    sendTypingEvent(false);
  };

  const handleStopTyping = () => {
    clearTimeout(typingDebounceRef.current);
    sendTypingEvent(false);
  };

  if (!receiver) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#888",
          fontSize: "16px",
        }}
      >
        Выберите контакт или создайте новый чат
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ChatHeader
        receiver={receiver}
        typingUser={typingUser}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onDeleteDialog={handleDeleteDialog}
        onBack={onBack} 
        isMobile={isMobile}   
      />

      <MessageList
        messages={messages}
        searchQuery={searchQuery}
        searchResults={searchResults}
        username={username}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        bottomRef={bottomRef}
      />

      <MessageInput
        text={text}
        setText={setText}
        onSend={sendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}

export default Chat;