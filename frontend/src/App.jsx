import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "./services/api";
import { createWebSocketClient } from "./services/websocket";
import Chat from "./components/Chat";
import Contacts from "./components/Contacts";
import Login from "./pages/Login";

function App() {

  const[selectedUser, setSelectedUser] = useState(null);
  const [refreshContacts, setRefreshContacts] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  const refreshTimeout = useRef(null);

  const triggerRefresh = useCallback(() => {
    clearTimeout(refreshTimeout.current);
    refreshTimeout.current = setTimeout(() => {
      setRefreshContacts(v => v + 1);
    }, 300);
  }, []);

  // Пытаемся взять токен из URL, если нет — из localStorage
  const params = new URLSearchParams(window.location.search);
  const urlUser = params.get("user");
  const urlToken = params.get("token");

  const [username, setUsername] = useState(urlUser || localStorage.getItem("username"));
  const [token, setToken] = useState(urlToken || localStorage.getItem("token"));

  // Сохраняем в localStorage при получении из URL
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
    setUsername(null);
    setToken(null);
  };
  

  // WebSocket – один на всё приложение
  useEffect(() => {
    const client = createWebSocketClient(token, (client) => {
      
      // Подписка на статусы онлайн
      client.subscribe("/topic/status", (msg) => {
        const { user, status } = JSON.parse(msg.body);
        setOnlineUsers((prev) =>
          status === "ONLINE"
            ? prev.includes(user) ? prev : [...prev, user]
            : prev.filter((u) => u !== user)
        );
        if(status === "OFFLINE") {
          triggerRefresh();
        }
      });

      apiFetch("/users/online")
          .then(res => res.json())
          .then(data => setOnlineUsers(data))
          .catch(err => console.error("Failed to load online users:", err));

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
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", borderRight: "1px solid #ddd", padding: "10px" }}>
        <Contacts
          onSelect={(username) => {
            localStorage.setItem('selectedContact', username);
            setSelectedUser(username);
          }}
          selectedUser={selectedUser}
          refreshKey={refreshContacts}
          onlineUsers={onlineUsers}
          token={token}
          username={username}
          onLogout={handleLogout}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Chat
          receiver={selectedUser}
          onContactUpdate={triggerRefresh}
          wsClient={stompClient}
          
          username={username}
        />
      </div>
    </div>
  );
}

export default App;