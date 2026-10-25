package backend.config;

import backend.service.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

  private final JwtService jwtService;

  public JwtChannelInterceptor(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {

    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

    System.out.println("COMMAND: " + accessor.getCommand());

    // 🔐 CONNECT — вытаскиваем JWT
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {

      String authHeader = accessor.getFirstNativeHeader("Authorization");

      System.out.println("AUTH HEADER: " + authHeader);

      if (authHeader != null && authHeader.startsWith("Bearer ")) {

        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);

        System.out.println("SETTING USER: " + username);

        Principal principal = () -> username;

        accessor.setUser(principal);
        accessor.setLeaveMutable(true);

        // 💾 сохраняем в session
        accessor.getSessionAttributes().put("username", username);
      }
    }

    // 🔁 ВСЕ ОСТАЛЬНЫЕ СООБЩЕНИЯ (SEND, SUBSCRIBE)
    else {

      if (accessor.getUser() == null) {

        String username = (String) accessor.getSessionAttributes().get("username");

        if (username != null) {

          System.out.println("RESTORE USER: " + username);

          accessor.setUser(() -> username);
          accessor.setLeaveMutable(true);
        }
      }
    }

    return message;
  }
}