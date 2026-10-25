package backend.config;

import backend.service.OnlineUserService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
public class WebSocketEventListener {

  private final OnlineUserService onlineUserService;
  private final SimpMessagingTemplate messagingTemplate;


  public WebSocketEventListener(OnlineUserService onlineUserService, SimpMessagingTemplate messagingTemplate) {
    this.onlineUserService = onlineUserService;
    this.messagingTemplate = messagingTemplate;
  }

  @EventListener
  public void handleWebSocketConnectListener(SessionConnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

    //System.out.println("USER = " + accessor.getUser());

    //System.out.println(
           // "SESSION ATTRIBUTES = "
           //         + accessor.getSessionAttributes()
    //);
    Map<String, Object> attrs = accessor.getSessionAttributes();

      if (attrs != null) {
        String username = (String) attrs.get("username");
        System.out.println("🟢 ONLINE: " + username);
        onlineUserService.userConnected(username);

        messagingTemplate.convertAndSend("/topic/status",
                Map.of("user", username, "status", "ONLINE"));
      }
  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    Map<String, Object> attrs = accessor.getSessionAttributes();
    if (attrs != null) {
      String username = (String) attrs.get("username");
      System.out.println("🔴 OFFLINE: " + username);
      onlineUserService.updateLastSeen(username);
      onlineUserService.userDisconnected(username);
      messagingTemplate.convertAndSend("/topic/status",
              Map.of("user", username, "status", "OFFLINE"));
    }
  }

}
