import { useState, useEffect, useRef, useCallback } from "react";
import { createWebSocketClient } from "./services/websocket";
import Chat from "./components/Chat";
import Contacts from "./components/Contacts";
import Login from "./pages/Login";

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshContacts, setRefreshContacts] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isMobile, setIsMobile] = useState(() => 
    window.matchMedia("(max-width: 768px)").matches
  );

  const refreshTimeout = useRef(null);

   useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    
    const handleChange = (e) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const triggerRefresh = useCallback(() => {
    clearTimeout(refreshTimeout.current);
    refreshTimeout.current = setTimeout(() => {
      setRefreshContacts(v => v + 1);
    }, 300);
  }, []);

  const params = new URLSearchParams(window.location.search);
  const urlUser = params.get("user");
  const urlToken = params.get("token");

  const [username, setUsername] = useState(urlUser || localStorage.getItem("username"));
  const [token, setToken] = useState(urlToken || localStorage.getItem("token"));

  useEffect(() => {
    if (urlUser && urlToken) {
      localStorage.setItem("username", urlUser);
      localStorage.setItem("token", urlToken);
    }
  }, [urlUser, urlToken]);

  const handleLogin = (user, tok) => {
    localStorage.setItem("username", user);
    localStorage.setItem("token", tok);
    setUsername(user);
    setToken(tok);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setSelectedUser(null);
    setUsername(null);
    setToken(null);
  };

  useEffect(() => {
    if (!token) return;

    const client = createWebSocketClient(token, (client) => {
      client.subscribe("/topic/status", (msg) => {
        const { user, status } = JSON.parse(msg.body);
        setOnlineUsers((prev) =>
          status === "ONLINE"
            ? prev.includes(user) ? prev : [...prev, user]
            : prev.filter((u) => u !== user)
        );
        if (status === "OFFLINE") triggerRefresh();
      });
      setStompClient(client);
    });

    client.activate();

    return () => {
      if (client.active) client.deactivate();
      clearTimeout(refreshTimeout.current);
    };
  }, [token, triggerRefresh]);

  if (!token || !username) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100dvh",
      paddingTop: "env(safe-area-inset-top)",
      overflow: "hidden",
      backgroundColor: "#ffffff"
      }}>
      {/* На мобильном скрываем контакты, если чат открыт */}
      {(!isMobile || !selectedUser) && (
        <div style={{ 
          width: isMobile ? "100%" : "300px", 
          borderRight: isMobile ? "none" : "1px solid #e5e7eb", 
          display: "flex", 
          flexDirection: "column" 
        }}>
          <Contacts
            onSelect={setSelectedUser}
            selectedUser={selectedUser}
            refreshKey={refreshContacts}
            onlineUsers={onlineUsers}
            username={username}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* На мобильном показываем чат на весь экран, если он выбран */}
      {(!isMobile || selectedUser) && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Chat
            key={selectedUser}
            receiver={selectedUser}
            onContactUpdate={triggerRefresh}
            wsClient={stompClient}
            username={username}
            onBack={() => setSelectedUser(null)} // Передаем кнопку "Назад"
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}

export default App;